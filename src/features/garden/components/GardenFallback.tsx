/** Jardim em SVG: aparece enquanto o 3D carrega, sem WebGL ou com "reduzir movimento". */
export function GardenFallback() {
  return (
    <svg viewBox="0 0 400 300" className="size-full" role="img" aria-label="Um girassol em um canteiro">
      <ellipse cx="200" cy="262" rx="170" ry="30" fill="#6f8a45" />
      <rect x="196" y="120" width="8" height="144" rx="4" fill="#5E7638" />
      <ellipse cx="170" cy="200" rx="26" ry="9" fill="#7a8f55" transform="rotate(-30 170 200)" />
      <ellipse cx="232" cy="170" rx="24" ry="8" fill="#7a8f55" transform="rotate(30 232 170)" />
      {Array.from({ length: 14 }, (_, i) => (
        <ellipse
          key={i}
          cx="200"
          cy="82"
          rx="9"
          ry="26"
          fill="#EAD96B"
          transform={`rotate(${(i * 360) / 14} 200 110) translate(0 -2)`}
        />
      ))}
      <circle cx="200" cy="110" r="24" fill="#4D1F1A" />
    </svg>
  );
}
