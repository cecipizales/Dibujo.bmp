import React, { useState, useEffect } from 'react';
import WinXP from 'WinXP';

// ─── Canvas dimensions ────────────────────────────────────────────────────────
const W = 1920;
const H = 1080;

// ─── Monitor screen area (pixel coords within the 1920×1080 canvas) ───────────
// Measured from Screen-goes-here.png reference layer.
// WinXP renders here, on top of the monitor image.
const SCREEN = {
  left:   563,
  top:    120,
  width:  346,
  height: 264,
};

function Scene() {
  const [pos, setPos] = useState({ scale: 1, x: 0, y: 0 });

  useEffect(() => {
    function calc() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(vw / W, vh / H);
      // Centre the scaled canvas inside the viewport
      const x = (vw - W * scale) / 2;
      const y = (vh - H * scale) / 2;
      setPos({ scale, x, y });
    }
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const { scale, x, y } = pos;

  return (
    <div style={{
      width:    '100vw',
      height:   '100vh',
      overflow: 'hidden',
      position: 'relative',
      background: '#111',
    }}>
      {/*
        The 1920×1080 canvas.
        transform-origin: top left + manual x/y offset is the correct way
        to scale a larger-than-viewport element without flex/scrollbar issues.
      */}
      <div style={{
        position:        'absolute',
        top:             y,
        left:            x,
        width:           W,
        height:          H,
        transformOrigin: 'top left',
        transform:       `scale(${scale})`,
      }}>

        {/* ── z1: Desk / room background ─────────────────────────────── */}
        <img
          src="/setup/BG-base.png"
          alt=""
          draggable={false}
          style={fullLayer(1)}
        />

        {/* ── z2: Monitor frame ──────────────────────────────────────── */}
        <img
          src="/setup/Monitor.png"
          alt="Monitor"
          draggable={false}
          style={fullLayer(2)}
        />

        {/*
          ── z3: WinXP — sits ABOVE the monitor image ──────────────────
          Positioned exactly at the screen area so it appears to live
          inside the CRT, regardless of whether the monitor PNG screen
          area is transparent or white.
          overflow:hidden clips windows that would spill outside the screen.
        */}
        <div style={{
          position: 'absolute',
          left:     SCREEN.left,
          top:      SCREEN.top,
          width:    SCREEN.width,
          height:   SCREEN.height,
          overflow: 'hidden',
          zIndex:   3,
        }}>
          <WinXP />
        </div>

        {/* ── z4: Left speaker ───────────────────────────────────────── */}
        <img
          src="/setup/Speaker-left.png"
          alt=""
          draggable={false}
          style={fullLayer(4)}
        />

        {/* ── z5: Right speaker ──────────────────────────────────────── */}
        <img
          src="/setup/Speaker-right.png"
          alt=""
          draggable={false}
          style={fullLayer(5)}
        />

      </div>
    </div>
  );
}

// Shared style for full-canvas layers (only z-index varies)
function fullLayer(zIndex) {
  return {
    position:      'absolute',
    top:           0,
    left:          0,
    width:         W,
    height:        H,
    zIndex,
    userSelect:    'none',
    pointerEvents: 'none', // decorative layers don't block WinXP interaction
    display:       'block',
  };
}

export default Scene;
