import { useState, useRef } from "react";
import Inputs from "./components/Inputs";
import Summary from "./components/Summary";
import References from "./components/References";
import { useTheme } from "./utils/themeContext";
import { HiSun, HiMoon } from "react-icons/hi";
import { generateTaxSummaryPDF } from "./utils/pdfGenerator";

const App = () => {
	const { theme, toggleTheme } = useTheme();
	const [monthlySalary, setMonthlySalary] = useState("");
	const [allowance, setAllowance] = useState("");
	const [allowanceTaxable, setAllowanceTaxable] = useState(false);
	const [sector, setSector] = useState("private");
	const [takeHomePay, setTakeHomePay] = useState(0);
	const [withholdingTax, setWithholdingTax] = useState(0);
	const [overtimeHours, setOvertimeHours] = useState("");
	const [nightDifferentialHours, setNightDifferentialHours] = useState("");
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const formRef = useRef(null);

	const handleDownload = async () => {
		setIsGeneratingPDF(true);

		try {
			const taxData = {
				monthlySalary: Number(monthlySalary) || 0,
				allowance: Number(allowance) || 0,
				allowanceTaxable,
				sector,
				takeHomePay: Number(takeHomePay),
				withholdingTax: Number(withholdingTax),
				overtimeHours: Number(overtimeHours) || 0,
				nightDifferentialHours: Number(nightDifferentialHours) || 0,
				generatedDate: new Date().toLocaleDateString("en-PH", {
					year: "numeric",
					month: "long",
					day: "numeric",
				}),
			};

			await generateTaxSummaryPDF(taxData);
		} catch (error) {
			console.error("Error generating PDF:", error);
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#fbfcfd] dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col relative">
			<div className="flex-grow flex flex-col items-center justify-center p-4 mt-2 mb-1 md:mt-8 md:mb-0">
				<div className="max-w-4xl w-full overflow-auto mb-8">
					<div className="text-left mb-4 relative">
						<h2 className="text-3xl font-bold text-black dark:text-white mt-1">
							Philippine Income Tax Calculator
						</h2>
						<button
							type="button"
							aria-label="Toggle theme"
							className="absolute bottom-0 right-0 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition duration-100"
							onClick={toggleTheme}
						>
							{theme === "dark" ? <HiSun size={20} /> : <HiMoon size={20} />}
						</button>
					</div>

					<div className="relative mb-8">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8" ref={formRef}>
						<div>
							<Inputs
								theme={theme}
								setMonthlySalary={setMonthlySalary}
								setAllowance={setAllowance}
								setAllowanceTaxable={setAllowanceTaxable}
								setSector={setSector}
								setTakeHomePay={setTakeHomePay}
								setWithholdingTax={setWithholdingTax}
								overtimeHours={overtimeHours}
								setOvertimeHours={setOvertimeHours}
								nightDifferentialHours={nightDifferentialHours}
								setNightDifferentialHours={setNightDifferentialHours}
							/>
						</div>
						<div className="p-2 flex flex-col justify-center">
							<Summary
								theme={theme}
								takeHomePay={Number(takeHomePay)}
								withholdingTax={Number(withholdingTax)}
								monthlySalary={Number(monthlySalary) || 0}
								allowance={allowance}
								sector={sector}
								allowanceTaxable={allowanceTaxable}
								activeSector={sector}
								overtimeHours={Number(overtimeHours) || 0}
								nightDifferentialHours={Number(nightDifferentialHours) || 0}
							/>
							<div className="mt-3 flex justify-center">
								<button
									className={`w-full py-3 px-6 text-white font-medium rounded-xl shadow-lg ${
										isGeneratingPDF
											? "bg-gray-400 cursor-not-allowed"
											: "bg-gradient-to-r from-[#4169e1] to-[#3b5bdb] hover:from-blue-600 hover:to-blue-700"
									}`}
									onClick={handleDownload}
									disabled={isGeneratingPDF}
								>
									{isGeneratingPDF ? (
										<span className="flex items-center justify-center gap-2">
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											Generating PDF...
										</span>
									) : (
										<span className="flex items-center justify-center gap-2">
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
												/>
											</svg>
											Save as PDF
										</span>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>

				<References theme={theme} />
			</div>

			<footer className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 text-center text-sm">
				<div className="flex items-center justify-center gap-1">
					<span className="text-gray-400 dark:text-gray-500">
						Developed by{" "}
					</span>
					<a
						href="https://nathanielseth.github.io/portfolio/"
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium text-blue-600 dark:text-blue-400"
					>
						nathanielseth.dev
					</a>
				</div>
			</footer>
		</div>
	);
};

export default App;
