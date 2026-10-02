import jsPDF from "jspdf";
import type { PremiumDayType, Sector, TaxResults } from "../types";
import { deductionLabel } from "./deductionMeta";
import {
	DE_MINIMIS_MONTHLY_LIMIT,
	EXEMPT_BENEFITS_ANNUAL_CAP,
} from "./calculation";

const SECTOR_NAMES: Record<Sector, string> = {
	private: "Private Employee",
	public: "Government Employee",
	selfemployed: "Self-Employed",
};

const PREMIUM_DAY_NAMES: Record<PremiumDayType, string> = {
	restDay: "Rest Day",
	specialDay: "Special Non-Working Day",
	specialRestDay: "Special Day on a Rest Day",
	regularHoliday: "Regular Holiday",
	holidayRestDay: "Regular Holiday on a Rest Day",
};

function formatCurrency(value: number): string {
	return `P${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const generateTaxSummaryPDF = async (
	results: TaxResults,
): Promise<string> => {
	const pdf = new jsPDF();
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	let y = 22;

	const {
		inputs,
		takeHomePay,
		grossIncome,
		visibleDeductions,
		totalDeductions,
		premiumPay,
		annualBenefits,
		effectiveRate,
	} = results;
	const { salary, allowance, sector } = inputs;
	const isSelfEmployed = sector === "selfemployed";

	// header
	pdf.setFont("helvetica", "bold");
	pdf.setFontSize(18);
	pdf.setTextColor(0, 0, 0);
	pdf.text("Income Tax Summary", 20, y);
	y += 6;

	pdf.setFont("helvetica", "normal");
	pdf.setFontSize(9);
	pdf.setTextColor(100, 100, 100);
	pdf.text(
		`Generated on ${new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}`,
		20,
		y,
	);
	y += 12;

	// employment information
	y = section(pdf, y, pageWidth, "Employment Information");

	pdf.setFont("helvetica", "normal");
	pdf.setFontSize(10);
	pdf.setTextColor(40, 40, 40);

	row(pdf, y, pageWidth, "Employment Type", SECTOR_NAMES[sector]);
	y += 6;
	row(pdf, y, pageWidth, "Monthly Basic Salary", formatCurrency(salary));
	y += 6;
	if (isSelfEmployed) {
		row(
			pdf,
			y,
			pageWidth,
			"Income Tax Option",
			results.appliedTaxRegime === "flat8" ? "8% Flat Rate" : "Graduated Rates",
		);
		y += 6;
	}

	// income breakdown (if there's anything beyond base salary)
	const hasPremium = premiumPay.totalPremiumPay > 0;
	const hasExtras = hasPremium || allowance > 0;

	if (hasExtras) {
		y += 2;
		y = section(pdf, y, pageWidth, "Income Breakdown");

		pdf.setFont("helvetica", "normal");
		pdf.setFontSize(10);
		pdf.setTextColor(40, 40, 40);

		// hours are split so each pay line matches its own hours (overlap is paid once)
		const { regularOvertimeHours, regularNightHours, overlapHours } =
			premiumPay.breakdown;
		const premiumLines: [string, number][] = [];
		if (regularOvertimeHours > 0) {
			premiumLines.push([
				`Overtime Pay (${regularOvertimeHours} hrs)`,
				premiumPay.regularOvertimePay,
			]);
		}
		if (regularNightHours > 0) {
			premiumLines.push([
				`Night Differential (${regularNightHours} hrs @ ${Math.round(premiumPay.breakdown.rates.nightDiffPremium * 100)}%)`,
				premiumPay.regularNightPay,
			]);
		}
		if (overlapHours > 0) {
			premiumLines.push([
				`Night Overtime (${overlapHours} hrs)`,
				premiumPay.nightOvertimePay,
			]);
		}
		for (const line of premiumPay.dayWork) {
			const name =
				sector === "public"
					? "Rest Day / Holiday Work"
					: PREMIUM_DAY_NAMES[line.type];
			const detail = [
				`${line.hours} hrs`,
				line.overtimeHours > 0 ? `${line.overtimeHours} OT` : "",
				line.nightHours > 0 ? `${line.nightHours} night` : "",
			]
				.filter(Boolean)
				.join(", ");
			premiumLines.push([`${name} (${detail})`, line.pay]);
		}
		for (const [label, amount] of premiumLines) {
			row(pdf, y, pageWidth, label, formatCurrency(amount));
			y += 6;
		}
		if (allowance > 0) {
			const taxLabel =
				allowance > DE_MINIMIS_MONTHLY_LIMIT
					? "Excess Counted as Other Benefit"
					: "Non-Taxable";
			row(
				pdf,
				y,
				pageWidth,
				`De Minimis Allowance (${taxLabel})`,
				formatCurrency(allowance),
			);
			y += 6;
		}
	}

	y += 2;

	// mnthly deductions
	y = section(pdf, y, pageWidth, "Monthly Deductions");

	pdf.setFont("helvetica", "normal");
	pdf.setFontSize(10);
	pdf.setTextColor(40, 40, 40);

	visibleDeductions.forEach(([key, value]) => {
		row(
			pdf,
			y,
			pageWidth,
			deductionLabel(key, sector, results.appliedTaxRegime),
			formatCurrency(value),
		);
		y += 6;
	});

	y += 2;

	// monthly summary
	y = section(pdf, y, pageWidth, "Monthly Summary");

	pdf.setFont("helvetica", "normal");
	pdf.setFontSize(10);
	pdf.setTextColor(40, 40, 40);

	row(pdf, y, pageWidth, "Gross Monthly Income", formatCurrency(grossIncome));
	y += 6;
	row(
		pdf,
		y,
		pageWidth,
		"Total Monthly Deductions",
		formatCurrency(totalDeductions),
	);
	y += 6;
	row(pdf, y, pageWidth, "Monthly Take Home Pay", formatCurrency(takeHomePay));
	y += 6;

	// effective rate
	pdf.setFont("helvetica", "italic");
	pdf.setFontSize(9);
	pdf.setTextColor(80, 80, 80);
	pdf.text(`Effective Deduction Rate: ${effectiveRate.toFixed(2)}%`, 20, y);
	y += 10;

	// annual summary
	y = section(pdf, y, pageWidth, "Annual Summary");

	pdf.setFont("helvetica", "normal");
	pdf.setFontSize(10);
	pdf.setTextColor(40, 40, 40);

	row(
		pdf,
		y,
		pageWidth,
		"Annual Gross Income",
		formatCurrency(grossIncome * 12 + annualBenefits.yearEnd),
	);
	y += 6;
	row(
		pdf,
		y,
		pageWidth,
		"Annual Total Deductions",
		formatCurrency(totalDeductions * 12),
	);
	y += 6;
	row(
		pdf,
		y,
		pageWidth,
		"Annual Take Home Pay",
		formatCurrency(takeHomePay * 12 + annualBenefits.yearEnd),
	);
	y += 6;

	// year-end benefits share one annual exclusion; only the excess is taxed
	pdf.setFont("helvetica", "italic");
	pdf.setFontSize(9);
	pdf.setTextColor(80, 80, 80);
	if (annualBenefits.yearEnd > 0) {
		const benefitLabel =
			sector === "public"
				? "Estimated Mid-Year/Year-End Bonus, Cash Gift & PEI"
				: "Estimated 13th Month Pay";
		pdf.text(`${benefitLabel}: ${formatCurrency(annualBenefits.yearEnd)}`, 20, y);
		y += 5;
		pdf.text(
			`Taxable portion above the ${formatCurrency(EXEMPT_BENEFITS_ANNUAL_CAP)} exclusion: ${formatCurrency(annualBenefits.taxableExcess)}`,
			20,
			y,
		);
		y += 5;
		pdf.text(
			"Annual figures above cover 12 monthly payrolls plus this bonus pay.",
			20,
			y,
		);
	} else if (!isSelfEmployed && !inputs.includeThirteenthMonth) {
		pdf.text(
			sector === "public"
				? "Year-end bonuses are not included in the annual figures above."
				: "13th month pay is not included in the annual figures above.",
			20,
			y,
		);
	}
	y += 16;

	// disclaimer
	pdf.setFont("helvetica", "italic");
	pdf.setFontSize(8);
	pdf.setTextColor(100, 100, 100);
	const disclaimer =
		"This tax summary is an estimate based on 2026 Philippine tax regulations. Actual deductions may vary.";
	pdf.text(pdf.splitTextToSize(disclaimer, pageWidth - 40), pageWidth / 2, y, {
		align: "center",
	});

	// footer
	pdf.setFont("helvetica", "normal");
	pdf.setFontSize(8);
	pdf.setTextColor(120, 120, 120);
	pdf.text(
		"nathanielseth.github.io/neticents",
		pageWidth / 2,
		pageHeight - 10,
		{ align: "center" },
	);

	return URL.createObjectURL(pdf.output("blob"));
};

export const downloadPDF = (blobUrl: string) => {
	const link = document.createElement("a");
	link.href = blobUrl;
	link.download = `neticents-${new Date().toLocaleDateString("en-PH").replace(/\//g, "-")}.pdf`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

// layout helpers

function section(
	pdf: jsPDF,
	y: number,
	pageWidth: number,
	title: string,
): number {
	pdf.setFont("helvetica", "bold");
	pdf.setFontSize(11);
	pdf.setTextColor(0, 0, 0);
	pdf.text(title, 20, y);
	y += 1.5;
	pdf.setLineWidth(0.3);
	pdf.setDrawColor(150, 150, 150);
	pdf.line(20, y, pageWidth - 20, y);
	y += 6;
	return y;
}

function row(
	pdf: jsPDF,
	y: number,
	pageWidth: number,
	label: string,
	value: string,
) {
	pdf.text(label, 20, y);
	pdf.text(value, pageWidth - 20, y, { align: "right" });
}