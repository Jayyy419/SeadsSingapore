"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  hue: number;
  sat: number;
  light: number;
};

export function CursorSmoke() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const motionDisabled = document.documentElement.dataset.motion === "off";

    if (prefersReducedMotion || coarsePointer || motionDisabled) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const particles: Particle[] = [];
    let animationId = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const addParticle = (x: number, y: number) => {
      const warm = Math.random() > 0.58;
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.7,
        vy: -0.35 - Math.random() * 0.55,
        r: 14 + Math.random() * 14,
        life: 1,
        hue: warm ? 34 + Math.random() * 12 : 145 + Math.random() * 20,
        sat: warm ? 72 : 54,
        light: warm ? 58 : 50,
      });

      if (particles.length > 90) {
        particles.shift();
      }
    };

    const onMove = (event: MouseEvent) => {
      addParticle(event.clientX, event.clientY);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life -= 0.02;
        p.r += 0.18;
        p.x += p.vx;
        p.y += p.vy;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = p.life * 0.16;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        gradient.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    animationId = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-10" aria-hidden="true" />;
}
