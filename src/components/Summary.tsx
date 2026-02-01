import { useState } from "react";
import type { PayPeriod, PayPeriodOption, TaxResults } from "../types";
import LineChart from "./LineChart";
import { numberFormat } from "../utils/format";

const DEDUCTION_LABELS: Record<string, string> = {
	withholdingTax: "Withholding Tax",
	gsis: "GSIS Contribution",
	sss: "SSS Contribution",
	philHealth: "PhilHealth Contribution",
	pagIbig: "Pag-IBIG Contribution",
};

const DEDUCTION_COLORS: Record<string, string> = {
	withholdingTax: "bg-red-500",
	gsis: "bg-green-500",
	sss: "bg-green-500",
	philHealth: "bg-purple-500",
	pagIbig: "bg-yellow-500",
};

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
	const multiplier = getMultiplier(payPeriod);

	const displayTakeHomePay = results.takeHomePay * multiplier;
	const displayTotalDeductions = results.totalDeductions * multiplier;

	return (
		<div className="relative">
			<div
				className="p-6 rounded-lg border-t border-l border-r border-b-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-t-gray-200 dark:border-t-gray-700 border-l-gray-200 dark:border-l-gray-700 border-r-gray-200 dark:border-r-gray-700 border-b-[#4169e1]"
				style={{ boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)" }}
			>
				<div className="flex justify-center mb-5">
					<div className="flex items-center p-1 rounded-full bg-gray-200 dark:bg-gray-700">
						{PAY_PERIOD_OPTIONS.map((option) => (
							<button
								key={option.value}
								className={`px-3 py-1 rounded-full ${
									payPeriod === option.value
										? "bg-[#4169e1] text-white shadow-sm"
										: "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
								}`}
								onClick={() => setPayPeriod(option.value)}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>

				<h3 className="text-md font-normal text-center text-gray-600 dark:text-gray-300 mt-1 mb-2">
					Take Home Pay:
				</h3>
				<div className="grid grid-cols-1 justify-items-center">
					<h1 className="text-4xl font-bold text-[#4169e1] dark:text-blue-400">
						₱
						{displayTakeHomePay.toLocaleString("en-US", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</h1>
				</div>

				<LineChart deductions={results.deductions} />

				<div className="mt-6 space-y-4 text-gray-900 dark:text-gray-300">
					{results.visibleDeductions.map(([key, value]) => (
						<div className="flex justify-between items-center" key={key}>
							<span className="flex items-center">
								<span
									className={`w-3 h-3 rounded-full ${DEDUCTION_COLORS[key] || ""} mr-2`}
								></span>
								<span className="font-semibold text-zinc-600 dark:text-gray-300">
									{DEDUCTION_LABELS[key] || key}
								</span>
							</span>
							<span className="font-bold">
								₱{numberFormat((value * multiplier).toFixed(2))}
							</span>
						</div>
					))}

					<div className="flex justify-between items-center font-bold">
						<span>Total Deductions</span>
						<span>₱{numberFormat(displayTotalDeductions.toFixed(2))}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Summary;
