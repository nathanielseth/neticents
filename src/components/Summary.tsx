import { useState } from "react";
import type { PayPeriod, PayPeriodOption, TaxResults } from "../types";
import LineChart from "./LineChart";
import { numberFormat } from "../utils/format";
import { DEDUCTION_META, type DeductionKey } from "../utils/deductionMeta";

const PAY_PERIOD_OPTIONS: PayPeriodOption[] = [
	{ value: "monthly", label: "Monthly" },
	{ value: "annual", label: "Annual" },
	{ value: "biweekly", label: "Biweekly" },
];

function getMultiplier(period: PayPeriod): number {
	switch (period) {
		case "biweekly":
			return 12 / 26;
		case "annual":
			return 12;
		default:
			return 1;
	}
}

interface SummaryProps {
	results: TaxResults;
}

const Summary = ({ results }: SummaryProps) => {
	const [payPeriod, setPayPeriod] = useState<PayPeriod>("monthly");
	const [hoveredKey, setHoveredKey] = useState<DeductionKey | null>(null);
	const multiplier = getMultiplier(payPeriod);

	const displayTakeHomePay = results.takeHomePay * multiplier;
	const displayTotalDeductions = results.totalDeductions * multiplier;

	return (
		<div className="card p-6">
			<div className="flex justify-center mb-6">
				<div className="flex items-center p-1 rounded-full bg-neutral-100 dark:bg-neutral-900">
					{PAY_PERIOD_OPTIONS.map((option) => (
						<button
							key={option.value}
							type="button"
							className={`px-3 py-1 rounded-full text-sm font-medium ${
								payPeriod === option.value
									? "bg-brand text-white"
									: "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
							}`}
							onClick={() => setPayPeriod(option.value)}
						>
							{option.label}
						</button>
					))}
				</div>
			</div>

			<h3 className="text-sm font-medium text-center text-neutral-500 dark:text-neutral-400 mb-1">
				Take Home Pay
			</h3>
			<p className="text-center text-4xl font-bold tracking-tight text-brand dark:text-blue-400">
				₱
				{displayTakeHomePay.toLocaleString("en-US", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})}
			</p>

			<LineChart deductions={results.deductions} highlightedKey={hoveredKey} />

			<div className="mt-6 space-y-1 text-sm">
				{results.visibleDeductions.map(([key, value]) => {
					const meta = DEDUCTION_META[key as DeductionKey];
					const isHovered = hoveredKey === key;
					const isDimmed = hoveredKey !== null && !isHovered;
					return (
						<div
							className={`flex justify-between items-center rounded-md px-2 py-1.5 ${
								isHovered ? "bg-neutral-100 dark:bg-neutral-700/50" : ""
							}`}
							key={key}
							onMouseEnter={() => setHoveredKey(key as DeductionKey)}
							onMouseLeave={() => setHoveredKey(null)}
						>
							<span
								className={`flex items-center gap-2 transition-opacity ${isDimmed ? "opacity-50" : ""}`}
							>
								<span
									className={`w-2.5 h-2.5 rounded-full ${meta?.colorClass ?? ""}`}
								></span>
								<span
									className={`text-neutral-600 dark:text-neutral-300 ${isHovered ? "font-semibold text-neutral-900 dark:text-white" : "font-medium"}`}
								>
									{meta?.label ?? key}
								</span>
							</span>
							<span
								className={`text-neutral-900 dark:text-white transition-opacity ${isDimmed ? "opacity-50" : ""} ${isHovered ? "font-bold" : "font-semibold"}`}
							>
								₱{numberFormat((value * multiplier).toFixed(2))}
							</span>
						</div>
					);
				})}

				<div className="flex justify-between items-center pt-3 mt-1 border-t border-neutral-200 dark:border-neutral-800 font-semibold text-neutral-900 dark:text-white">
					<span>Total Deductions</span>
					<span>₱{numberFormat(displayTotalDeductions.toFixed(2))}</span>
				</div>
			</div>
		</div>
	);
};

export default Summary;