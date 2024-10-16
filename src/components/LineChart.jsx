import PropTypes from "prop-types";

const LineChart = ({ deductions }) => {
	const getWidthPercentage = (amount) => (amount / deductions.total) * 100;

	return (
		<div className="relative mt-7 w-full h-2 bg-gray-300 rounded-full">
			{/* Withholding Tax */}
			{deductions.withholdingTax > 0 && (
				<div
					className="absolute h-full bg-red-500 rounded-l-full"
					style={{ width: `${getWidthPercentage(deductions.withholdingTax)}%` }}
					title={`Withholding Tax (${getWidthPercentage(
						deductions.withholdingTax
					).toFixed(2)}%)`}
				></div>
			)}

			{/* GSIS Contribution */}
			{deductions.gsis > 0 && (
				<div
					className="absolute h-full bg-green-500"
					style={{
						width: `${getWidthPercentage(deductions.gsis)}%`,
						left: `${
							deductions.withholdingTax > 0
								? getWidthPercentage(deductions.withholdingTax)
								: 0
						}%`,
					}}
					title={`GSIS Contribution (${getWidthPercentage(
						deductions.gsis
					).toFixed(2)}%)`}
				></div>
			)}

			{/* SSS Contribution */}
			{deductions.sss > 0 && (
				<div
					className="absolute h-full bg-green-500"
					style={{
						width: `${getWidthPercentage(deductions.sss)}%`,
						left: `${
							getWidthPercentage(deductions.withholdingTax) +
							(deductions.gsis > 0 ? getWidthPercentage(deductions.gsis) : 0)
						}%`,
					}}
					title={`SSS Contribution (${getWidthPercentage(
						deductions.sss
					).toFixed(2)}%)`}
				></div>
			)}

			{/* PhilHealth Contribution */}
			{deductions.philHealth > 0 && (
				<div
					className="absolute h-full bg-purple-500"
					style={{
						width: `${getWidthPercentage(deductions.philHealth)}%`,
						left: `${
							getWidthPercentage(deductions.withholdingTax) +
							(deductions.gsis > 0 ? getWidthPercentage(deductions.gsis) : 0) +
							(deductions.sss > 0 ? getWidthPercentage(deductions.sss) : 0)
						}%`,
					}}
					title={`PhilHealth Contribution (${getWidthPercentage(
						deductions.philHealth
					).toFixed(2)}%)`}
				></div>
			)}

			{/* Pag-Ibig Contribution */}
			{deductions.pagIbig > 0 && (
				<div
					className="absolute h-full bg-yellow-500 rounded-r-full"
					style={{
						width: `${getWidthPercentage(deductions.pagIbig)}%`,
						left: `${
							getWidthPercentage(deductions.withholdingTax) +
							(deductions.gsis > 0 ? getWidthPercentage(deductions.gsis) : 0) +
							(deductions.sss > 0 ? getWidthPercentage(deductions.sss) : 0) +
							(deductions.philHealth > 0
								? getWidthPercentage(deductions.philHealth)
								: 0)
						}%`,
					}}
					title={`Pag-Ibig Contribution (${getWidthPercentage(
						deductions.pagIbig
					).toFixed(2)}%)`}
				></div>
			)}
		</div>
	);
};

LineChart.propTypes = {
	deductions: PropTypes.shape({
		withholdingTax: PropTypes.number.isRequired,
		gsis: PropTypes.number.isRequired,
		sss: PropTypes.number.isRequired,
		philHealth: PropTypes.number.isRequired,
		pagIbig: PropTypes.number.isRequired,
		total: PropTypes.number.isRequired,
	}).isRequired,
};

export default LineChart;
