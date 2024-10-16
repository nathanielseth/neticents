import PropTypes from "prop-types";

const LineChart = ({ deductions }) => {
	const getWidthPercentage = (amount) => (amount / deductions.total) * 100;

	return (
		<div className="relative mt-7 w-full h-2 bg-gray-300 rounded-full">
			{/* Withholding Tax */}
			<div
				className="absolute h-full bg-red-500 rounded-l-full"
				style={{ width: `${getWidthPercentage(deductions.withholdingTax)}%` }}
				title={`Withholding Tax (${getWidthPercentage(
					deductions.withholdingTax
				).toFixed(2)}%)`}
			></div>

			{/* GSIS Contribution */}
			<div
				className="absolute h-full bg-green-500"
				style={{
					width: `${getWidthPercentage(deductions.gsis)}%`,
					left: `${getWidthPercentage(deductions.withholdingTax)}%`,
				}}
				title={`GSIS Contribution (${getWidthPercentage(
					deductions.gsis
				).toFixed(2)}%)`}
			></div>

			{/* SSS Contribution */}
			<div
				className="absolute h-full bg-green-500"
				style={{
					width: `${getWidthPercentage(deductions.sss)}%`,
					left: `${getWidthPercentage(
						deductions.withholdingTax + deductions.gsis
					)}%`,
				}}
				title={`SSS Contribution (${getWidthPercentage(deductions.sss).toFixed(
					2
				)}%)`}
			></div>

			{/* PhilHealth Contribution */}
			<div
				className="absolute h-full bg-purple-500"
				style={{
					width: `${getWidthPercentage(deductions.philHealth)}%`,
					left: `${getWidthPercentage(
						deductions.withholdingTax + deductions.gsis + deductions.sss
					)}%`,
				}}
				title={`PhilHealth Contribution (${getWidthPercentage(
					deductions.philHealth
				).toFixed(2)}%)`}
			></div>

			{/* Pag-Ibig Contribution */}
			<div
				className="absolute h-full bg-yellow-500 rounded-r-full"
				style={{
					width: `${getWidthPercentage(deductions.pagIbig)}%`,
					left: `${getWidthPercentage(
						deductions.withholdingTax +
							deductions.gsis +
							deductions.sss +
							deductions.philHealth
					)}%`,
				}}
				title={`Pag-Ibig Contribution (${getWidthPercentage(
					deductions.pagIbig
				).toFixed(2)}%)`}
			></div>
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
