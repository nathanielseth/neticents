import type { Deductions } from "../types";
import { DEDUCTION_META, type DeductionKey } from "../utils/deductionMeta";

interface LineChartProps {
	deductions: Deductions;
	highlightedKey?: DeductionKey | null;
}

interface Segment {
	key: DeductionKey;
	value: number;
	label: string;
}

const LineChart = ({ deductions, highlightedKey = null }: LineChartProps) => {
	const hasAnyDeductions = deductions.total > 0;

	const getWidthPercentage = (amount: number): number => {
		if (!hasAnyDeductions) return 0;
		return (amount / deductions.total) * 100;
	};

	const governmentKey: DeductionKey = deductions.gsis > 0 ? "gsis" : "sss";
	const governmentContribution = (deductions.gsis || 0) + (deductions.sss || 0);

	const segments: Segment[] = [
		{
			key: "withholdingTax",
			value: deductions.withholdingTax || 0,
			label: DEDUCTION_META.withholdingTax.label,
		},
		{
			key: governmentKey,
			value: governmentContribution,
			label: DEDUCTION_META[governmentKey].label,
		},
		{
			key: "philHealth",
			value: deductions.philHealth || 0,
			label: DEDUCTION_META.philHealth.label,
		},
		{
			key: "pagIbig",
			value: deductions.pagIbig || 0,
			label: DEDUCTION_META.pagIbig.label,
		},
	];

	const visibleSegments = segments.filter((segment) => segment.value > 0);
	const firstVisibleKey = visibleSegments[0]?.key;
	const lastVisibleKey = visibleSegments[visibleSegments.length - 1]?.key;

	const showEqualSegments = !hasAnyDeductions;

	return (
		<div className="relative mt-7 w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
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
						width = Math.max(width, 100 - previousWidth);
					}

					const isFirst = showEqualSegments
						? index === 0
						: segment.key === firstVisibleKey;
					const isLast = showEqualSegments
						? index === segments.length - 1
						: segment.key === lastVisibleKey;
					
					const matchesHighlight =
						highlightedKey === segment.key ||
						(segment.key === governmentKey &&
							(highlightedKey === "gsis" || highlightedKey === "sss"));
					const isDimmed = highlightedKey !== null && !matchesHighlight;

					return (
						<div
							key={segment.key}
							className={`
                h-full transition-[width,opacity] duration-300 ease-out shrink-0
                ${DEDUCTION_META[segment.key].colorClass}
                ${isDimmed ? "opacity-30" : "opacity-100"}
                ${isFirst ? "rounded-l-full" : ""}
                ${isLast ? "rounded-r-full" : ""}
              `}
							style={{ width: `${width}%` }}
							title={width > 0 ? `${segment.label} (${width.toFixed(2)}%)` : ""}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default LineChart;