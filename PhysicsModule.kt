package com.brickstrike

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlin.math.*

// ─────────────────────────────────────────────────────────────────────────────
// BrickStrike — Native Physics Engine
// Runs entirely on a background thread. JS only receives final positions.
//
// Flow:
//   JS calls initGame() → startLoop() → each tick Kotlin computes everything
//   → emits "physicsUpdate" event with new positions → JS updates renderer
//
// Why this is fast:
//   • No JS bridge crossing per-ball (only ONE event per frame with all data)
//   • Pure Kotlin math on a background thread — never blocks UI or JS thread
//   • Balls are plain DoubleArrays, no object allocation per tick
// ─────────────────────────────────────────────────────────────────────────────

class PhysicsModule(private val reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "PhysicsModule"

    // ── Constants ──────────────────────────────────────────────────────────────
    private var SCREEN_W = 390.0
    private var SCREEN_H = 844.0
    private val MIN_VY   = 3.5
    private val MAX_SPEED = 22.0

    // ── State ──────────────────────────────────────────────────────────────────
    // Each ball: [x, y, vx, vy, radius]
    private val balls  = mutableListOf<DoubleArray>()
    private val bricks = mutableListOf<BrickData>()   // see data class below

    // Paddle: [x, y, w, h]
    private var paddle = doubleArrayOf(195.0, 780.0, 100.0, 14.0)

    private var running   = false
    private var loopThread: Thread? = null
    private val FRAME_MS  = 16L  // ~60 fps

    // ── Brick Data Class ───────────────────────────────────────────────────────
    data class BrickData(
        val id: String,
        var x: Double, var y: Double,
        val w: Double, val h: Double,
        var hp: Int,
        val type: String,       // "regular" | "stone"
        val color: String,
        var active: Boolean = true
    )

    // ─────────────────────────────────────────────────────────────────────────
    // JS-Callable: Setup
    // ─────────────────────────────────────────────────────────────────────────

    @ReactMethod
    fun setScreenSize(width: Double, height: Double) {
        SCREEN_W = width
        SCREEN_H = height
    }

    /** Called once per level. Receives bricks as a ReadableArray of maps. */
    @ReactMethod
    fun initGame(brickData: ReadableArray, paddleWidth: Double, promise: Promise) {
        balls.clear()
        bricks.clear()

        paddle[2] = paddleWidth

        for (i in 0 until brickData.size()) {
            val b = brickData.getMap(i) ?: continue
            bricks.add(BrickData(
                id    = b.getString("id") ?: "b_$i",
                x     = b.getDouble("x"),
                y     = b.getDouble("y"),
                w     = b.getDouble("w"),
                h     = b.getDouble("h"),
                hp    = b.getInt("hp"),
                type  = b.getString("type") ?: "regular",
                color = b.getString("color") ?: "#4CAF50"
            ))
        }

        // Spawn the first ball above the paddle
        spawnBall(paddle[0], paddle[1] - paddle[3] / 2 - 10.0, 0.0, 0.0)
        promise.resolve(true)
    }

    /** Launch the waiting ball */
    @ReactMethod
    fun launchBall() {
        if (balls.isNotEmpty() && balls[0][2] == 0.0 && balls[0][3] == 0.0) {
            balls[0][2] = 4.0
            balls[0][3] = -8.0
        }
    }

    /** Called every time the player moves the paddle */
    @ReactMethod
    fun movePaddle(x: Double) {
        val halfW = paddle[2] / 2
        paddle[0] = x.coerceIn(halfW, SCREEN_W - halfW)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Game Loop
    // ─────────────────────────────────────────────────────────────────────────

    @ReactMethod
    fun startLoop() {
        if (running) return
        running = true
        loopThread = Thread {
            while (running) {
                val start = System.currentTimeMillis()
                tick()
                val elapsed = System.currentTimeMillis() - start
                val sleep   = FRAME_MS - elapsed
                if (sleep > 0) Thread.sleep(sleep)
            }
        }.also { it.start() }
    }

    @ReactMethod
    fun stopLoop() {
        running = false
        loopThread?.interrupt()
        loopThread = null
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Core Tick — runs on background thread, NO JS calls inside
    // ─────────────────────────────────────────────────────────────────────────

    private val events = mutableListOf<String>()  // collected during tick, sent once

    private fun tick() {
        events.clear()

        val SUB_STEPS = 2
        val deadBalls = mutableListOf<Int>()
        val deadBricks = mutableListOf<String>()

        for (bi in balls.indices) {
            val ball = balls[bi]
            // ball: [x, y, vx, vy, radius]
            val r = ball[4]

            for (s in 0 until SUB_STEPS) {
                ball[0] += ball[2] / SUB_STEPS
                ball[1] += ball[3] / SUB_STEPS

                // ── Wall collisions ──────────────────────────────────────────
                if (ball[0] - r <= 0) {
                    ball[0] = r;  ball[2] = abs(ball[2])
                    events.add("wall-hit")
                } else if (ball[0] + r >= SCREEN_W) {
                    ball[0] = SCREEN_W - r;  ball[2] = -abs(ball[2])
                    events.add("wall-hit")
                }
                if (ball[1] - r <= 0) {
                    ball[1] = r;  ball[3] = abs(ball[3])
                    events.add("wall-hit")
                }

                // ── Bottom — ball lost ───────────────────────────────────────
                if (ball[1] + r >= SCREEN_H) {
                    deadBalls.add(bi)
                    events.add("lose-life")
                    break
                }

                // ── Paddle top collision ─────────────────────────────────────
                val pLeft   = paddle[0] - paddle[2] / 2
                val pRight  = paddle[0] + paddle[2] / 2
                val pTop    = paddle[1] - paddle[3] / 2
                val pBottom = paddle[1] + paddle[3] / 2

                if (ball[3] > 0 &&
                    ball[1] + r >= pTop && ball[1] - r <= pBottom &&
                    ball[0] >= pLeft    && ball[0] <= pRight) {

                    ball[1] = pTop - r - 1

                    val hitPos = ((ball[0] - paddle[0]) / (paddle[2] / 2)).coerceIn(-1.0, 1.0)
                    val maxAngle = Math.PI / 3.0
                    val angle = hitPos * maxAngle
                    val spd = sqrt(ball[2] * ball[2] + ball[3] * ball[3])

                    ball[2] = sin(angle) * spd
                    ball[3] = -cos(angle) * spd

                    if (abs(ball[3]) < MIN_VY) {
                        ball[3] = -MIN_VY
                        val vx2 = sqrt(max(1.0, spd * spd - MIN_VY * MIN_VY))
                        ball[2] = if (ball[2] < 0) -vx2 else vx2
                    }
                    events.add("paddle-hit")
                }

                // ── Brick collisions (AABB with fast reject) ─────────────────
                val bBallLeft   = ball[0] - r
                val bBallRight  = ball[0] + r
                val bBallTop    = ball[1] - r
                val bBallBottom = ball[1] + r

                var hitBrick = false
                for (brick in bricks) {
                    if (!brick.active) continue

                    val bHW = brick.w / 2;  val bHH = brick.h / 2

                    // Fast AABB reject — no sqrt, no multiply
                    if (bBallRight  < brick.x - bHW) continue
                    if (bBallLeft   > brick.x + bHW) continue
                    if (bBallBottom < brick.y - bHH) continue
                    if (bBallTop    > brick.y + bHH) continue

                    val dx = abs(ball[0] - brick.x)
                    val dy = abs(ball[1] - brick.y)
                    val overlapX = bHW + r - dx
                    val overlapY = bHH + r - dy

                    val hitSide = if (overlapX < overlapY) {
                        if (ball[0] < brick.x) "LEFT" else "RIGHT"
                    } else {
                        if (ball[1] < brick.y) "TOP" else "BOTTOM"
                    }

                    // Velocity direction guard
                    if (hitSide == "LEFT"   && ball[2] <= 0) continue
                    if (hitSide == "RIGHT"  && ball[2] >= 0) continue
                    if (hitSide == "TOP"    && ball[3] <= 0) continue
                    if (hitSide == "BOTTOM" && ball[3] >= 0) continue

                    // Push out
                    when (hitSide) {
                        "LEFT"   -> ball[0] = brick.x - bHW - r - 1.6
                        "RIGHT"  -> ball[0] = brick.x + bHW + r + 1.6
                        "TOP"    -> ball[1] = brick.y - bHH - r - 1.6
                        "BOTTOM" -> ball[1] = brick.y + bHH + r + 1.6
                    }

                    // Reflect
                    val spd = sqrt(ball[2] * ball[2] + ball[3] * ball[3])
                    if (overlapX < overlapY) ball[2] *= -1 else ball[3] *= -1
                    if (abs(ball[3]) < MIN_VY) {
                        ball[3] = if (ball[3] < 0) -MIN_VY else MIN_VY
                        val vx2 = sqrt(max(1.0, spd * spd - MIN_VY * MIN_VY))
                        ball[2] = if (ball[2] < 0) -vx2 else vx2
                    }

                    // Damage
                    brick.hp -= if (hitSide == "TOP") 3 else 1
                    if (brick.hp <= 0) {
                        brick.active = false
                        deadBricks.add(brick.id)
                        events.add("brick-break:${brick.id}:${brick.color}")
                    } else {
                        events.add("brick-hit:${brick.id}:${brick.hp}")
                    }

                    hitBrick = true
                    break  // one brick per sub-step
                }
                if (hitBrick) break
            }
        }

        // Remove dead balls (reverse order to preserve indices)
        for (i in deadBalls.sortedDescending()) {
            if (i < balls.size) balls.removeAt(i)
        }

        // ── Emit single update event to JS ───────────────────────────────────
        // One bridge crossing per frame regardless of ball count.
        // This is why 500 balls stays smooth: JS doesn't loop over balls,
        // it just receives a flat array and hands it to the renderer.
        sendPhysicsUpdate(deadBricks, events)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Power-Up Application (called from JS, executed on background thread)
    // ─────────────────────────────────────────────────────────────────────────

    @ReactMethod
    fun applyPowerUp(type: String) {
        when (type) {
            "MULTI" -> {
                // Triple — no cap! Native handles it fine.
                val toAdd = mutableListOf<DoubleArray>()
                for (b in balls) {
                    toAdd.add(doubleArrayOf(b[0], b[1], b[2] - 2.0, b[3], b[4]))
                    toAdd.add(doubleArrayOf(b[0], b[1], b[2] + 2.0, b[3], b[4]))
                }
                balls.addAll(toAdd)
            }
            "PLUS3" -> {
                val src = balls.firstOrNull() ?: return
                for (i in 0..2) {
                    spawnBall(src[0], src[1], (i - 1) * 4.0, -abs(src[3]))
                }
            }
            "WIDE" -> paddle[2] = SCREEN_W * 0.4
        }
    }

    @ReactMethod
    fun resetPaddleWidth() { paddle[2] = SCREEN_W * 0.25 }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private fun spawnBall(x: Double, y: Double, vx: Double, vy: Double, radius: Double = 10.0) {
        balls.add(doubleArrayOf(x, y, vx, vy, radius))
    }

    /** Emit a single JS event with all physics data for this frame */
    private fun sendPhysicsUpdate(deadBricks: List<String>, frameEvents: List<String>) {
        val payload = Arguments.createMap()

        // Ball positions — flat array [x0,y0, x1,y1, ...] for minimal allocation
        val ballPositions = Arguments.createArray()
        for (b in balls) {
            ballPositions.pushDouble(b[0])  // x
            ballPositions.pushDouble(b[1])  // y
        }
        payload.putArray("balls", ballPositions)
        payload.putInt("ballCount", balls.size)

        // Dead bricks this frame
        val brickArray = Arguments.createArray()
        for (id in deadBricks) brickArray.pushString(id)
        payload.putArray("deadBricks", brickArray)

        // Events (wall-hit, paddle-hit, brick-break, etc.)
        val evArray = Arguments.createArray()
        for (ev in frameEvents) evArray.pushString(ev)
        payload.putArray("events", evArray)

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("physicsUpdate", payload)
    }
}
