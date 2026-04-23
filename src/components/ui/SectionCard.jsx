function SectionCard({ title, ariaLabel, children, headingLevel = 2 }) {
  const Heading = `h${headingLevel}`
  return (
    <section className="section-card" aria-label={ariaLabel || title}>
      {title ? <Heading className="section-card__title">{title}</Heading> : null}
      {children}
    </section>
  )
}

export default SectionCard
