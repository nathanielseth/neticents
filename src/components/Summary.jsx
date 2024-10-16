import PropTypes from "prop-types";
import LineChart from "./LineChart";
import {
	computeGSIS,
	computeSSS,
	computePhilHealth,
	computePagIbig,
	numberFormat,
} from "../utils/calculation";

const Summary = ({
	takeHomePay,
	withholdingTax,
	monthlySalary,
	activeSector,
	activePeriod,
}) => {
	const numericTakeHomePay = parseFloat(takeHomePay) || 0;
	const numericMonthlySalary = parseFloat(monthlySalary) || 0;

	const { sss, mpf } = computeSSS(numericMonthlySalary);
	const deductions = {
		withholdingTax: parseFloat(withholdingTax) || 0,
		gsis: computeGSIS(numericMonthlySalary),
		sss: sss + mpf,
		philHealth: computePhilHealth(numericMonthlySalary),
		pagIbig: computePagIbig(),
		total: 0,
	};

	// Adjust deductions based on period
	if (activePeriod === "annually") {
		deductions.total = Object.values(deductions).reduce(
			(acc, value) => acc + value * 12,
			0
		);
	} else if (activePeriod === "bi-weekly") {
		deductions.total = Object.values(deductions).reduce(
			(acc, value) => acc + value / 2,
			0
		);
	} else {
		deductions.total = Object.values(deductions).reduce(
			(acc, value) => acc + value,
			0
		);
	}

	const handleDownload = () => {
		alert("not implemented yet");
	};

	return (
		<div className="relative mt-6">
			<div
				className="p-6 bg-white rounded-lg border-b-4 border-[#7f2ffa]"
				style={{ boxShadow: "0 -1px 15px rgba(0, 0, 0, 0.15)" }}
			>
				<h3 className="text-md font-normal text-center text-gray-500 mt-1 mb-1">
					Take Home Pay:
				</h3>
				<div className="grid grid-cols-1 justify-items-center">
					<h1 className="text-4xl font-bold text-[#7f2ffa]">
						₱
						{numericTakeHomePay >= 0
							? numericTakeHomePay.toLocaleString("en-US", {
									minimumFractionDigits: 2,
							  })
							: "0.00"}
					</h1>
				</div>

				<LineChart deductions={deductions} />

				<div className="mt-6 text-gray-900 space-y-4">
					{Object.entries(deductions).map(([key, value]) => {
						if (
							(key === "gsis" && activeSector === "private") ||
							(key === "sss" && activeSector === "public")
						)
							return null;

						return (
							<div className="flex justify-between items-center" key={key}>
								<span className="flex items-center">
									<span
										className={`w-3 h-3 rounded-full ${getColor(key)} mr-2`}
									></span>
									<span className="font-semibold text-zinc-600 mb-1">
										{getLabel(key)}
									</span>
								</span>
								<span className="font-bold">
									₱{numberFormat(value.toFixed(2))}
								</span>
							</div>
						);
					})}
				</div>
			</div>
			<div className="mt-4 flex justify-center">
				<button
					className="w-full py-3 text-white bg-[#7f2ffa] rounded-lg transition duration-200"
					onClick={handleDownload}
				>
					Save as PDF
				</button>
			</div>
		</div>
	);
};

const getColor = (key) => {
	const colors = {
		withholdingTax: "bg-purple-500",
		gsis: "bg-gray-400",
		sss: "bg-gray-400",
		philHealth: "bg-yellow-500",
		pagIbig: "bg-blue-500",
		total: "bg-red-500",
	};
	return colors[key];
};

const getLabel = (key) => {
	const labels = {
		withholdingTax: "Withholding Tax",
		gsis: "GSIS Contribution",
		sss: "SSS Contribution",
		philHealth: "PhilHealth Contribution",
		pagIbig: "Pag-Ibig Contribution",
		total: "Total Deduction",
	};
	return labels[key];
};

Summary.propTypes = {
	takeHomePay: PropTypes.number.isRequired,
	withholdingTax: PropTypes.number.isRequired,
	monthlySalary: PropTypes.number.isRequired,
	activeSector: PropTypes.string.isRequired,
	activePeriod: PropTypes.string.isRequired,
};

export default Summary;
