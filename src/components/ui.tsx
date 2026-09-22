"use client";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import { AgaveField } from "./effects";
import { safeHref } from "@/lib/content";
export function Button({
  children,
  href,
  dark = false,
}: {
  children: ReactNode;
  href: string;
  dark?: boolean;
}) {
  return (
    <Link
      className={`button ${dark ? "button-dark" : ""}`}
      href={safeHref(href)}
    >
      {children}
      <ArrowUpRight size={17} />
    </Link>
  );
}
export function Status({ children }: { children: ReactNode }) {
  return (
    <span className="status">
      <span />
      {children}
    </span>
  );
}
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0.25, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
    >
      <motion.div
        initial={false}
        whileInView={reduced ? {} : { y: [20, 0] }}
        transition={{ duration: 0.55 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
export function BrandArt({ small = false }: { small?: boolean }) {
  const reduced = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  return (
    <div
      className={`brand-art ${small ? "brand-art-small" : ""}`}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse" && !reduced) {
          const r = e.currentTarget.getBoundingClientRect();
          setPointer({
            x: (e.clientX - r.left - r.width / 2) / 9,
            y: (e.clientY - r.top - r.height / 2) / 9,
          });
        }
      }}
      onPointerLeave={() => setPointer({ x: 0, y: 0 })}
    >
      <AgaveField />
      <span className="art-corner">
        M / IDENTITY IN MOTION <i>INTERACTIVE FIELD</i>
      </span>
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <motion.div
        className="brand-disc"
        animate={{
          x: pointer.x,
          y: pointer.y,
          rotateX: -pointer.y / 2,
          rotateY: pointer.x / 2,
          rotate: reduced ? 0 : -9,
        }}
        style={{ transformPerspective: 900 }}
        transition={{ type: "spring", stiffness: 110, damping: 22 }}
      >
        <img
          src="/brand/mingles-black.png"
          alt="Official Mingles logo"
          width="450"
          height="450"
        />
      </motion.div>
      <span className="art-spark spark-one" aria-hidden="true">
        ✳
      </span>
      <span className="art-spark spark-two" aria-hidden="true">
        ✳
      </span>
      <motion.div
        className="floating-tag tag-one"
        animate={reduced ? {} : { y: [0, -12, 0], rotate: [-7, -4, -7] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        001 / CHARACTER IP <span>✳</span>
      </motion.div>
      <motion.div
        className="floating-tag tag-two"
        animate={reduced ? {} : { y: [0, 14, 0], rotate: [6, 9, 6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        002 / AGAVE SPIRIT <span>↗</span>
      </motion.div>
      <div className="art-stamp">
        100%
        <br />
        MINGLES
        <br />
        <span>SPIRIT</span>
      </div>
      <span className="art-bottom">
        <span>MOVE YOUR CURSOR / EXPLORE THE FIELD</span>{" "}
        <ArrowUpRight size={15} />
      </span>
    </div>
  );
}
export function EmptyMedia({ kind }: { kind: string }) {
  return (
    <div className="empty-media">
      <Sparkles size={30} strokeWidth={1} />
      <span>{kind}</span>
      <small>Official media awaiting publication</small>
    </div>
  );
}
export function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link className="text-link" href={safeHref(href)}>
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}
