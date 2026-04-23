import { Link } from 'react-router-dom'

function ResultsPage() {
  return (
    <main className="page">
      <h1 className="page__title">Session Results</h1>
      <p className="page__subtitle">
        This page will show the student&apos;s score and progress.
      </p>

      <div className="actions">
        <Link to="/" className="btn btn--secondary">
          Back to Home
        </Link>
        <Link to="/play" className="btn btn--primary">
          Play Again
        </Link>
      </div>
    </main>
  )
}

export default ResultsPage
