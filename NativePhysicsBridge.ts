/**
 * NativePhysicsBridge.ts
 *
 * Replaces Physics.ts entirely.
 * Kotlin does all math → sends ONE event per frame → JS just renders.
 *
 * Setup steps:
 *  1. Add PhysicsPackage to MainApplication.kt  (see bottom of this file)
 *  2. Replace your <GameEngine systems={[Physics]} /> with
 *     the <NativeGameRenderer /> component below.
 */

import { NativeModules, NativeEventEmitter, Dimensions } from 'react-native';
import React, { useEffect, useRef, useCallback } from 'react';

const { PhysicsModule } = NativeModules;
const emitter = new NativeEventEmitter(PhysicsModule);
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript wrapper — thin JS API over the Kotlin module
// ─────────────────────────────────────────────────────────────────────────────

export const Physics = {
  /** Must be called once before any level starts */
  init(bricks: BrickDef[], paddleWidth: number): Promise<boolean> {
    PhysicsModule.setScreenSize(SCREEN_W, SCREEN_H);
    return PhysicsModule.initGame(bricks, paddleWidth);
  },

  /** Tap-to-launch */
  launch() { PhysicsModule.launchBall(); },

  /** Called from gesture handler */
  movePaddle(x: number) { PhysicsModule.movePaddle(x); },

  /** Power-up collected in JS, applied in Kotlin */
  applyPowerUp(type: 'WIDE' | 'MULTI' | 'PLUS3' | 'FIRE' | 'LIFE') {
    PhysicsModule.applyPowerUp(type);
  },

  resetPaddleWidth() { PhysicsModule.resetPaddleWidth(); },

  start() { PhysicsModule.startLoop(); },
  stop()  { PhysicsModule.stopLoop(); },
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BrickDef {
  id: string;
  x: number; y: number;
  w: number; h: number;
  hp: number;
  type: 'regular' | 'stone';
  color: string;
}

/** Fired by Kotlin every frame (~16ms) */
interface PhysicsUpdate {
  balls: number[];       // flat [x0,y0, x1,y1, ...] — no per-ball object allocation
  ballCount: number;
  deadBricks: string[];  // brick IDs destroyed this frame
  events: string[];      // "wall-hit" | "paddle-hit" | "brick-break:id:color" | "lose-life"
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook — subscribe to native physics updates
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useNativePhysics
 *
 * Usage:
 *   const { ballPositions, ballCount, deadBricks, events } = useNativePhysics();
 *
 * Runs with NO re-renders — uses a ref callback so only your canvas/svg updates.
 */
export function useNativePhysics(onUpdate: (update: PhysicsUpdate) => void) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const sub = emitter.addListener('physicsUpdate', (data: PhysicsUpdate) => {
      onUpdateRef.current(data);
    });
    return () => sub.remove();
  }, []);
}

// ─────────────────────────────────────────────────────────────────────────────
// Example: Minimal game renderer (replace your GameEngine with this)
// ─────────────────────────────────────────────────────────────────────────────
//
// This uses react-native-svg but you can swap for Canvas/Skia.
// The key insight: we DON'T setState on every frame.
// We directly mutate SVG element refs — zero React reconciliation overhead.
//
// import Svg, { Circle, Rect } from 'react-native-svg';
//
// export function NativeGameRenderer({ bricks }: { bricks: BrickDef[] }) {
//   // One ref per ball slot (pre-allocate max you ever expect)
//   const ballRefs = useRef<any[]>(Array(500).fill(null).map(() => React.createRef()));
//
//   const brickRefs = useRef<Map<string, any>>(new Map());
//
//   useNativePhysics(useCallback(({ balls, ballCount, deadBricks, events }) => {
//     // Update ball positions by directly mutating SVG element props
//     // — no setState, no re-render, no reconciliation
//     for (let i = 0; i < ballCount; i++) {
//       const ref = ballRefs.current[i]?.current;
//       if (ref) {
//         ref.setNativeProps({ cx: balls[i * 2], cy: balls[i * 2 + 1] });
//       }
//     }
//
//     // Hide destroyed bricks
//     for (const id of deadBricks) {
//       brickRefs.current.get(id)?.setNativeProps({ display: 'none' });
//     }
//
//     // Handle game events
//     for (const ev of events) {
//       if (ev === 'lose-life') { /* update lives UI */ }
//       if (ev.startsWith('brick-break')) { /* spawn particles */ }
//     }
//   }, []));
//
//   return (
//     <Svg width={SCREEN_W} height={SCREEN_H}>
//       {/* Bricks */}
//       {bricks.map(b => (
//         <Rect key={b.id} ref={brickRefs.current.get(b.id)} ... />
//       ))}
//       {/* Pre-allocate ball elements */}
//       {Array(500).fill(0).map((_, i) => (
//         <Circle key={i} ref={ballRefs.current[i]} r={10} ... />
//       ))}
//     </Svg>
//   );
// }

// ─────────────────────────────────────────────────────────────────────────────
// MainApplication.kt — add this one line to register the package:
// ─────────────────────────────────────────────────────────────────────────────
//
// override fun getPackages(): List<ReactPackage> = listOf(
//     MainReactPackage(),
//     PhysicsPackage(),   // ← add this
// )
