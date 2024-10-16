import { useState } from "react";
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
}) => {
	const [isAnnual, setIsAnnual] = useState(false);

	const numericTakeHomePay = parseFloat(takeHomePay) || 0;
	const numericMonthlySalary = parseFloat(monthlySalary) || 0;

	const deductions = {
		withholdingTax:
			numericTakeHomePay > 0 ? parseFloat(withholdingTax) || 0 : 0,
		gsis:
			numericTakeHomePay > 0 && activeSector === "public"
				? computeGSIS(numericMonthlySalary)
				: 0,
		sss:
			numericTakeHomePay > 0 && activeSector === "private"
				? computeSSS(numericMonthlySalary).sss +
				  computeSSS(numericMonthlySalary).mpf
				: 0,
		philHealth:
			numericTakeHomePay > 0 ? computePhilHealth(numericMonthlySalary) : 0,
		pagIbig: numericTakeHomePay > 0 ? computePagIbig() : 0,
	};

	const visibleDeductions = Object.entries(deductions).filter(([key]) => {
		if (
			(key === "gsis" && activeSector === "private") ||
			(key === "sss" && activeSector === "public")
		) {
			return false;
		}
		return true;
	});

	const totalDeductions = visibleDeductions.reduce(
		(acc, [, value]) => acc + value,
		0
	);

	const displayedTotalDeductions = isAnnual
		? totalDeductions * 12
		: totalDeductions;

	const displayedTakeHomePay = isAnnual
		? numericTakeHomePay * 12
		: numericTakeHomePay;

	const handleDownload = () => {
		alert("not implemented yet");
	};

	return (
		<div className="relative mt-6">
			<div
				className="p-6 bg-white rounded-lg border-b-4 border-[#4169e1]"
				style={{ boxShadow: "0 -1px 15px rgba(0, 0, 0, 0.15)" }}
			>
				<div className="flex justify-center mb-4">
					<div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-full">
						<button
							className={`px-2 py-1 rounded-full ${
								!isAnnual
									? "bg-[#4169e1] text-white"
									: "bg-transparent text-gray-600"
							}`}
							onClick={() => setIsAnnual(false)}
						>
							Monthly
						</button>
						<button
							className={`px-2 py-1 rounded-full ${
								isAnnual
									? "bg-[#4169e1] text-white"
									: "bg-transparent text-gray-600"
							}`}
							onClick={() => setIsAnnual(true)}
						>
							Annual
						</button>
					</div>
				</div>

				<h3 className="text-md font-normal text-center text-gray-500 mt-1 mb-1">
					Take Home Pay:
				</h3>
				<div className="grid grid-cols-1 justify-items-center">
					<h1 className="text-4xl font-bold text-[#4169e1]">
						₱
						{displayedTakeHomePay.toLocaleString("en-US", {
							minimumFractionDigits: 2,
						})}
					</h1>
				</div>

				<LineChart deductions={{ ...deductions, total: totalDeductions }} />

				<div className="mt-6 text-gray-900 space-y-4">
					{visibleDeductions.map(([key, value]) => {
						const displayedValue = isAnnual ? value * 12 : value;

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
									₱{numberFormat(displayedValue.toFixed(2))}
								</span>
							</div>
						);
					})}
					<div className="flex justify-between items-center font-bold">
						<span>Total Deductions</span>
						<span>₱{numberFormat(displayedTotalDeductions.toFixed(2))}</span>
					</div>
				</div>
			</div>

			<div className="mt-4 flex justify-center">
				<button
					className="w-full py-3 text-white bg-[#4169e1] rounded-lg transition duration-200"
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
		withholdingTax: "bg-red-500",
		gsis: "bg-green-500",
		sss: "bg-green-500",
		philHealth: "bg-purple-500",
		pagIbig: "bg-yellow-500",
		total: "bg-blue-500",
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
};

export default Summary;
