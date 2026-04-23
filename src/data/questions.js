// Each question has a `type` field. Supported types:
//   - 'build'      : student selects `numerator` slices out of `denominator`
//   - 'complete'   : pizza has `prefilledSlices` already filled; student must
//                    add the missing part. `numerator` is the COUNT OF MISSING
//                    SLICES the student needs to add; `denominator` is the
//                    total slice count. The question's displayed target is
//                    `targetFraction` (e.g., "7/8") — the final amount.
//   - 'equivalent' : student picks one of `options` that equals `targetFraction`.
//                    `targetFraction` may be a fraction string ("1/2") OR a
//                    decimal string ("0.5"). Each option has
//                    { id, numerator, denominator, isCorrect }.
//   - 'compare'    : student picks the option that is `comparison` ('larger' or
//                    'smaller'). Each option has
//                    { id, label, numerator, denominator, isCorrect }.
//                    If `hideVisuals: true`, the option cards render the label
//                    only (no pizza) — used in later decimal/fraction compares
//                    to push students beyond visual estimation.
//   - 'add'        : same-denominator fraction addition. `addends` is an array
//                    of { numerator, denominator } (all sharing one
//                    denominator). `numerator` is the expected answer's
//                    numerator; `denominator` is the shared denominator.
//                    If `hideVisuals` is falsy, two mini addend pizzas are
//                    rendered and the student builds the sum on a PizzaBoard.
//                    If `hideVisuals: true`, `options` is used instead (same
//                    shape as compare options) — no pizzas shown.
//
// Ordering ramps up difficulty: builds → equivalent (fractions) → compare
// (fractions) → equivalent (decimals) → compare (decimals, visible) →
// compare (decimals, hidden pizzas) → add (pizzas) → add (no pizzas).
export const QUESTIONS = [
  // --- Parts of a whole (builds + a complete) ---
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
    prompt: 'This pizza already has 5/8 filled. Add slices until it shows 7/8.',
    // numerator = missing slice count (2); denominator = total slices (8);
    // targetFraction is the goal amount for display and result tracking.
    numerator: 2,
    denominator: 8,
    targetFraction: '7/8',
    prefilledSlices: [0, 1, 2, 3, 4],
    conceptTag: 'parts-of-whole',
  },
  {
    id: 'q4',
    type: 'build',
    prompt: 'Build 0.7 of a pizza',
    numerator: 7,
    denominator: 10,
    conceptTag: 'parts-of-whole',
  },

  // --- Equivalent fractions (fraction targets) ---
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
  {
    id: 'q7',
    type: 'equivalent',
    prompt: 'Which pizza shows the same amount as 2/3?',
    targetFraction: '2/3',
    options: [
      { id: 'a', numerator: 4, denominator: 6, isCorrect: true },
      { id: 'b', numerator: 2, denominator: 4, isCorrect: false },
      { id: 'c', numerator: 3, denominator: 8, isCorrect: false },
    ],
    conceptTag: 'equivalent-fractions',
  },

  // --- Comparing fractions (with pizzas) ---
  {
    id: 'q8',
    type: 'compare',
    prompt: 'Which is larger: 1/4 or 2/6?',
    comparison: 'larger',
    options: [
      { id: 'a', label: '1/4', numerator: 1, denominator: 4, isCorrect: false },
      { id: 'b', label: '2/6', numerator: 2, denominator: 6, isCorrect: true },
    ],
    conceptTag: 'compare-fractions',
  },
  {
    id: 'q9',
    type: 'compare',
    prompt: 'Which is larger: 1/2 or 3/8?',
    comparison: 'larger',
    options: [
      { id: 'a', label: '1/2', numerator: 1, denominator: 2, isCorrect: true },
      { id: 'b', label: '3/8', numerator: 3, denominator: 8, isCorrect: false },
    ],
    conceptTag: 'compare-fractions',
  },
  {
    id: 'q10',
    type: 'compare',
    prompt: 'Which is smaller: 3/4 or 5/8?',
    comparison: 'smaller',
    options: [
      { id: 'a', label: '3/4', numerator: 3, denominator: 4, isCorrect: false },
      { id: 'b', label: '5/8', numerator: 5, denominator: 8, isCorrect: true },
    ],
    conceptTag: 'compare-fractions',
  },
  {
    id: 'q11',
    type: 'compare',
    prompt: 'Which is larger: 2/3 or 5/8?',
    comparison: 'larger',
    options: [
      { id: 'a', label: '2/3', numerator: 2, denominator: 3, isCorrect: true },
      { id: 'b', label: '5/8', numerator: 5, denominator: 8, isCorrect: false },
    ],
    conceptTag: 'compare-fractions',
  },

  // --- Equivalent fractions (decimal targets, pizzas shown) ---
  {
    id: 'q12',
    type: 'equivalent',
    prompt: 'Which pizza shows the same amount as 0.5?',
    targetFraction: '0.5',
    options: [
      { id: 'a', numerator: 3, denominator: 8, isCorrect: false },
      { id: 'b', numerator: 2, denominator: 4, isCorrect: true },
      { id: 'c', numerator: 5, denominator: 8, isCorrect: false },
    ],
    conceptTag: 'equivalent-fractions',
  },
  {
    id: 'q13',
    type: 'equivalent',
    prompt: 'Which pizza shows the same amount as 0.25?',
    targetFraction: '0.25',
    options: [
      { id: 'a', numerator: 2, denominator: 6, isCorrect: false },
      { id: 'b', numerator: 3, denominator: 8, isCorrect: false },
      { id: 'c', numerator: 1, denominator: 4, isCorrect: true },
    ],
    conceptTag: 'equivalent-fractions',
  },
  {
    id: 'q14',
    type: 'equivalent',
    prompt: 'Which pizza shows the same amount as 0.75?',
    targetFraction: '0.75',
    options: [
      { id: 'a', numerator: 6, denominator: 8, isCorrect: true },
      { id: 'b', numerator: 5, denominator: 8, isCorrect: false },
      { id: 'c', numerator: 2, denominator: 3, isCorrect: false },
    ],
    conceptTag: 'equivalent-fractions',
  },
  {
    id: 'q15',
    type: 'equivalent',
    prompt: 'Which pizza shows the same amount as 0.4?',
    targetFraction: '0.4',
    options: [
      { id: 'a', numerator: 3, denominator: 8, isCorrect: false },
      { id: 'b', numerator: 4, denominator: 10, isCorrect: true },
      { id: 'c', numerator: 2, denominator: 6, isCorrect: false },
    ],
    conceptTag: 'equivalent-fractions',
  },

  // --- Comparing fractions with decimals (pizzas still shown) ---
  {
    id: 'q16',
    type: 'compare',
    prompt: 'Which is larger: 0.25 or 3/8?',
    comparison: 'larger',
    options: [
      { id: 'a', label: '0.25', numerator: 1, denominator: 4, isCorrect: false },
      { id: 'b', label: '3/8', numerator: 3, denominator: 8, isCorrect: true },
    ],
    conceptTag: 'compare-fractions',
  },
  {
    id: 'q17',
    type: 'compare',
    prompt: 'Which is larger: 0.75 or 5/8?',
    comparison: 'larger',
    options: [
      { id: 'a', label: '0.75', numerator: 3, denominator: 4, isCorrect: true },
      { id: 'b', label: '5/8', numerator: 5, denominator: 8, isCorrect: false },
    ],
    conceptTag: 'compare-fractions',
  },

  // --- Comparing fractions with decimals (pizzas HIDDEN — pure numeric) ---
  {
    id: 'q18',
    type: 'compare',
    prompt: 'Which is smaller: 0.5 or 2/3?',
    comparison: 'smaller',
    hideVisuals: true,
    options: [
      { id: 'a', label: '0.5', numerator: 1, denominator: 2, isCorrect: true },
      { id: 'b', label: '2/3', numerator: 2, denominator: 3, isCorrect: false },
    ],
    conceptTag: 'compare-fractions',
  },
  {
    id: 'q19',
    type: 'compare',
    prompt: 'Which is larger: 0.6 or 5/8?',
    comparison: 'larger',
    hideVisuals: true,
    options: [
      { id: 'a', label: '0.6', numerator: 3, denominator: 5, isCorrect: false },
      { id: 'b', label: '5/8', numerator: 5, denominator: 8, isCorrect: true },
    ],
    conceptTag: 'compare-fractions',
  },
  {
    id: 'q20',
    type: 'compare',
    prompt: 'Which is smaller: 0.4 or 1/3?',
    comparison: 'smaller',
    hideVisuals: true,
    options: [
      { id: 'a', label: '0.4', numerator: 2, denominator: 5, isCorrect: false },
      { id: 'b', label: '1/3', numerator: 1, denominator: 3, isCorrect: true },
    ],
    conceptTag: 'compare-fractions',
  },

  // --- Adding fractions with the same denominator (pizzas shown) ---
  {
    id: 'q21',
    type: 'add',
    prompt: 'Add the pizzas: 1/4 + 2/4. Build the answer.',
    addends: [
      { numerator: 1, denominator: 4 },
      { numerator: 2, denominator: 4 },
    ],
    numerator: 3,
    denominator: 4,
    conceptTag: 'add-fractions',
  },
  {
    id: 'q22',
    type: 'add',
    prompt: 'Add the pizzas: 2/6 + 3/6. Build the answer.',
    addends: [
      { numerator: 2, denominator: 6 },
      { numerator: 3, denominator: 6 },
    ],
    numerator: 5,
    denominator: 6,
    conceptTag: 'add-fractions',
  },
  {
    id: 'q23',
    type: 'add',
    prompt: 'Add the pizzas: 3/8 + 2/8. Build the answer.',
    addends: [
      { numerator: 3, denominator: 8 },
      { numerator: 2, denominator: 8 },
    ],
    numerator: 5,
    denominator: 8,
    conceptTag: 'add-fractions',
  },

  // --- Adding fractions with the same denominator (no pizzas — numeric) ---
  {
    id: 'q24',
    type: 'add',
    prompt: 'What is 2/5 + 1/5?',
    addends: [
      { numerator: 2, denominator: 5 },
      { numerator: 1, denominator: 5 },
    ],
    numerator: 3,
    denominator: 5,
    hideVisuals: true,
    options: [
      { id: 'a', label: '3/10', numerator: 3, denominator: 10, isCorrect: false },
      { id: 'b', label: '3/5', numerator: 3, denominator: 5, isCorrect: true },
      { id: 'c', label: '2/5', numerator: 2, denominator: 5, isCorrect: false },
    ],
    conceptTag: 'add-fractions',
  },
  {
    id: 'q25',
    type: 'add',
    prompt: 'What is 4/10 + 3/10?',
    addends: [
      { numerator: 4, denominator: 10 },
      { numerator: 3, denominator: 10 },
    ],
    numerator: 7,
    denominator: 10,
    hideVisuals: true,
    options: [
      { id: 'a', label: '7/20', numerator: 7, denominator: 20, isCorrect: false },
      { id: 'b', label: '12/10', numerator: 12, denominator: 10, isCorrect: false },
      { id: 'c', label: '7/10', numerator: 7, denominator: 10, isCorrect: true },
    ],
    conceptTag: 'add-fractions',
  },
]

export default QUESTIONS
