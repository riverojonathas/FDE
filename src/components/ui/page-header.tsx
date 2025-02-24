interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight text-slate-100">
        {title}
      </h1>
      {description && (
        <p className="text-slate-400">
          {description}
        </p>
      )}
    </div>
  )
} 