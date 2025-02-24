"use client"

const data = [
  {
    name: "Jan",
    total: 167,
  },
  {
    name: "Fev",
    total: 183,
  },
  {
    name: "Mar",
    total: 176,
  },
  {
    name: "Abr",
    total: 192,
  },
  {
    name: "Mai",
    total: 186,
  },
  {
    name: "Jun",
    total: 172,
  },
]

export function Overview() {
  const maxValue = Math.max(...data.map(item => item.total))

  return (
    <div className="w-full space-y-4">
      {data.map((item) => (
        <div key={item.name} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{item.name}</span>
            <span className="font-medium">{item.total}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${(item.total / maxValue) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
} 