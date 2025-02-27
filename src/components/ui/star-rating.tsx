'use client'

import { Star, StarHalf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

export function StarRating({ value, onChange, className }: StarRatingProps) {
  return (
    <div className={cn('flex gap-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={cn(
            'text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring rounded-sm',
            star <= value ? 'text-yellow-400' : 'text-gray-300'
          )}
        >
          <Star className="w-8 h-8" />
          <span className="sr-only">Avaliar {star} de 5 estrelas</span>
        </button>
      ))}
    </div>
  )
} 