import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import PropTypes from "prop-types";

const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#ffffff",
		padding: 40,
		fontFamily: "Helvetica",
	},
	header: {
		marginBottom: 10,
		textAlign: "left",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#4169e1",
		marginBottom: 6,
	},
	subtitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#333333",
		marginBottom: 3,
	},
	date: {
		fontSize: 10,
		color: "#666666",
		marginBottom: 20,
	},
	section: {
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#333333",
		marginBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#4169e1",
		paddingBottom: 4,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 5,
		paddingVertical: 4,
	},
	rowBold: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 5,
		paddingVertical: 6,
		backgroundColor: "#f5f5f5",
		paddingHorizontal: 8,
		fontWeight: "bold",
	},
	label: {
		fontSize: 11,
		color: "#333333",
		flex: 1,
	},
	value: {
		fontSize: 11,
		color: "#333333",
		fontWeight: "bold",
		textAlign: "right",
	},
	highlightValue: {
		fontSize: 12,
		color: "#4169e1",
		fontWeight: "bold",
		textAlign: "right",
	},
	divider: {
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
		marginVertical: 8,
	},
	footer: {
		position: "absolute",
		bottom: 30,
		left: 40,
		right: 40,
		textAlign: "center",
		fontSize: 9,
		color: "#666666",
	},
	disclaimer: {
		fontSize: 9,
		color: "#666666",
		textAlign: "center",
		fontStyle: "italic",
		marginTop: 20,
		padding: 10,
		backgroundColor: "#f9f9f9",
	},
});

const SECTOR_NAMES = {
	private: "Private Employee",
	public: "Government Employee",
	selfemployed: "Self-Employed Individual",
};

const DEDUCTION_LABELS = {
	withholdingTax: "Withholding Tax",
	gsis: "GSIS Contribution",
	sss: "SSS Contribution",
	philHealth: "PhilHealth Contribution",
	pagIbig: "Pag-IBIG Contribution",
};

const getSectorDisplayName = (sector) => SECTOR_NAMES[sector] || "Unknown";

const getDeductionLabel = (key) => DEDUCTION_LABELS[key] || key;

const formatCurrency = (value) => {
	const formatted = Number(value).toLocaleString("en-PH", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	return `P${formatted}`;
};

const TaxSummaryPDF = (props) => {
	const {
		monthlySalary = 0,
		allowance = 0,
		allowanceTaxable = false,
		sector = "private",
		takeHomePay = 0,
		withholdingTax = 0,
		overtimeHours = 0,
		nightDifferentialHours = 0,
		visibleDeductions = [],
		totalDeductions = 0,
		grossIncome = 0,
		generatedDate = new Date().toLocaleDateString("en-PH"),
	} = props;

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.header}>
					<Text style={styles.subtitle}>Income Tax Summary</Text>
					<Text style={styles.date}>Generated on {generatedDate}</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Employment Information</Text>
					<View style={styles.row}>
						<Text style={styles.label}>Employment Sector:</Text>
						<Text style={styles.value}>{getSectorDisplayName(sector)}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.label}>Monthly Basic Salary:</Text>
						<Text style={styles.value}>{formatCurrency(monthlySalary)}</Text>
					</View>
					{allowance > 0 && (
						<View style={styles.row}>
							<Text style={styles.label}>
								Monthly Allowance (
								{allowanceTaxable ? "Taxable" : "Non-Taxable"}):
							</Text>
							<Text style={styles.value}>{formatCurrency(allowance)}</Text>
						</View>
					)}
					{overtimeHours > 0 && (
						<View style={styles.row}>
							<Text style={styles.label}>Overtime Hours per Month:</Text>
							<Text style={styles.value}>{overtimeHours} hours</Text>
						</View>
					)}
					{nightDifferentialHours > 0 && (
						<View style={styles.row}>
							<Text style={styles.label}>Night Differential Hours:</Text>
							<Text style={styles.value}>{nightDifferentialHours} hours</Text>
						</View>
					)}
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Monthly Deductions</Text>
					<View style={styles.row}>
						<Text style={styles.label}>Withholding Tax:</Text>
						<Text style={styles.value}>{formatCurrency(withholdingTax)}</Text>
					</View>
					{visibleDeductions
						.filter(([key]) => key !== "withholdingTax")
						.map(([key, value]) => (
							<View key={key} style={styles.row}>
								<Text style={styles.label}>{getDeductionLabel(key)}:</Text>
								<Text style={styles.value}>{formatCurrency(value)}</Text>
							</View>
						))}
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Monthly Summary</Text>
					<View style={styles.row}>
						<Text style={styles.label}>Gross Monthly Income:</Text>
						<Text style={styles.value}>{formatCurrency(grossIncome)}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.label}>Total Monthly Deductions:</Text>
						<Text style={styles.value}>{formatCurrency(totalDeductions)}</Text>
					</View>
					<View style={styles.divider} />
					<View style={styles.row}>
						<Text style={[styles.label, { fontWeight: "bold" }]}>
							Monthly Take Home Pay:
						</Text>
						<Text style={styles.highlightValue}>
							{formatCurrency(takeHomePay)}
						</Text>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Annual Summary</Text>
					<View style={styles.row}>
						<Text style={styles.label}>Annual Gross Income:</Text>
						<Text style={styles.value}>{formatCurrency(grossIncome * 12)}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.label}>Annual Total Deductions:</Text>
						<Text style={styles.value}>
							{formatCurrency(totalDeductions * 12)}
						</Text>
					</View>
					<View style={styles.divider} />
					<View style={styles.row}>
						<Text style={[styles.label, { fontWeight: "bold" }]}>
							Annual Take Home Pay:
						</Text>
						<Text style={styles.highlightValue}>
							{formatCurrency(takeHomePay * 12)}
						</Text>
					</View>
				</View>

				<View style={styles.disclaimer}>
					<Text>
						This tax summary is generated based on Philippine tax regulations as
						of 2025. Calculations are estimates and may vary based on specific
						circumstances. Please consult with a tax professional for accurate
						tax advice.
					</Text>
				</View>

				<View style={styles.footer}>
					<Text>nathanielseth.github.io/neticents</Text>
				</View>
			</Page>
		</Document>
	);
};

TaxSummaryPDF.propTypes = {
	monthlySalary: PropTypes.number,
	allowance: PropTypes.number,
	allowanceTaxable: PropTypes.bool,
	sector: PropTypes.oneOf(["private", "public", "selfemployed"]),
	takeHomePay: PropTypes.number,
	withholdingTax: PropTypes.number,
	overtimeHours: PropTypes.number,
	nightDifferentialHours: PropTypes.number,
	visibleDeductions: PropTypes.arrayOf(PropTypes.array),
	totalDeductions: PropTypes.number,
	grossIncome: PropTypes.number,
	generatedDate: PropTypes.string,
};

export default TaxSummaryPDF;
