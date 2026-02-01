import jsPDF from "jspdf";
import type { Sector, TaxResults } from "../types";

const SECTOR_NAMES: Record<Sector, string> = {
	private: "Private Employee",
	public: "Government Employee",
	selfemployed: "Self-Employed",
};

const DEDUCTION_LABELS: Record<string, string> = {
	withholdingTax: "Withholding Tax",
	gsis: "GSIS Contribution",
	sss: "SSS Contribution",
	philHealth: "PhilHealth Contribution",
	pagIbig: "Pag-IBIG Contribution",
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
		effectiveRate,
	} = results;
	const { salary, allowance, sector, overtimeHours, nightDifferentialHours } =
		inputs;
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

	// income breakdown (if there's anything beyond base salary)
	const hasPremium =
		!isSelfEmployed && (overtimeHours > 0 || nightDifferentialHours > 0);
	const hasExtras = hasPremium || allowance > 0;

	if (hasExtras) {
		y += 2;
		y = section(pdf, y, pageWidth, "Income Breakdown");

		pdf.setFont("helvetica", "normal");
		pdf.setFontSize(10);
		pdf.setTextColor(40, 40, 40);

		if (overtimeHours > 0) {
			row(
				pdf,
				y,
				pageWidth,
				`Overtime Pay (${overtimeHours} hrs)`,
				formatCurrency(premiumPay.regularOvertimePay),
			);
			y += 6;
		}
		if (nightDifferentialHours > 0) {
			row(
				pdf,
				y,
				pageWidth,
				`Night Differential Pay (${nightDifferentialHours} hrs)`,
				formatCurrency(premiumPay.regularNightPay),
			);
			y += 6;
		}
		if (premiumPay.nightOvertimePay > 0) {
			row(
				pdf,
				y,
				pageWidth,
				"Night Overtime Premium",
				formatCurrency(premiumPay.nightOvertimePay),
			);
			y += 6;
		}
		if (allowance > 0) {
			const taxLabel = allowance > 7500 ? "Taxable" : "Non-Taxable";
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
		row(pdf, y, pageWidth, DEDUCTION_LABELS[key] || key, formatCurrency(value));
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
		formatCurrency(grossIncome * 12),
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
		formatCurrency(takeHomePay * 12),
	);
	y += 6;

	// 13th month (basic salary only)
	pdf.setFont("helvetica", "italic");
	pdf.setFontSize(9);
	pdf.setTextColor(80, 80, 80);
	pdf.text(`Estimated 13th Month Pay: ${formatCurrency(salary)}`, 20, y);
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
