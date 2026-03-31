'use client';

export default function GrainOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden opacity-[var(--grain-opacity)]">
      <svg className="h-full w-full">
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.6" 
            numOctaves="4" 
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
      <style jsx>{`
        div {
          mix-blend-mode: overlay;
        }
      `}</style>
    </div>
  );
}
