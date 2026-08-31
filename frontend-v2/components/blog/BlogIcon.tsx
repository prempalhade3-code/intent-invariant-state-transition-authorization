import { cn } from "@/lib/cn";
import type { BlogIconName } from "@/lib/blog";

const PIXEL = "#10B981";
const PIXEL_DIM = "#10B98180";

function Pixel({ x, y, dim }: { x: number; y: number; dim?: boolean }) {
  return (
    <rect
      x={x}
      y={y}
      width={1}
      height={1}
      fill={dim ? PIXEL_DIM : PIXEL}
    />
  );
}

function SealIcon() {
  return (
    <g>
      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((x) => (
        <Pixel key={`t${x}`} x={x} y={2} />
      ))}
      {[2, 13].map((x) => [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((y) => (
        <Pixel key={`${x}-${y}`} x={x} y={y} />
      )))}
      {[4, 5, 6, 7, 8, 9, 10, 11].map((x) => (
        <Pixel key={`b${x}`} x={x} y={13} />
      ))}
      {[6, 7, 8, 9].map((x) => [6, 7, 8, 9].map((y) => (
        <Pixel key={`c${x}-${y}`} x={x} y={y} dim />
      )))}
      <Pixel x={7} y={5} />
      <Pixel x={8} y={5} />
      <Pixel x={7} y={10} />
      <Pixel x={8} y={10} />
    </g>
  );
}

function GapIcon() {
  return (
    <g>
      {[2, 3, 4, 5].map((y) => [2, 3, 4, 5, 6].map((x) => (
        <Pixel key={`l${x}-${y}`} x={x} y={y} />
      )))}
      {[2, 3, 4, 5].map((y) => [10, 11, 12, 13].map((x) => (
        <Pixel key={`r${x}-${y}`} x={x} y={y} />
      )))}
      {[7, 8].map((x) => [6, 7, 8, 9].map((y) => (
        <Pixel key={`m${x}-${y}`} x={x} y={y} dim />
      )))}
      <Pixel x={7} y={4} dim />
      <Pixel x={8} y={4} dim />
      <Pixel x={7} y={11} dim />
      <Pixel x={8} y={11} dim />
    </g>
  );
}

function FlowIcon() {
  return (
    <g>
      {[3, 4, 5, 6].map((x) => [4, 5, 6, 7, 8, 9, 10].map((y) => (
        <Pixel key={`a${x}-${y}`} x={x} y={y} dim={y > 7} />
      )))}
      {[8, 9, 10, 11].map((x) => [5, 6, 7].map((y) => (
        <Pixel key={`b${x}-${y}`} x={x} y={y} />
      )))}
      {[12, 13].map((x) => [6, 7, 8].map((y) => (
        <Pixel key={`c${x}-${y}`} x={x} y={y} />
      )))}
      <Pixel x={7} y={3} />
      <Pixel x={8} y={3} />
    </g>
  );
}

function VerifyIcon() {
  return (
    <g>
      {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((x) => (
        <Pixel key={`t${x}`} x={x} y={3} />
      ))}
      {[3, 12].map((x) => [4, 5, 6, 7, 8, 9, 10, 11].map((y) => (
        <Pixel key={`s${x}-${y}`} x={x} y={y} />
      )))}
      {[5, 6, 7, 8, 9, 10].map((x) => (
        <Pixel key={`b${x}`} x={x} y={12} />
      ))}
      <Pixel x={5} y={7} />
      <Pixel x={6} y={8} />
      <Pixel x={7} y={9} />
      <Pixel x={8} y={8} />
      <Pixel x={9} y={7} />
      <Pixel x={10} y={6} />
    </g>
  );
}

function ChainIcon() {
  return (
    <g>
      {[3, 4, 5, 6].map((x) => [5, 6, 7, 8, 9, 10].map((y) => (
        <Pixel key={`a${x}-${y}`} x={x} y={y} dim={y === 5 || y === 10} />
      )))}
      {[9, 10, 11, 12].map((x) => [5, 6, 7, 8, 9, 10].map((y) => (
        <Pixel key={`b${x}-${y}`} x={x} y={y} dim={y === 5 || y === 10} />
      )))}
      {[7, 8].map((x) => [6, 7, 8, 9].map((y) => (
        <Pixel key={`l${x}-${y}`} x={x} y={y} />
      )))}
    </g>
  );
}

function ShieldIcon() {
  return (
    <g>
      <Pixel x={7} y={2} />
      <Pixel x={8} y={2} />
      {[5, 6, 7, 8, 9, 10].map((x) => <Pixel key={`t${x}`} x={x} y={3} />)}
      {[4, 11].map((x) => [4, 5, 6, 7, 8, 9, 10, 11, 12].map((y) => (
        <Pixel key={`s${x}-${y}`} x={x} y={y} dim={y > 9} />
      )))}
      {[5, 6, 7, 8, 9, 10].map((x) => (
        <Pixel key={`b${x}`} x={x} y={13} dim />
      ))}
      <Pixel x={7} y={7} />
      <Pixel x={8} y={7} />
      <Pixel x={7} y={8} />
      <Pixel x={8} y={8} />
    </g>
  );
}

const ICONS: Record<BlogIconName, () => JSX.Element> = {
  seal: SealIcon,
  gap: GapIcon,
  flow: FlowIcon,
  verify: VerifyIcon,
  chain: ChainIcon,
  shield: ShieldIcon,
};

interface BlogIconProps {
  name: BlogIconName;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-28 w-28",
};

const scales = { sm: 3, md: 5, lg: 7 };

export function BlogIcon({ name, size = "md", className }: BlogIconProps) {
  const Icon = ICONS[name];
  const scale = scales[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        sizes[size],
        className,
      )}
    >
      <svg
        viewBox="0 0 16 16"
        width={16 * scale}
        height={16 * scale}
        shapeRendering="crispEdges"
        className="overflow-visible"
      >
        <Icon />
      </svg>
    </div>
  );
}
