export type ResolutionDimension = number | ''

const COMMON_ASPECT_RATIOS = [
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '16:10', value: 16 / 10 },
]

const COMMON_RATIO_TOLERANCE = 0.02

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

export function deriveAspectRatioFromResolution(width: ResolutionDimension, height: ResolutionDimension): string {
  if (!width || !height || width <= 0 || height <= 0) return '-'

  const ratio = width / height
  const commonRatio = COMMON_ASPECT_RATIOS.find(({ value }) => Math.abs(ratio - value) <= COMMON_RATIO_TOLERANCE)
  if (commonRatio) return commonRatio.label

  const divisor = gcd(width, height)
  return `${width / divisor}:${height / divisor}`
}
