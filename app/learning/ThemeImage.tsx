'use client'

export default function ThemeImage({
  id,
  name,
  className
}: {
  id: number
  name: string
  className?: string
}) {
  return (
    <img
      src={`/themes/${id}.png`}
      alt={name}
      className={className}
      onError={(e) => {
        e.currentTarget.src = 'https://via.placeholder.com/400x565?text=No+Cover'
      }}
    />
  )
}
