export const formatRunValue = (value: number): string => value.toFixed(1)

export const formatSportValue = (type: string, value: number): string => {
  return type === 'run' ? formatRunValue(value) : String(value)
}
