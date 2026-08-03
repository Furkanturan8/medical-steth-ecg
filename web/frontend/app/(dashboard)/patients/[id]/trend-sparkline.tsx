interface TrendPoint {
  date: string
  value: number
}

interface TrendSparklineProps {
  title: string
  unit: string
  color: string
  points: TrendPoint[]
  formatValue?: (value: number) => string
}

const WIDTH = 280
const HEIGHT = 120
const PAD_X = 12
const PAD_Y = 16
const LABEL_W = 34

export function TrendSparkline({ title, unit, color, points, formatValue }: TrendSparklineProps) {
  const format = formatValue ?? ((value: number) => value.toFixed(0))
  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const plotWidth = WIDTH - LABEL_W - PAD_X
  const plotHeight = HEIGHT - PAD_Y * 2

  const coords = points.map((p, i) => {
    const x = LABEL_W + (points.length === 1 ? plotWidth / 2 : (i / (points.length - 1)) * plotWidth)
    const y = PAD_Y + plotHeight - ((p.value - min) / range) * plotHeight
    return { ...p, x, y }
  })

  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ")
  const last = coords[coords.length - 1]
  const showDateLabels = points.length <= 6

  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-2 w-full"
        role="img"
        aria-label={`${title} zaman içindeki değişim`}
      >
        {[min, max].map((v) => {
          const y = PAD_Y + plotHeight - ((v - min) / range) * plotHeight
          return (
            <g key={v}>
              <line x1={LABEL_W} y1={y} x2={WIDTH - PAD_X} y2={y} stroke="var(--border)" strokeWidth={1} />
              <text x={LABEL_W - 6} y={y + 3} textAnchor="end" fontSize={9} fill="var(--muted-foreground)">
                {format(v)}
              </text>
            </g>
          )
        })}

        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {coords.map((c) => {
          const tooltip = `${new Date(c.date).toLocaleDateString("tr-TR")}: ${format(c.value)} ${unit}`
          return (
            <circle key={c.date} cx={c.x} cy={c.y} r={4} fill={color} stroke="var(--card)" strokeWidth={2}>
              <title>{tooltip}</title>
            </circle>
          )
        })}

        <text x={last.x} y={last.y - 10} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--foreground)">
          {format(last.value)}
        </text>

        {showDateLabels &&
          coords.map((c) => (
            <text key={c.date} x={c.x} y={HEIGHT - 2} textAnchor="middle" fontSize={9} fill="var(--muted-foreground)">
              {new Date(c.date).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
            </text>
          ))}
      </svg>
    </div>
  )
}
