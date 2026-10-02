// group only the integer part; a fractional part must never get thousands separators
export const numberFormat = (num: number | string): string => {
	const [integer, fraction] = num.toString().split(".");
	const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return fraction === undefined ? grouped : `${grouped}.${fraction}`;
};

export const parseFormattedNumber = (str: string): number => {
	const parsedValue = parseFloat(str.replace(/[^0-9.]/g, ""));
	return isNaN(parsedValue) ? 0.0 : parsedValue;
};

// keeps digits and a single decimal point, at most 2 decimals (centavos)
export const sanitizeDecimalInput = (raw: string): string => {
	const [integer, ...rest] = raw.replace(/[^0-9.]/g, "").split(".");
	return rest.length === 0 ? integer : `${integer}.${rest.join("").slice(0, 2)}`;
};

// what the field shows while typing: preserves a trailing "." or "0" so decimals can be entered
export const formatDraft = (sanitized: string): string => {
	const [integer, fraction] = sanitized.split(".");
	return fraction === undefined
		? numberFormat(integer)
		: `${numberFormat(integer)}.${fraction}`;
};

export const formatPeso = (amount: number, fractionDigits = 2): string =>
	`₱${amount.toLocaleString("en-US", {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	})}`;
