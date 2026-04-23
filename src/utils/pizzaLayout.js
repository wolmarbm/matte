// Geometry + deterministic topping placement for circular pizza slices.
// The PRNG is seeded by (sliceIndex, totalSlices, salt) so the same slice
// always renders the same topping pattern across re-renders while still
// looking random compared to its neighbors.

export function polarPoint(cx, cy, angleDeg, radius) {
  const rad = (angleDeg * Math.PI) / 180
  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)]
}

export function buildSlicePath(cx, cy, r, index, totalSlices) {
  if (totalSlices <= 1) {
    return `M ${cx - r},${cy} A ${r},${r} 0 1,1 ${cx + r},${cy} A ${r},${r} 0 1,1 ${cx - r},${cy} Z`
  }
  const sliceAngle = 360 / totalSlices
  const startAngle = -90 + index * sliceAngle
  const endAngle = startAngle + sliceAngle
  const [x1, y1] = polarPoint(cx, cy, startAngle, r)
  const [x2, y2] = polarPoint(cx, cy, endAngle, r)
  const largeArc = sliceAngle > 180 ? 1 : 0
  return `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`
}

// mulberry32 — tiny, fast, deterministic PRNG.
function mulberry32(seed) {
  let a = seed | 0
  return function rand() {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Scatter `count` topping centers inside a single wedge.
// Returns [{ x, y, size }] where `size` varies slightly for an organic look.
//
// A topping stays fully inside its slice when:
//   - its center radius rho is in [toppingRadius + innerMargin, r - toppingRadius - outerMargin]
//   - its angular distance from the slice's radial edges is > asin(toppingRadius / rho)
// We reject samples that violate those bounds and also reject samples that
// would overlap with already-placed toppings.
export function computeToppingPositions({
  cx,
  cy,
  r,
  index,
  totalSlices,
  toppingRadius,
  count,
  seedSalt = 0,
  sizeJitter = 0.2,
  innerMargin = 6,
  outerMargin = 4,
  angularBuffer = 3,
  separationFactor = 2.1,
}) {
  const sliceAngle = totalSlices > 0 ? 360 / totalSlices : 360
  const startAngle = -90 + index * sliceAngle

  const halfAngle = sliceAngle / 2
  const safeHalfAngle = Math.max(5, halfAngle - angularBuffer)
  const rhoMinConstraint =
    toppingRadius / Math.sin((safeHalfAngle * Math.PI) / 180)
  const rhoMin = Math.max(toppingRadius + innerMargin, rhoMinConstraint)
  const rhoMax = r - toppingRadius - outerMargin

  // If there's literally no room, fall back to a single centered topping.
  if (rhoMin >= rhoMax) {
    const midAngle = startAngle + sliceAngle / 2
    const [x, y] = polarPoint(cx, cy, midAngle, Math.max(0, r * 0.55))
    return [{ x, y, size: toppingRadius }]
  }

  const rand = mulberry32(
    (index + 1) * 2654435761 +
      (totalSlices + 1) * 40503 +
      (seedSalt + 1) * 2246822519
  )

  const positions = []
  const minSep = toppingRadius * separationFactor
  let attempts = 0
  const maxAttempts = count * 30

  while (positions.length < count && attempts < maxAttempts) {
    attempts++
    // Uniform-area sampling in the annulus.
    const u = rand()
    const rho = Math.sqrt(
      rhoMin * rhoMin + u * (rhoMax * rhoMax - rhoMin * rhoMin)
    )
    const angMargin =
      (Math.asin(Math.min(0.95, toppingRadius / rho)) * 180) / Math.PI +
      angularBuffer
    const angMin = startAngle + angMargin
    const angMax = startAngle + sliceAngle - angMargin
    if (angMin >= angMax) continue
    const ang = angMin + rand() * (angMax - angMin)
    const [x, y] = polarPoint(cx, cy, ang, rho)

    const tooClose = positions.some((p) => {
      const dx = x - p.x
      const dy = y - p.y
      return dx * dx + dy * dy < minSep * minSep
    })
    if (tooClose) continue

    const size = toppingRadius * (1 - sizeJitter + rand() * sizeJitter * 2)
    positions.push({ x, y, size })
  }

  return positions
}
