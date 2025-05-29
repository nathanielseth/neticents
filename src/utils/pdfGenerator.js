import { pdf } from "@react-pdf/renderer";
import TaxSummaryPDF from "../components/TaxSummaryPDF";
import {
	computeGSIS,
	computeSSS,
	computePhilHealth,
	computePagIbig,
} from "./calculation";

const validateTaxData = (taxData) => {
	if (!taxData || typeof taxData !== "object") {
		throw new Error("Tax data must be a valid object");
	}

	const requiredFields = [
		"monthlySalary",
		"takeHomePay",
		"withholdingTax",
		"sector",
	];
	const missingFields = requiredFields.filter(
		(field) => taxData[field] === undefined || taxData[field] === null
	);

	if (missingFields.length > 0) {
		throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
	}

	const numericFields = [
		"monthlySalary",
		"takeHomePay",
		"withholdingTax",
		"allowance",
		"overtimeHours",
		"nightDifferentialHours",
	];
	numericFields.forEach((field) => {
		if (
			taxData[field] !== undefined &&
			(isNaN(Number(taxData[field])) || Number(taxData[field]) < 0)
		) {
			throw new Error(`${field} must be a valid non-negative number`);
		}
	});

	// Validate sector
	const validSectors = ["private", "public", "selfemployed"];
	if (!validSectors.includes(taxData.sector)) {
		throw new Error(`Sector must be one of: ${validSectors.join(", ")}`);
	}

	return true;
};

const calculateDeductions = (taxData) => {
	const { monthlySalary, sector, takeHomePay, withholdingTax } = taxData;
	const numericMonthlySalary = Number(monthlySalary) || 0;
	const numericTakeHomePay = Number(takeHomePay) || 0;
	const numericWithholdingTax = Number(withholdingTax) || 0;

	const isSelfEmployed = sector === "selfemployed";
	const isPrivateSector = sector === "private" || sector === "selfemployed";

	const deductions = {
		withholdingTax: numericTakeHomePay > 0 ? numericWithholdingTax : 0,
		gsis:
			numericTakeHomePay > 0 && sector === "public"
				? computeGSIS(numericMonthlySalary)
				: 0,
		sss:
			numericTakeHomePay > 0 && isPrivateSector
				? computeSSS(numericMonthlySalary, isSelfEmployed).sss +
				  computeSSS(numericMonthlySalary, isSelfEmployed).mpf
				: 0,
		philHealth:
			numericTakeHomePay > 0
				? computePhilHealth(numericMonthlySalary, isSelfEmployed)
				: 0,
		pagIbig: numericTakeHomePay > 0 ? computePagIbig(numericMonthlySalary) : 0,
	};

	const visibleDeductions = Object.entries(deductions).filter(([key]) => {
		if (key === "gsis" && isPrivateSector) return false;
		if (key === "sss" && sector === "public") return false;
		return true;
	});

	const totalDeductions = visibleDeductions.reduce(
		(acc, [, value]) => acc + value,
		0
	);

	return {
		deductions,
		visibleDeductions,
		totalDeductions,
		grossIncome: numericMonthlySalary + (Number(taxData.allowance) || 0),
	};
};

export const generateTaxSummaryPDF = async (taxData) => {
	try {
		validateTaxData(taxData);

		const calculatedData = calculateDeductions(taxData);
		const allowanceAmount = Number(taxData.allowance) || 0;

		const pdfData = {
			...taxData,
			...calculatedData,
			monthlySalary: Number(taxData.monthlySalary) || 0,
			allowance: allowanceAmount,
			takeHomePay: Number(taxData.takeHomePay) || 0,
			withholdingTax: Number(taxData.withholdingTax) || 0,
			overtimeHours: Number(taxData.overtimeHours) || 0,
			nightDifferentialHours: Number(taxData.nightDifferentialHours) || 0,
			allowanceTaxable: allowanceAmount > 7500,
		};

		const blob = await pdf(TaxSummaryPDF(pdfData)).toBlob();

		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;

		const today = new Date();
		const day = String(today.getDate()).padStart(2, "0");
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const year = today.getFullYear();
		const dateStr = `${day}-${month}-${year}`;
		link.download = `neticents-${dateStr}.pdf`;

		document.body.appendChild(link);
		link.click();

		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error("Error generating PDF:", error);
		throw error;
	}
};
