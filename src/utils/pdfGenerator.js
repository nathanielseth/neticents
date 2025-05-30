import { pdf } from "@react-pdf/renderer";
import TaxSummaryPDF from "../components/TaxSummaryPDF";
import {
	computeGSIS,
	computeSSS,
	computePhilHealth,
	computePagIbig,
} from "./calculation";

const REQUIRED_FIELDS = [
	"monthlySalary",
	"takeHomePay",
	"withholdingTax",
	"sector",
];
const NUMERIC_FIELDS = [
	"monthlySalary",
	"takeHomePay",
	"withholdingTax",
	"allowance",
	"overtimeHours",
	"nightDifferentialHours",
];
const VALID_SECTORS = ["private", "public", "selfemployed"];

const validateTaxData = (taxData) => {
	if (!taxData || typeof taxData !== "object") {
		throw new Error("Tax data must be a valid object");
	}

	const missingFields = REQUIRED_FIELDS.filter(
		(field) => taxData[field] === undefined || taxData[field] === null
	);
	if (missingFields.length > 0) {
		throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
	}

	NUMERIC_FIELDS.forEach((field) => {
		if (taxData[field] !== undefined) {
			const value = Number(taxData[field]);
			if (isNaN(value) || value < 0) {
				throw new Error(`${field} must be a valid non-negative number`);
			}
		}
	});

	if (!VALID_SECTORS.includes(taxData.sector)) {
		throw new Error(`Sector must be one of: ${VALID_SECTORS.join(", ")}`);
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
	const hasIncome = numericTakeHomePay > 0;

	const deductions = {
		withholdingTax: hasIncome ? numericWithholdingTax : 0,
		gsis:
			hasIncome && sector === "public" ? computeGSIS(numericMonthlySalary) : 0,
		sss:
			hasIncome && isPrivateSector
				? (() => {
						const sssData = computeSSS(numericMonthlySalary, isSelfEmployed);
						return sssData.sss + sssData.mpf;
				  })()
				: 0,
		philHealth: hasIncome
			? computePhilHealth(numericMonthlySalary, isSelfEmployed)
			: 0,
		pagIbig: hasIncome ? computePagIbig(numericMonthlySalary) : 0,
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

const generateFileName = () => {
	const today = new Date();
	const day = String(today.getDate()).padStart(2, "0");
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const year = today.getFullYear();
	return `neticents-${day}-${month}-${year}.pdf`;
};

const downloadPDF = (blob) => {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");

	link.href = url;
	link.download = generateFileName();

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
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
		downloadPDF(blob);
	} catch (error) {
		console.error("Error generating PDF:", error);
		throw error;
	}
};
