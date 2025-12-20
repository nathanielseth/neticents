// formats a number with commas
export const numberFormat = (num: number | string): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// parses a formatted number string with commas back to a number
export const parseFormattedNumber = (str: string): number => {
  const parsedValue = parseFloat(str.replace(/[^0-9.]/g, ''))
  return isNaN(parsedValue) ? 0.0 : parsedValue
}

// handles input formatting by parsing and re-formatting value
export const handleInput = (value: string): string => {
  return numberFormat(parseFormattedNumber(value))
}