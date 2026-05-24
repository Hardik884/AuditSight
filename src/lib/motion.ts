/**
 * AuditSight — Centralized Framer Motion variants
 *
 * Import these into any client component to get consistent,
 * premium animation behavior across the entire app.
 */

import type { Variants } from "framer-motion";

// ── Fade Up ────────────────────────────────────────────────────────────────
// Standard reveal: fades in from slightly below. Use for hero content,
// section headings, and individual elements.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ── Fade In ────────────────────────────────────────────────────────────────
// Pure opacity reveal — for elements that shouldn't move.
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

// ── Stagger Container ──────────────────────────────────────────────────────
// Wrap around children to stagger their reveal animations.
// Use `staggerChildren` tuned by context:
//   - 0.06 for grids (fast, card-by-card)
//   - 0.10 for list items (comfortable reading pace)
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// ── Stagger Child ──────────────────────────────────────────────────────────
// Individual item inside a staggerContainer.
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.50, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ── Scale In ───────────────────────────────────────────────────────────────
// Slight scale + fade for badge-style elements and decorative orbs.
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.40, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ── Slide In From Left ─────────────────────────────────────────────────────
// For left-aligned hero text column.
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.60, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ── Slide In From Right ────────────────────────────────────────────────────
// For right-aligned dashboard mock column.
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.60, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ── Card Hover ─────────────────────────────────────────────────────────────
// Lift + shadow intensification on card hover.
export const cardHover = {
  rest: { y: 0, boxShadow: "0 4px 16px -4px rgb(0 0 0 / 0.10)" },
  hover: {
    y: -4,
    boxShadow: "0 16px 40px -12px rgb(0 0 0 / 0.20)",
    transition: { duration: 0.22, ease: "easeOut" },
  },
};

// ── List Item ──────────────────────────────────────────────────────────────
// For form tool entry cards — used with AnimatePresence.
export const listItem: Variants = {
  hidden: { opacity: 0, height: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    height: "auto",
    scale: 1,
    transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    height: 0,
    scale: 0.97,
    transition: { duration: 0.24, ease: "easeIn" },
  },
};

// ── Progress Bar ───────────────────────────────────────────────────────────
// Animate a bar from 0 to a target width value.
export const progressBar = (width: number): Variants => ({
  hidden: { width: "0%" },
  visible: {
    width: `${width}%`,
    transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 },
  },
});

// ── Viewport settings shorthand ────────────────────────────────────────────
// Standard viewport trigger config — once: true means animate only on first entry.
export const viewportOnce = { once: true, margin: "-60px" } as const;
