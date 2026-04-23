function SummaryCard({ label, value, hint, ariaLabel }) {
  return (
    <div className="summary-card" aria-label={ariaLabel || label}>
      <div className="summary-card__label">{label}</div>
      <div className="summary-card__value">{value}</div>
      {hint ? <div className="summary-card__hint">{hint}</div> : null}
    </div>
  )
}

export default SummaryCard
