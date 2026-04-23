// Each question has a `type` field. Supported types:
//   - 'build'      : student selects `numerator` slices out of `denominator`
//   - 'complete'   : pizza has `prefilledSlices` already filled; student must
//                    add the missing part. `numerator` is the COUNT OF MISSING
//                    SLICES the student needs to add; `denominator` is the
//                    total slice count.
//   - 'equivalent' : student picks one of `options` that equals `targetFraction`.
//                    Each option has { id, numerator, denominator, isCorrect }.
export const QUESTIONS = [
  {
    id: 'q1',
    type: 'build',
    prompt: 'Build 1/2 of a pizza',
    numerator: 1,
    denominator: 2,
    conceptTag: 'parts-of-whole',
  },
  {
    id: 'q2',
    type: 'build',
    prompt: 'Build 3/4 of a pizza',
    numerator: 3,
    denominator: 4,
    conceptTag: 'parts-of-whole',
  },
  {
    id: 'q3',
    type: 'complete',
    prompt: 'This pizza has 3/4 filled. Add the missing part to make 1 whole.',
    numerator: 1,
    denominator: 4,
    prefilledSlices: [0, 1, 2],
    conceptTag: 'parts-of-whole',
  },
  {
    id: 'q4',
    type: 'build',
    prompt: 'Build 5/8 of a pizza',
    numerator: 5,
    denominator: 8,
    conceptTag: 'parts-of-whole',
  },
  {
    id: 'q5',
    type: 'equivalent',
    prompt: 'Which pizza shows the same amount as 1/2?',
    targetFraction: '1/2',
    options: [
      { id: 'a', numerator: 2, denominator: 4, isCorrect: true },
      { id: 'b', numerator: 3, denominator: 4, isCorrect: false },
      { id: 'c', numerator: 5, denominator: 8, isCorrect: false },
    ],
    conceptTag: 'equivalent-fractions',
  },
  {
    id: 'q6',
    type: 'equivalent',
    prompt: 'Which pizza shows the same amount as 3/4?',
    targetFraction: '3/4',
    options: [
      { id: 'a', numerator: 2, denominator: 4, isCorrect: false },
      { id: 'b', numerator: 6, denominator: 8, isCorrect: true },
      { id: 'c', numerator: 3, denominator: 8, isCorrect: false },
    ],
    conceptTag: 'equivalent-fractions',
  },
]

export default QUESTIONS
