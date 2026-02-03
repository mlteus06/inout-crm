type StatCardProps = {
  title: string
  value: string | number
  subtitle: string
  highlight?: boolean
}

const StatCard = ({ title, value, subtitle, highlight }: StatCardProps) => {
  return (
    <article className={`card ${highlight ? 'card--highlight' : ''}`}>
      <p className="card__title">{title}</p>
      <p className="card__value">{value}</p>
      <p className="card__meta">{subtitle}</p>
    </article>
  )
}

export default StatCard
