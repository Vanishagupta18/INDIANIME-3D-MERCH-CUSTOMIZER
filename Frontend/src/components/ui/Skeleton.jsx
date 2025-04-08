export function ProductCardSkeleton() {
  return (
    <div style={{ background: 'var(--black-2)', border: '1px solid var(--border)' }}>
      <div className="skeleton" style={{ aspectRatio: '3/4', width: '100%' }} />
      <div style={{ padding: 14 }}>
        <div className="skeleton" style={{ height: 10, width: '40%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 14 }} />
        <div className="skeleton" style={{ height: 16, width: '35%' }} />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: 20
    }}>
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  )
}