// Attempt-weighted accuracy:
//   - correct on 1st attempt  -> 1.0 credit
//   - correct on 2nd attempt  -> 0.5 credit
//   - correct on Nth attempt  -> 1/N credit
//   - incorrect               -> 0 credit
// Final accuracy = round(sum(credit) / totalQuestions * 100).

export function computeAccuracy(questions) {
  if (!Array.isArray(questions) || questions.length === 0) return 0
  const totalCredit = questions.reduce((sum, q) => {
    if (!q || !q.correct) return sum
    const attempts = Math.max(1, Number(q.attempts) || 1)
    return sum + 1 / attempts
  }, 0)
  return Math.round((totalCredit / questions.length) * 100)
}

// Prefer a freshly-computed value from question data when available; fall back
// to whatever was saved on the session (older sessions may not have question
// data, or were saved before the attempt-weighted formula existed).
export function getSessionAccuracy(session) {
  if (!session) return 0
  if (Array.isArray(session.questions) && session.questions.length > 0) {
    return computeAccuracy(session.questions)
  }
  return Number(session.accuracy) || 0
}
