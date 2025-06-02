export const numberFormat = (num) =>
	num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const parseFormattedNumber = (str) => {
	const parsedValue = parseFloat(str.replace(/[^0-9.]/g, ""));
	return isNaN(parsedValue) ? 0.0 : parsedValue;
};

export const handleInput = (value) => {
	return numberFormat(parseFormattedNumber(value));
};
