import React, { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Particles ──────────────────────────────────────────────────────────────
    const PARTICLE_COUNT = 90;
    const MAX_DIST = 140;

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r:  Math.random() * 1.8 + 0.6,
      // teal or purple tint
      hue: Math.random() > 0.5 ? 162 : 260,
    }));

    // ── Orbs (large blurry glows) ─────────────────────────────────────────────
    const orbs = [
      { x: 0.8,  y: 0.1,  r: 380, color: "rgba(0,210,140,",  spd: 0.00012 },
      { x: 0.15, y: 0.85, r: 340, color: "rgba(99,60,255,",   spd: 0.00009 },
      { x: 0.5,  y: 0.45, r: 280, color: "rgba(0,140,210,",   spd: 0.00015 },
    ];
    let t = 0;

    // ── Draw loop ─────────────────────────────────────────────────────────────
    const draw = () => {
      t++;
      const W = canvas.width;
      const H = canvas.height;

      // Clear
      ctx.clearRect(0, 0, W, H);

      // Background base
      ctx.fillStyle = "#060811";
      ctx.fillRect(0, 0, W, H);

      // Dot grid
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      const gs = 30;
      for (let gx = 0; gx < W; gx += gs) {
        for (let gy = 0; gy < H; gy += gs) {
          ctx.beginPath();
          ctx.arc(gx, gy, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Animated aurora orbs
      orbs.forEach((orb, i) => {
        const px = (orb.x + Math.sin(t * orb.spd + i * 2.1) * 0.18) * W;
        const py = (orb.y + Math.cos(t * orb.spd + i * 1.7) * 0.15) * H;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, orb.r);
        grad.addColorStop(0,   orb.color + "0.13)");
        grad.addColorStop(0.4, orb.color + "0.06)");
        grad.addColorStop(1,   orb.color + "0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18;
            ctx.strokeStyle = `rgba(0,210,140,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Particles
      particles.forEach((p) => {
        // Update
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        // Pulse alpha
        const pulse = 0.55 + 0.45 * Math.sin(t * 0.02 + p.x * 0.01);

        // Draw glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        glow.addColorStop(0,   `hsla(${p.hue},100%,65%,${pulse * 0.4})`);
        glow.addColorStop(1,   `hsla(${p.hue},100%,65%,0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw core dot
        ctx.fillStyle = `hsla(${p.hue},100%,72%,${pulse * 0.85})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Scanline vignette overlay
      const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.95);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
