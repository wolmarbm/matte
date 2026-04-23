// Lightweight, deterministic analytics computed from saved student sessions.
// All helpers are null-safe so the UI can show friendly fallbacks when data
// is missing or malformed.

export const CONCEPT_LABELS = {
  'parts-of-whole': 'Parts of a Whole',
  'equivalent-fractions': 'Equivalent Fractions',
  'compare-fractions': 'Compare Fractions',
}

export function getConceptLabel(tag) {
  if (!tag || typeof tag !== 'string') return 'Unknown Concept'
  if (CONCEPT_LABELS[tag]) return CONCEPT_LABELS[tag]
  return tag
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function parseFraction(str) {
  if (typeof str !== 'string') return null
  const parts = str.split('/')
  if (parts.length !== 2) return null
  const numerator = Number(parts[0])
  const denominator = Number(parts[1])
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null
  if (denominator === 0) return null
  return { numerator, denominator }
}

function getAllQuestions(sessions) {
  if (!Array.isArray(sessions)) return []
  const all = []
  for (const session of sessions) {
    if (!session || !Array.isArray(session.questions)) continue
    for (const q of session.questions) {
      if (q && typeof q === 'object') all.push(q)
    }
  }
  return all
}

export function getAverageAccuracy(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) return null
  let sum = 0
  let count = 0
  for (const session of sessions) {
    const acc = Number(session?.accuracy)
    if (Number.isFinite(acc)) {
      sum += acc
      count += 1
    }
  }
  if (count === 0) return null
  return Math.round(sum / count)
}

export function getConceptBreakdown(sessions) {
  const questions = getAllQuestions(sessions)
  const byTag = new Map()
  for (const q of questions) {
    const tag = q.conceptTag || 'unknown'
    if (!byTag.has(tag)) {
      byTag.set(tag, { conceptTag: tag, total: 0, correct: 0, incorrect: 0 })
    }
    const entry = byTag.get(tag)
    entry.total += 1
    if (q.correct) {
      entry.correct += 1
    } else {
      entry.incorrect += 1
    }
  }

  const rows = []
  for (const entry of byTag.values()) {
    const accuracy =
      entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0
    rows.push({
      conceptTag: entry.conceptTag,
      label: getConceptLabel(entry.conceptTag),
      total: entry.total,
      correct: entry.correct,
      incorrect: entry.incorrect,
      accuracy,
    })
  }

  rows.sort((a, b) => {
    if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy
    return b.incorrect - a.incorrect
  })

  return rows
}

export function getMostMissedConcept(sessions) {
  const breakdown = getConceptBreakdown(sessions)
  const withData = breakdown.filter((row) => row.total >= 1)
  if (withData.length === 0) return null
  // breakdown is already sorted by accuracy ascending, incorrect descending
  return withData[0]
}

export function getCommonMistakeSummary(sessions) {
  const questions = getAllQuestions(sessions)
  const incorrect = questions.filter((q) => q && q.correct === false)

  if (incorrect.length === 0) {
    return 'No clear mistake pattern yet.'
  }

  let under = 0
  let over = 0
  const missesByTag = new Map()

  for (const q of incorrect) {
    const tag = q.conceptTag || 'unknown'
    missesByTag.set(tag, (missesByTag.get(tag) || 0) + 1)

    const sel = parseFraction(q.selectedFraction)
    const target = parseFraction(q.targetFraction)
    if (sel && target && sel.denominator === target.denominator) {
      if (sel.numerator < target.numerator) under += 1
      else if (sel.numerator > target.numerator) over += 1
    }
  }

  if (over > under && over >= 2) {
    return 'A common issue is selecting too many slices.'
  }
  if (under > over && under >= 2) {
    return 'A common issue is selecting too few slices.'
  }

  let topTag = null
  let topCount = 0
  for (const [tag, count] of missesByTag.entries()) {
    if (count > topCount) {
      topTag = tag
      topCount = count
    }
  }

  if (topTag && topCount >= 2 && topCount / incorrect.length >= 0.6) {
    return `Students are struggling with ${getConceptLabel(topTag)}.`
  }

  const mostMissed = getMostMissedConcept(sessions)
  if (mostMissed) {
    return `Students are struggling with ${mostMissed.label}.`
  }

  return 'No clear mistake pattern yet.'
}
