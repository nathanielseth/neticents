import { useState } from "react";
import PropTypes from "prop-types";
import LineChart from "./LineChart";
import {
	computeGSIS,
	computeSSS,
	computePhilHealth,
	computePagIbig,
} from "../utils/calculation";
import { numberFormat } from "../utils/format";

const Summary = ({
	takeHomePay,
	withholdingTax,
	monthlySalary,
	activeSector,
	theme,
}) => {
	const [payPeriod, setPayPeriod] = useState("monthly");

	const numericTakeHomePay = parseFloat(takeHomePay) || 0;
	const numericMonthlySalary = parseFloat(monthlySalary) || 0;

	const isSelfEmployed = activeSector === "selfemployed";
	const isPrivateSector =
		activeSector === "private" || activeSector === "selfemployed";

	const deductions = {
		withholdingTax:
			numericTakeHomePay > 0 ? parseFloat(withholdingTax) || 0 : 0,
		gsis:
			numericTakeHomePay > 0 && activeSector === "public"
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
		if (key === "gsis" && isPrivateSector) {
			return false;
		}
		if (key === "sss" && activeSector === "public") {
			return false;
		}
		return true;
	});

	const totalDeductions = visibleDeductions.reduce(
		(acc, [, value]) => acc + value,
		0
	);

	const getMultiplier = () => {
		switch (payPeriod) {
			case "biweekly":
				return 12 / 26;
			case "annual":
				return 12;
			default:
				return 1;
		}
	};

	const multiplier = getMultiplier();
	const displayedTotalDeductions = totalDeductions * multiplier;
	const displayedTakeHomePay = numericTakeHomePay * multiplier;

	const payPeriodOptions = [
		{ value: "monthly", label: "Monthly" },
		{ value: "annual", label: "Annual" },
		{ value: "biweekly", label: "Biweekly" },
	];

	return (
		<div className="relative">
			<div
				className={`p-6 rounded-lg border-t border-l border-r border-b-4 ${
					theme === "dark"
						? "bg-gray-800 text-white border-t-gray-700 border-l-gray-700 border-r-gray-700 border-b-[#4169e1]"
						: "bg-white text-gray-900 border-t-gray-200 border-l-gray-200 border-r-gray-200 border-b-[#4169e1]"
				}`}
				style={{ boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)" }}
			>
				<div className="flex justify-center mb-5">
					<div
						className={`flex items-center p-1 rounded-full ${
							theme === "dark" ? "bg-gray-700" : "bg-gray-200"
						}`}
					>
						{payPeriodOptions.map((option) => (
							<button
								key={option.value}
								className={`px-3 py-1 rounded-full ${
									payPeriod === option.value
										? "bg-[#4169e1] text-white shadow-sm"
										: theme === "dark"
										? "bg-transparent text-gray-300 hover:bg-gray-600"
										: "bg-transparent text-gray-600 hover:bg-gray-300"
								}`}
								onClick={() => setPayPeriod(option.value)}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>

				<h3
					className={`text-md font-normal text-center ${
						theme === "dark" ? "text-gray-300" : "text-gray-600"
					} mt-1 mb-2`}
				>
					Take Home Pay:
				</h3>
				<div className="grid grid-cols-1 justify-items-center">
					<h1
						className={`text-4xl font-bold ${
							theme === "dark" ? "text-blue-400" : "text-[#4169e1]"
						}`}
					>
						₱
						{displayedTakeHomePay.toLocaleString("en-US", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</h1>
				</div>

				<LineChart
					deductions={{ ...deductions, total: totalDeductions }}
					theme={theme}
				/>

				<div
					className={`mt-6 space-y-4 ${
						theme === "dark" ? "text-gray-300" : "text-gray-900"
					}`}
				>
					{visibleDeductions.map(([key, value]) => {
						const displayedValue = value * multiplier;

						return (
							<div className="flex justify-between items-center" key={key}>
								<span className="flex items-center">
									<span
										className={`w-3 h-3 rounded-full ${getColor(key)} mr-2`}
									></span>
									<span
										className={`font-semibold ${
											theme === "dark" ? "text-gray-300" : "text-zinc-600"
										}`}
									>
										{getLabel(key, isSelfEmployed)}
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
		pagIbig: "Pag-IBIG Contribution",
		total: "Total Deduction",
	};
	return labels[key];
};

Summary.propTypes = {
	takeHomePay: PropTypes.number.isRequired,
	withholdingTax: PropTypes.number.isRequired,
	monthlySalary: PropTypes.number.isRequired,
	activeSector: PropTypes.string.isRequired,
	theme: PropTypes.string.isRequired,
};

export default Summary;
