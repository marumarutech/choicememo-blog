const DEFAULT_MIN = 120
const DEFAULT_MAX = 980

// Creates a stable pseudo-random number from the provided seed string.
function hashString(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getFauxLikeCount(seed: string, min = DEFAULT_MIN, max = DEFAULT_MAX): number {
  if (min >= max) {
    return min
  }

  const span = max - min
  const hashed = hashString(seed)
  return (hashed % (span + 1)) + min
}
