"use client";

/** Simple hand-drawn-style SVG illustrations for each "bao vở" step, so the
 * game cards can show a picture instead of a wall of text. */

function Notebook({ x = 60, y = 35 }: { x?: number; y?: number }) {
  return (
    <g>
      <rect x={x} y={y} width="80" height="110" rx="6" fill="#93c5fd" stroke="#1e40af" strokeWidth="4" />
      <rect x={x} y={y} width="16" height="110" rx="6" fill="#3b82f6" />
      <line x1={x + 32} y1={y + 30} x2={x + 62} y2={y + 30} stroke="white" strokeWidth="4" strokeLinecap="round" />
      <line x1={x + 32} y1={y + 48} x2={x + 62} y2={y + 48} stroke="white" strokeWidth="4" strokeLinecap="round" />
      <line x1={x + 32} y1={y + 66} x2={x + 55} y2={y + 66} stroke="white" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

export function Step1Prepare() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <Notebook x={16} y={45} />
      <rect x={112} y="50" width="72" height="95" rx="8" fill="#a5f3fc" fillOpacity="0.7" stroke="#0891b2" strokeWidth="4" />
      <line x1="122" y1="70" x2="174" y2="95" stroke="white" strokeOpacity="0.8" strokeWidth="4" />
      <line x1="122" y1="95" x2="174" y2="120" stroke="white" strokeOpacity="0.8" strokeWidth="4" />
      <g transform="translate(90,150)">
        <path d="M0 10 L14 0 L28 10 L28 24 L0 24 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="14" cy="6" r="3" fill="#b45309" />
      </g>
    </svg>
  );
}

export function Step2LayFlat() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <rect x="20" y="140" width="160" height="14" rx="4" fill="#a16207" />
      <rect x="35" y="154" width="14" height="30" fill="#92400e" />
      <rect x="151" y="154" width="14" height="30" fill="#92400e" />
      <rect x="35" y="60" width="130" height="75" rx="6" fill="#a5f3fc" stroke="#0891b2" strokeWidth="4" />
      <line x1="50" y1="80" x2="150" y2="80" stroke="white" strokeOpacity="0.7" strokeWidth="4" />
      <line x1="50" y1="100" x2="150" y2="100" stroke="white" strokeOpacity="0.7" strokeWidth="4" />
      <line x1="50" y1="120" x2="150" y2="120" stroke="white" strokeOpacity="0.7" strokeWidth="4" />
    </svg>
  );
}

export function Step3PlaceFold() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <rect x="30" y="28" width="140" height="144" rx="10" fill="#a5f3fc" fillOpacity="0.6" stroke="#0891b2" strokeWidth="6" strokeDasharray="12 8" />
      <Notebook x={60} y={45} />
      <g fill="#0891b2">
        <path d="M28 20 L48 20 L28 40 Z" />
        <path d="M172 20 L152 20 L172 40 Z" />
        <path d="M28 180 L48 180 L28 160 Z" />
        <path d="M172 180 L152 180 L172 160 Z" />
      </g>
    </svg>
  );
}

export function Step4FoldCorners() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <Notebook x={55} y={40} />
      {[
        [55, 40],
        [135, 40],
        [55, 130],
        [135, 130],
      ].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx},${cy})`}>
          <path d="M0 0 L20 0 L0 20 Z" fill="#fde68a" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />
          <rect x="4" y="4" width="10" height="6" rx="2" fill="#f59e0b" />
        </g>
      ))}
    </svg>
  );
}

export function Step5SmoothCheck() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <Notebook x={55} y={40} />
      <g transform="translate(118,95) rotate(-15)">
        <ellipse cx="0" cy="0" rx="26" ry="18" fill="#fcd9b6" stroke="#c2703d" strokeWidth="3" />
        <ellipse cx="-20" cy="-4" rx="8" ry="5" fill="#fcd9b6" stroke="#c2703d" strokeWidth="3" />
      </g>
      <circle cx="150" cy="150" r="26" fill="#22c55e" />
      <path d="M138 150 L147 159 L164 140" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Step6StickLabel() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <Notebook x={45} y={45} />
      <g transform="translate(118,30)">
        <rect x="0" y="0" width="58" height="34" rx="5" fill="#fed7aa" stroke="#c2410c" strokeWidth="3" />
        <line x1="10" y1="12" x2="48" y2="12" stroke="#c2410c" strokeWidth="3" strokeLinecap="round" />
        <line x1="10" y1="22" x2="38" y2="22" stroke="#c2410c" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export const STEP_ILLUSTRATIONS: Record<string, () => JSX.Element> = {
  "step-1": Step1Prepare,
  "step-2": Step2LayFlat,
  "step-3": Step3PlaceFold,
  "step-4": Step4FoldCorners,
  "step-5": Step5SmoothCheck,
  "step-6": Step6StickLabel,
};

export function StepIllustration({ stepId }: { stepId: string }) {
  const Illustration = STEP_ILLUSTRATIONS[stepId];
  if (!Illustration) return null;
  return <Illustration />;
}
