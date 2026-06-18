// comma-group regex: a digit position qualifies for a trailing comma only if
// it's followed by a complete group of three digits all the way to the end
export const numberFormat = (num: number | string): string => {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const parseFormattedNumber = (str: string): number => {
	const parsedValue = parseFloat(str.replace(/[^0-9.]/g, ""));
	return isNaN(parsedValue) ? 0.0 : parsedValue;
};