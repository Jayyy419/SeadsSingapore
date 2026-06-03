"use client";

import { useEffect } from "react";

export function MagneticEffects() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionDisabled = document.documentElement.dataset.motion === "off";
    if (reduceMotion || motionDisabled) {
      return;
    }

    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic='true']"));
    const strength = 18;

    const handleMove = (event: MouseEvent) => {
      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const range = Math.max(rect.width, rect.height) * 1.35;

        if (distance < range) {
          const moveX = (dx / range) * strength;
          const moveY = (dy / range) * strength;
          node.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        } else {
          node.style.transform = "translate3d(0, 0, 0)";
        }
      });
    };

    const reset = () => {
      nodes.forEach((node) => {
        node.style.transform = "translate3d(0, 0, 0)";
      });
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", reset);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", reset);
      reset();
    };
  }, []);

  return null;
}
