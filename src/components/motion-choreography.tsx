"use client";

import { useEffect } from "react";

export function MotionChoreography() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionDisabled = document.documentElement.dataset.motion === "off";
    if (reduceMotion || motionDisabled) {
      return;
    }

    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  return null;
}
