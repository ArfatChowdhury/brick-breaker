package com.brickstrike

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlin.math.*
import java.util.concurrent.locks.ReentrantLock

// ─────────────────────────────────────────────────────────────────────────────
// BrickStrike — Native Physics Engine
// Optimized Kotlin Implementation (Verified Professional Version)
// ─────────────────────────────────────────────────────────────────────────────

class PhysicsModule(private val reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "PhysicsModule"

    // ── Required by NativeEventEmitter ────────────────────────────────────────
    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}

    // ── Constants ──────────────────────────────────────────────────────────────
    private var SCREEN_W  = 390.0
    private var SCREEN_H  = 844.0
    private val MIN_VY    = 3.5
    private val FRAME_MS  = 16L

    // ── Single lock for both balls and bricks — eliminates deadlock risk ─────
    private val lock = ReentrantLock()

    // ── State ──────────────────────────────────────────────────────────────────
    private val balls  = mutableListOf<DoubleArray>() // [x, y, vx, vy, radius]
    private val bricks = mutableListOf<BrickData>()

    private var paddle    = doubleArrayOf(195.0, 780.0, 100.0, 14.0) // [x, y, w, h]
    private var running   = false
    private var fireMode  = false
    private var isWaiting = true
    private var loopThread: Thread? = null

    data class BrickData(
        val id: String,
        var x: Double, var y: Double,
        val w: Double, val h: Double,
        var hp: Int,
        val type: String,
        val color: String,
        var active: Boolean = true
    )

    // ── JS-Callable: Setup ─────────────────────────────────────────────────────

    @ReactMethod
    fun setScreenSize(width: Double, height: Double) {
        SCREEN_W   = width
        SCREEN_H   = height
        paddle[1]  = SCREEN_H * 0.85
    }

    @ReactMethod
    fun initGame(
        brickData: ReadableArray,
        paddleWidth: Double,
        initialPaddleX: Double,
        promise: Promise
    ) {
        lock.lock()
        try {
            balls.clear()
            bricks.clear()
            for (i in 0 until brickData.size()) {
                val b = brickData.getMap(i) ?: continue
                bricks.add(BrickData(
                    id    = b.getString("id")    ?: "b_$i",
                    x     = b.getDouble("x"),
                    y     = b.getDouble("y"),
                    w     = b.getDouble("w"),
                    h     = b.getDouble("h"),
                    hp    = b.getInt("hp"),
                    type  = b.getString("type")  ?: "regular",
                    color = b.getString("color") ?: "#4CAF50"
                ))
            }
            paddle[0]  = initialPaddleX
            paddle[2]  = paddleWidth
            isWaiting  = true
            spawnBall(paddle[0], paddle[1] - paddle[3] / 2.0 - 10.0, 0.0, 0.0)
        } finally {
            lock.unlock()
        }
        promise.resolve(true)
    }

    @ReactMethod
    fun launchBall() {
        lock.lock()
        try {
            if (isWaiting && balls.isNotEmpty()) {
                isWaiting   = false
                balls[0][2] = 4.0
                balls[0][3] = -8.0
            }
        } finally { lock.unlock() }
    }

    @ReactMethod
    fun setWaitingState(waiting: Boolean) { isWaiting = waiting }

    @ReactMethod
    fun movePaddle(x: Double) {
        val halfW  = paddle[2] / 2.0
        paddle[0]  = x.coerceIn(halfW, SCREEN_W - halfW)
    }

    @ReactMethod
    fun setFireMode(active: Boolean) { fireMode = active }

    @ReactMethod
    fun triggerExplosion(x: Double, y: Double, radius: Double) {
        lock.lock()
        try {
            for (brick in bricks) {
                if (!brick.active || brick.type == "stone") continue
                val dist = sqrt((brick.x - x).pow(2.0) + (brick.y - y).pow(2.0))
                if (dist < radius) brick.active = false
            }
        } finally { lock.unlock() }
    }

    @ReactMethod
    fun applyPowerUp(type: String) {
        lock.lock()
        try {
            when (type) {
                "MULTI" -> {
                    val toAdd = mutableListOf<DoubleArray>()
                    for (b in balls) {
                        toAdd.add(doubleArrayOf(b[0], b[1], b[2] - 2.0, b[3], b[4]))
                        toAdd.add(doubleArrayOf(b[0], b[1], b[2] + 2.0, b[3], b[4]))
                    }
                    balls.addAll(toAdd)
                }
                "PLUS3" -> {
                    val src = balls.firstOrNull() ?: return
                    for (i in 0..2) spawnBall(src[0], src[1], (i - 1) * 4.0, -abs(src[3]))
                }
                "WIDE"  -> paddle[2] = SCREEN_W * 0.4
            }
        } finally { lock.unlock() }
    }

    @ReactMethod
    fun resetPaddleWidth() { paddle[2] = SCREEN_W * 0.25 }

    // ── Game Loop ──────────────────────────────────────────────────────────────

    @ReactMethod
    fun startLoop() {
        if (running) return
        running    = true
        loopThread = Thread {
            while (running) {
                val start   = System.currentTimeMillis()
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

    // ── Core Tick Loop ────────────────────────────────────────────────────────

    private fun tick() {
        val frameEvents = mutableListOf<String>()
        val deadBricks  = mutableListOf<String>()
        val deadBalls   = mutableListOf<Int>()

        lock.lock()
        try {
            if (balls.isEmpty()) return

            // Waiting state: pin ball to paddle, emit position, skip physics
            if (isWaiting) {
                balls[0][0] = paddle[0]
                balls[0][1] = paddle[1] - paddle[3] / 2.0 - balls[0][4] - 2.0
                balls[0][2] = 0.0
                balls[0][3] = 0.0
                sendPhysicsUpdate(emptyList(), emptyList())
                return
            }

            val SUB_STEPS = 2

            for (bi in balls.indices) {
                val ball = balls[bi]
                val r    = ball[4]
                var ballLost = false

                for (s in 0 until SUB_STEPS) {
                    // Explicit math to avoid compilation errors
                    ball[0] = ball[0] + (ball[2] / SUB_STEPS.toDouble())
                    ball[1] = ball[1] + (ball[3] / SUB_STEPS.toDouble())

                    // ── Wall collisions ──────────────────────────────────────
                    if (ball[0] - r <= 0) {
                        ball[0] = r; ball[2] = abs(ball[2])
                        frameEvents.add("wall-hit")
                    } else if (ball[0] + r >= SCREEN_W) {
                        ball[0] = SCREEN_W - r; ball[2] = -abs(ball[2])
                        frameEvents.add("wall-hit")
                    }
                    if (ball[1] - r <= 0) {
                        ball[1] = r; ball[3] = abs(ball[3])
                        frameEvents.add("wall-hit")
                    }

                    // ── Bottom — ball lost ───────────────────────────────────
                    if (ball[1] + r >= SCREEN_H) {
                        deadBalls.add(bi)
                        frameEvents.add("lose-life")
                        ballLost = true
                        break
                    }

                    // ── Paddle collision ─────────────────────────────────────
                    val pLeft   = paddle[0] - paddle[2] / 2.0
                    val pRight  = paddle[0] + paddle[2] / 2.0
                    val pTop    = paddle[1] - paddle[3] / 2.0
                    val pBottom = paddle[1] + paddle[3] / 2.0

                    if (ball[3] > 0 &&
                        ball[1] + r >= pTop   && ball[1] - r <= pBottom &&
                        ball[0]     >= pLeft  && ball[0]     <= pRight) {

                        ball[1] = pTop - r - 1.0
                        val hitPos = ((ball[0] - paddle[0]) / (paddle[2] / 2.0)).coerceIn(-1.0, 1.0)
                        val angle  = hitPos * (Math.PI / 3.0)
                        val spd    = sqrt(ball[2] * ball[2] + ball[3] * ball[3])
                        ball[2]    = sin(angle) * spd
                        ball[3]    = -cos(angle) * spd
                        if (abs(ball[3]) < MIN_VY) {
                            ball[3] = -MIN_VY
                            val vx2 = sqrt(max(1.0, spd * spd - MIN_VY * MIN_VY))
                            ball[2] = if (ball[2] < 0) -vx2 else vx2
                        }
                        frameEvents.add("paddle-hit")
                    }

                    // ── Brick collisions ─────────────────────────────────────
                    val bBallL = ball[0] - r; val bBallR = ball[0] + r
                    val bBallT = ball[1] - r; val bBallB = ball[1] + r

                    var hitBrick = false
                    for (brick in bricks) {
                        if (!brick.active) continue
                        val bHW = brick.w / 2.0; val bHH = brick.h / 2.0

                        if (bBallR < brick.x - bHW || bBallL > brick.x + bHW ||
                            bBallB < brick.y - bHH || bBallT > brick.y + bHH) continue

                        val dx = abs(ball[0] - brick.x); val dy = abs(ball[1] - brick.y)
                        val ox = bHW + r - dx;           val oy = bHH + r - dy
                        val hitSide = if (ox < oy) {
                            if (ball[0] < brick.x) "LEFT" else "RIGHT"
                        } else {
                            if (ball[1] < brick.y) "TOP" else "BOTTOM"
                        }

                        if (hitSide == "LEFT"   && ball[2] <= 0) continue
                        if (hitSide == "RIGHT"  && ball[2] >= 0) continue
                        if (hitSide == "TOP"    && ball[3] <= 0) continue
                        if (hitSide == "BOTTOM" && ball[3] >= 0) continue

                        val nudge = if (fireMode) 6.0 else 1.6
                        when (hitSide) {
                            "LEFT"   -> ball[0] = brick.x - bHW - r - nudge
                            "RIGHT"  -> ball[0] = brick.x + bHW + r + nudge
                            "TOP"    -> ball[1] = brick.y - bHH - r - nudge
                            "BOTTOM" -> ball[1] = brick.y + bHH + r + nudge
                        }

                        if (!fireMode) {
                            val spd = sqrt(ball[2] * ball[2] + ball[3] * ball[3])
                            if (ox < oy) ball[2] = ball[2] * -1.0 else ball[3] = ball[3] * -1.0
                            if (abs(ball[3]) < MIN_VY) {
                                ball[3] = if (ball[3] < 0) -MIN_VY else MIN_VY
                                val vx2 = sqrt(max(1.0, spd * spd - MIN_VY * MIN_VY))
                                ball[2] = if (ball[2] < 0) -vx2 else vx2
                            }
                        }

                        brick.hp -= if (fireMode) 3 else if (hitSide == "TOP") 3 else 1

                        if (brick.hp <= 0) {
                            brick.active = false
                            deadBricks.add(brick.id)
                            frameEvents.add("brick-break:${brick.id}:${brick.color}")
                        } else {
                            frameEvents.add("brick-hit:${brick.id}:${brick.hp}")
                        }

                        hitBrick = true
                        if (!fireMode) break
                    }

                    if (hitBrick && !fireMode) break
                }
            }

            for (i in deadBalls.sortedDescending()) {
                if (i < balls.size) balls.removeAt(i)
            }

            // Sync with triggerExplosion (bricks that were made inactive outside of tick loop)
            for (brick in bricks) {
                if (!brick.active && !deadBricks.contains(brick.id)) {
                    // This brick was killed by explosion and we haven't reported it yet
                    deadBricks.add(brick.id)
                    frameEvents.add("brick-break:${brick.id}:${brick.color}")
                }
            }

        } finally {
            lock.unlock()
        }

        sendPhysicsUpdate(deadBricks, frameEvents)
    }

    private fun spawnBall(x: Double, y: Double, vx: Double, vy: Double, radius: Double = 10.0) {
        balls.add(doubleArrayOf(x, y, vx, vy, radius))
    }

    private fun sendPhysicsUpdate(deadBricks: List<String>, frameEvents: List<String>) {
        val payload    = Arguments.createMap()
        val ballPosArr = Arguments.createArray()

        lock.lock()
        try {
            for (b in balls) { ballPosArr.pushDouble(b[0]); ballPosArr.pushDouble(b[1]) }
        } finally { lock.unlock() }

        payload.putArray("balls",      ballPosArr)
        payload.putInt("ballCount",    ballPosArr.size() / 2)

        val bArr = Arguments.createArray()
        deadBricks.forEach { bArr.pushString(it) }
        payload.putArray("deadBricks", bArr)

        val eArr = Arguments.createArray()
        frameEvents.forEach { eArr.pushString(it) }
        payload.putArray("events",     eArr)

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("physicsUpdate", payload)
    }
}
