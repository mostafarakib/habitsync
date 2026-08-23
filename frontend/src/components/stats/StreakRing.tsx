export function StreakRing({
  percent,
  size = 140,
  strokeWidth = 12,
  sublabel,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  sublabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#262626"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
      />
      <text
        x={center}
        y={center - (sublabel ? 6 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.19}
        fontWeight={500}
        fill="#fafafa"
      >
        {Math.round(percent)}%
      </text>
      {sublabel && (
        <text
          x={center}
          y={center + size * 0.13}
          textAnchor="middle"
          fontSize={size * 0.09}
          fill="#737373"
        >
          {sublabel}
        </text>
      )}
    </svg>
  );
}
