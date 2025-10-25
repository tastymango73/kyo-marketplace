export const toMs = (duration: string) => {
  const match = duration.match(/(\d+)([smhd])/)
  if (!match) {
    throw new Error('Invalid duration format')
  }

  const val = parseInt(match[1], 10)
  const unit = match[2]

  switch (unit) {
    case 's':
      return val * 1000
    case 'm':
      return val * 60 * 1000
    case 'h':
      return val * 60 * 60 * 1000
    case 'd':
      return val * 24 * 60 * 60 * 1000
    case 'w':
      return val * 7 * 24 * 60 * 60 * 1000
    case 'y':
      return val * 365 * 24 * 60 * 60 * 1000
    default:
      throw new Error('Unknown unit')
  }
}
