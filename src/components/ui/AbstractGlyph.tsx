"use client";

import { motion } from "framer-motion";

export type GlyphVariant =
  | "network"
  | "field"
  | "flow"
  | "grid"
  | "orbit"
  | "ascend"
  | "weave"
  | "pulse";

// Driftwood Brown (gold) is the brand's sole warm accent — Dark Spruce
// and Burnt Rose are reserved for rare, single moments per screen, not
// woven through repeated UI like this glyph set. Variety here comes from
// tint/shade of the one accent instead of switching hue.
const accentColors: Record<GlyphVariant, string> = {
  network: "#ad8752",
  field: "#8b6b3d",
  flow: "#d4b483",
  grid: "#ad8752",
  orbit: "#8b6b3d",
  ascend: "#d4b483",
  weave: "#ad8752",
  pulse: "#d4b483",
};

/**
 * Small animated abstract visualizations used in place of icons —
 * each variant maps loosely to a capability without depicting anything
 * literal (no shields, chips, brains, or AI clipart).
 */
export default function AbstractGlyph({
  variant,
  className,
}: {
  variant: GlyphVariant;
  className?: string;
}) {
  const color = accentColors[variant];

  return (
    <div className={className} style={{ color }}>
      <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id={`glow-${variant}`}>
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="55" fill={`url(#glow-${variant})`} />

        {variant === "network" && <NetworkGlyph color={color} />}
        {variant === "field" && <FieldGlyph color={color} />}
        {variant === "flow" && <FlowGlyph color={color} />}
        {variant === "grid" && <GridGlyph color={color} />}
        {variant === "orbit" && <OrbitGlyph color={color} />}
        {variant === "ascend" && <AscendGlyph color={color} />}
        {variant === "weave" && <WeaveGlyph color={color} />}
        {variant === "pulse" && <PulseGlyph color={color} />}
      </svg>
    </div>
  );
}

function NetworkGlyph({ color }: { color: string }) {
  const nodes = [
    [60, 28],
    [30, 55],
    [90, 55],
    [42, 92],
    [78, 92],
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [1, 2],
    [3, 4],
  ];
  return (
    <g fill="none" stroke={color}>
      {edges.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          strokeWidth={1}
          strokeOpacity={0.35}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: i * 0.12, ease: "easeOut" }}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={4}
          fill={color}
          initial={{ opacity: 0.4, scale: 0.8 }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.15, 0.9] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      ))}
    </g>
  );
}

function FieldGlyph({ color }: { color: string }) {
  const rings = [18, 30, 42];
  return (
    <g fill="none" stroke={color} strokeWidth={1}>
      {rings.map((r, i) => (
        <motion.circle
          key={r}
          cx={60}
          cy={60}
          r={r}
          strokeOpacity={0.3}
          animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [1, 1.04, 1] }}
          transition={{
            rotate: { duration: 18 + i * 6, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ transformOrigin: "60px 60px" }}
          strokeDasharray="4 7"
        />
      ))}
      <motion.circle
        cx={60}
        cy={60}
        r={6}
        fill={color}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      />
    </g>
  );
}

function FlowGlyph({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round">
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M 20 ${45 + i * 12} C 45 ${25 + i * 12}, 75 ${85 + i * 12}, 100 ${55 + i * 12}`}
          strokeOpacity={0.55 - i * 0.12}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </g>
  );
}

function GridGlyph({ color }: { color: string }) {
  const cells = Array.from({ length: 16 }, (_, i) => i);
  return (
    <g fill={color}>
      {cells.map((i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return (
          <motion.rect
            key={i}
            x={30 + col * 16}
            y={30 + row * 16}
            width={8}
            height={8}
            rx={2}
            initial={{ opacity: 0.15 }}
            animate={{ opacity: [0.15, 0.9, 0.15] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: (col + row) * 0.15,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </g>
  );
}

function OrbitGlyph({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color}>
      <circle cx={60} cy={60} r={4} fill={color} />
      {[24, 38].map((r, i) => (
        <motion.g
          key={r}
          animate={{ rotate: 360 }}
          transition={{ duration: 8 + i * 6, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "60px 60px" }}
        >
          <circle cx={60} cy={60} r={r} strokeOpacity={0.25} strokeWidth={1} />
          <circle cx={60 + r} cy={60} r={3.5} fill={color} />
        </motion.g>
      ))}
    </g>
  );
}

function AscendGlyph({ color }: { color: string }) {
  const bars = [22, 34, 28, 44, 52];
  return (
    <g fill={color}>
      {bars.map((h, i) => (
        <motion.rect
          key={i}
          x={28 + i * 13}
          width={7}
          rx={3}
          y={90 - h}
          height={h}
          fillOpacity={0.85}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          style={{ transformOrigin: "bottom", transformBox: "fill-box" }}
          transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </g>
  );
}

function WeaveGlyph({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth={1.4}>
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M 30 ${30 + i * 22} Q 60 ${10 + i * 22}, 90 ${30 + i * 22}`}
          strokeOpacity={0.5}
          animate={{
            d: [
              `M 30 ${30 + i * 22} Q 60 ${10 + i * 22}, 90 ${30 + i * 22}`,
              `M 30 ${30 + i * 22} Q 60 ${50 + i * 22}, 90 ${30 + i * 22}`,
              `M 30 ${30 + i * 22} Q 60 ${10 + i * 22}, 90 ${30 + i * 22}`,
            ],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        />
      ))}
    </g>
  );
}

function PulseGlyph({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <motion.path
        d="M 18 60 H 42 L 50 38 L 62 82 L 72 60 H 102"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </g>
  );
}
