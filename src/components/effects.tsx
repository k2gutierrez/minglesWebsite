"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { usePathname } from "next/navigation";

export function PointerSignal() {
  const reduced = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 230, damping: 25 });
  const sy = useSpring(y, { stiffness: 230, damping: 25 });
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (reduced) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setActive(
        !!(e.target as Element).closest("a,button,.brand-art,.tilt-surface"),
      );
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [reduced, x, y]);
  if (reduced) return null;
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-signal ${active ? "pointer-active" : ""}`}
      style={{ left: sx, top: sy }}
    >
      <span />
      <span />
    </motion.div>
  );
}
export function PageArrival({ children }: { children: ReactNode }) {
  const path = usePathname();
  const reduced = useReducedMotion();
  return (
    <motion.div
      key={path}
      initial={
        reduced ? false : { opacity: 0.3, y: 28, clipPath: "inset(0 0 5% 0)" }
      }
      animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function TiltSurface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const x = useSpring(rx, { stiffness: 220, damping: 22 });
  const y = useSpring(ry, { stiffness: 220, damping: 22 });
  return (
    <motion.div
      className={`tilt-surface ${className}`}
      style={{ rotateX: x, rotateY: y, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        rx.set((-(e.clientY - r.top - r.height / 2) / r.height) * 16);
        ry.set(((e.clientX - r.left - r.width / 2) / r.width) * 16);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      whileHover={reduced ? {} : { y: -8 }}
      transition={{ type: "spring", stiffness: 230, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}
export function AgaveField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 0,
      height = 0,
      frame = 0;
    let px = 0.5,
      py = 0.5;
    const host = canvas.parentElement!;
    const resize = () => {
      width = host.clientWidth;
      height = host.clientHeight;
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width;
      py = (e.clientY - r.top) / r.height;
    };
    host.addEventListener("pointermove", move);
    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const t = reduced ? 0 : time * 0.00022;
      const cx = width * (0.5 + (px - 0.5) * 0.11),
        cy = height * (0.5 + (py - 0.5) * 0.11);
      const radius = Math.min(width, height) * 0.43;
      ctx.strokeStyle = "rgba(237,237,217,0.055)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 44) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 44) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }
      const points = Array.from({ length: 32 }, (_, i) => {
        const a = (i / 32) * Math.PI * 2 + t;
        return {
          x: cx + Math.cos(a) * radius,
          y: cy + Math.sin(a) * radius * 0.82,
        };
      });
      ctx.strokeStyle = "rgba(225,81,98,0.27)";
      points.forEach((p, i) => {
        const q = points[(i + 9) % 32];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
        ctx.fillStyle = i % 4 === 0 ? "#e15162" : "rgba(237,237,217,.55)";
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      });
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      host.removeEventListener("pointermove", move);
    };
  }, [reduced]);
  return <canvas ref={ref} className="agave-field" aria-hidden="true" />;
}
