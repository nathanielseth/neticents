import { useState } from "react";
import type { PayPeriod, TaxResults } from "../types";
import DeductionBar from "./DeductionBar";
import InfoTip from "./InfoTip";
import Segmented from "./Segmented";
import type { SegmentedOption } from "./Segmented";
import { formatPeso } from "../utils/format";
import {
	DEDUCTION_META,
	deductionLabel,
	type DeductionKey,
} from "../utils/deductionMeta";

const PAY_PERIOD_OPTIONS: readonly SegmentedOption<PayPeriod>[] = [
	{ value: "monthly", label: "Monthly" },
	{ value: "semimonthly", label: "Semi-Mo" },
	{ value: "annual", label: "Annual" },
	{ value: "biweekly", label: "Biweekly" },
];

const PERIOD_CAPTIONS: Record<PayPeriod, string> = {
	monthly: "per month",
	semimonthly: "per payout, twice a month",
	biweekly: "per payout, every two weeks",
	annual: "per year",
};

function getMultiplier(period: PayPeriod): number {
	switch (period) {
		case "semimonthly":
			return 1 / 2;
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

	const { sector } = results.inputs;
	const isAnnual = payPeriod === "annual";
	const yearEndPay = isAnnual ? results.annualBenefits.yearEnd : 0;
	const displayTakeHomePay = results.takeHomePay * multiplier + yearEndPay;
	const displayTotalDeductions = results.totalDeductions * multiplier;

	const lines = results.visibleDeductions.map(([key, value]) => ({
		key: key as DeductionKey,
		value,
	}));

	const percentageTaxLine = lines.find((l) => l.key === "percentageTax");
	const taxLine = lines.find((l) => l.key === "withholdingTax");
	const taxSplit =
		percentageTaxLine && taxLine
			? { incomeTax: taxLine.value, percentageTax: percentageTaxLine.value }
			: null;
	const displayLines = taxSplit
		? lines
				.filter((l) => l.key !== "percentageTax")
				.map((l) =>
					l.key === "withholdingTax"
						? { ...l, value: taxSplit.incomeTax + taxSplit.percentageTax }
						: l,
				)
		: lines;

	return (
		<section
			aria-label="Summary"
			className="rounded-2xl border border-line bg-surface p-6"
		>
			<Segmented
				label="Pay Period"
				hideLabel
				compact
				options={PAY_PERIOD_OPTIONS}
				value={payPeriod}
				onChange={setPayPeriod}
			/>

			<div className="mt-6 text-center">
				<h2 className="text-sm font-medium text-muted">Take Home Pay</h2>
				<p className="mt-1 text-4xl font-bold tracking-tight text-accent tabular-nums">
					{formatPeso(displayTakeHomePay)}
				</p>
				<p className="mt-1 h-4 text-xs text-muted">
					{PERIOD_CAPTIONS[payPeriod]}
				</p>
			</div>

			<DeductionBar lines={displayLines} highlightedKey={hoveredKey} />

			<dl className="mt-6 flex flex-col gap-1 text-sm">
				{displayLines.map(({ key, value }) => (
					<div
						key={key}
						className={`flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-[background-color,opacity] motion-reduce:transition-none ${
							hoveredKey === key ? "bg-sunken" : ""
						} ${hoveredKey !== null && hoveredKey !== key ? "opacity-50" : ""}`}
						onMouseEnter={() => setHoveredKey(key)}
						onMouseLeave={() => setHoveredKey(null)}
					>
						<dt className="flex items-center gap-2 text-muted">
							<span
								aria-hidden
								className={`size-2.5 shrink-0 rounded-full ${DEDUCTION_META[key].colorClass}`}
							/>
							{key === "withholdingTax" && taxSplit
								? "Income & Percentage Tax"
								: deductionLabel(key, sector, results.appliedTaxRegime)}
							{key === "withholdingTax" && taxSplit && (
								<InfoTip label="About Income & Percentage Tax">
									<span className="flex justify-between gap-4">
										<span className="text-muted">Income tax</span>
										<span className="font-medium tabular-nums">
											{formatPeso(taxSplit.incomeTax * multiplier)}
										</span>
									</span>
									<span className="mt-1 flex justify-between gap-4">
										<span className="text-muted">Percentage tax (3%)</span>
										<span className="font-medium tabular-nums">
											{formatPeso(taxSplit.percentageTax * multiplier)}
										</span>
									</span>
								</InfoTip>
							)}
						</dt>
						<dd className="font-semibold text-fg tabular-nums">
							{formatPeso(value * multiplier)}
						</dd>
					</div>
				))}

				<div className="mt-2 flex items-center justify-between gap-3 border-t border-line px-2 pt-3 font-semibold text-fg">
					<dt>Total Deductions</dt>
					<dd className="tabular-nums">{formatPeso(displayTotalDeductions)}</dd>
				</div>
			</dl>
		</section>
	);
};

export default Summary;