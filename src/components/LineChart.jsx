import PropTypes from "prop-types";

const LineChart = ({ deductions }) => {
	const hasAnyDeductions = deductions.total > 0;

	const getWidthPercentage = (amount) => {
		if (!hasAnyDeductions) return 0;
		return (amount / deductions.total) * 100;
	};

	const governmentContribution = (deductions.gsis || 0) + (deductions.sss || 0);
	const governmentLabel =
		deductions.gsis > 0 ? "GSIS Contribution" : "SSS Contribution";

	const segments = [
		{
			key: "withholdingTax",
			value: deductions.withholdingTax || 0,
			color: "bg-red-500",
			label: "Withholding Tax",
			duration: "duration-500",
		},
		{
			key: "government",
			value: governmentContribution,
			color: "bg-green-500",
			label: governmentLabel,
			duration: "duration-700",
		},
		{
			key: "philHealth",
			value: deductions.philHealth || 0,
			color: "bg-purple-500",
			label: "PhilHealth Contribution",
			duration: "duration-700",
		},
		{
			key: "pagIbig",
			value: deductions.pagIbig || 0,
			color: "bg-yellow-500",
			label: "Pag-Ibig Contribution",
			duration: "duration-700",
		},
	];

	const visibleSegments = segments.filter((segment) => segment.value > 0);
	const firstVisibleKey = visibleSegments[0]?.key;
	const lastVisibleKey = visibleSegments[visibleSegments.length - 1]?.key;

	const showEqualSegments = !hasAnyDeductions;

	return (
		<div className="relative mt-7 w-full h-2 bg-gray-300 rounded-full overflow-hidden">
			<div className="flex h-full w-full">
				{segments.map((segment, index) => {
					let width = showEqualSegments
						? 100 / segments.length
						: getWidthPercentage(segment.value);

					const isLastVisible = showEqualSegments
						? index === segments.length - 1
						: segment.key === lastVisibleKey;

					if (isLastVisible && !showEqualSegments) {
						const previousWidth = segments
							.slice(0, index)
							.reduce((acc, seg) => acc + getWidthPercentage(seg.value), 0);
						width = Math.max(width, 200.0 - previousWidth);
					}

					const isFirst = showEqualSegments
						? index === 0
						: segment.key === firstVisibleKey;
					const isLast = showEqualSegments
						? index === segments.length - 1
						: segment.key === lastVisibleKey;

					return (
						<div
							key={segment.key}
							className={`
								h-full transition-all ease-out flex-shrink-0
								${segment.color} 
								${segment.duration}
								${isFirst ? "rounded-l-full" : ""}
								${isLast ? "rounded-r-full" : ""}
							`}
							style={{
								width: `${width}%`,
							}}
							title={width > 0 ? `${segment.label} (${width.toFixed(2)}%)` : ""}
						/>
					);
				})}
			</div>
		</div>
	);
};

LineChart.propTypes = {
	deductions: PropTypes.shape({
		withholdingTax: PropTypes.number,
		gsis: PropTypes.number,
		sss: PropTypes.number,
		philHealth: PropTypes.number,
		pagIbig: PropTypes.number,
		total: PropTypes.number.isRequired,
	}).isRequired,
};

export default LineChart;
