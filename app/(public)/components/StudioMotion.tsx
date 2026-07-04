"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import type { ReactNode } from "react";

const premiumEase = [0.22, 1, 0.36, 1] as const;

type MotionProps = {
  children?: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
  style?: CSSProperties;
};

export function PageEntry({ children, className, id }: MotionProps) {
  return (
    <motion.main
      className={className}
      id={id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.46, ease: premiumEase }}
    >
      {children}
    </motion.main>
  );
}

export function HeroIntro({ children, className, style }: MotionProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            delayChildren: 0.18,
            staggerChildren: 0.12,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeroItem({ children, className }: MotionProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.48, ease: premiumEase }}
    >
      {children}
    </motion.div>
  );
}

export function LightReveal({ children, className, delay = 0, style }: MotionProps) {
  return (
    <motion.div
      className={`light-reveal${className ? ` ${className}` : ""}`}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.76, delay, ease: premiumEase }}
    >
      {children}
    </motion.div>
  );
}

export function LightGroup({ children, className }: MotionProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.18 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.065,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function LightItem({ children, className, style }: MotionProps) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.46, ease: premiumEase }}
    >
      {children}
    </motion.div>
  );
}
