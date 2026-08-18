'use client'
import { PlanningLot, Subcontractor, TRADE_COLORS, TRADE_LABELS } from '@/lib/planning-types'

interface GanttChartProps {
  lots: PlanningLot[]
  totalWeeks: number
  startDate: string
  subcontractors: Subcontractor[]
}

function getWeekLabel(startDate: string, weekOffset: number): string {
  const d = new Date(startDate)
  d.setDate(d.getDate() + weekOffset * 7)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function getMonthMarkers(startDate: string, totalWeeks: number) {
  const markers: { label: string; weekOffset: number }[] = []
  const start = new Date(startDate)

  for (let w = 0; w <= totalWeeks; w++) {
    const d = new Date(start)
    d.setDate(d.getDate() + w * 7)
    if (w === 0 || d.getDate() <= 7) {
      markers.push({
        label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        weekOffset: w,
      })
    }
  }
  return markers
}

export default function GanttChart({ lots, totalWeeks, startDate, subcontractors }: GanttChartProps) {
  const subsMap = Object.fromEntries(subcontractors.map(s => [s.id, s]))
  const weeks = Math.max(totalWeeks, 1)
  const monthMarkers = getMonthMarkers(startDate, weeks)

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: `${Math.max(weeks * 32 + 220, 600)}px` }}>
        {/* Header: month markers */}
        <div className="flex mb-1" style={{ paddingLeft: '220px' }}>
          {monthMarkers.map((m, i) => (
            <div
              key={i}
              className="text-xs text-gray-400 font-medium"
              style={{
                width: `${((i < monthMarkers.length - 1 ? monthMarkers[i + 1].weekOffset : weeks) - m.weekOffset) * 32}px`,
                flexShrink: 0,
              }}
            >
              {m.label}
            </div>
          ))}
        </div>

        {/* Week grid header */}
        <div className="flex border-b border-gray-200 mb-2 pb-1" style={{ paddingLeft: '220px' }}>
          {Array.from({ length: weeks }, (_, i) => (
            <div key={i} className="flex-shrink-0 text-center" style={{ width: '32px' }}>
              {(i + 1) % 4 === 0 && (
                <span className="text-xs text-gray-400">S{i + 1}</span>
              )}
            </div>
          ))}
        </div>

        {/* Lots */}
        {lots.map(lot => {
          const sub = lot.subcontractorId ? subsMap[lot.subcontractorId] : null
          const color = TRADE_COLORS[lot.category]
          const leftPx = lot.startWeek * 32
          const widthPx = Math.max(lot.durationWeeks * 32 - 4, 20)

          return (
            <div key={lot.id} className="flex items-center mb-2 group">
              {/* Label */}
              <div className="flex-shrink-0 w-[220px] pr-3">
                <div className="text-sm font-medium text-gray-800 truncate">{lot.name}</div>
                <div className="text-xs text-gray-400 truncate">
                  {sub ? sub.name : TRADE_LABELS[lot.category]}
                </div>
              </div>

              {/* Bar container */}
              <div className="relative flex-1" style={{ height: '36px' }}>
                {/* Grid lines */}
                {Array.from({ length: weeks }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-r border-gray-100"
                    style={{ left: `${(i + 1) * 32}px` }}
                  />
                ))}

                {/* Gantt bar */}
                <div
                  className="absolute top-1 rounded-md flex items-center px-2 cursor-default"
                  style={{
                    left: `${leftPx}px`,
                    width: `${widthPx}px`,
                    height: '28px',
                    backgroundColor: color,
                    opacity: 0.85,
                  }}
                  title={`${lot.name}${lot.description ? ` — ${lot.description}` : ''}\nDébut: ${getWeekLabel(startDate, lot.startWeek)}\nDurée: ${lot.durationWeeks} semaine${lot.durationWeeks > 1 ? 's' : ''}`}
                >
                  {widthPx > 60 && (
                    <span className="text-white text-xs font-medium truncate">
                      {lot.durationWeeks}s
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
