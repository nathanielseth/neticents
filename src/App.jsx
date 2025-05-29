import { useState, useRef } from "react";
import Inputs from "./components/Inputs";
import Summary from "./components/Summary";
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
			alert("Failed to generate PDF. Please try again.");
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col relative">
			<div className="flex-grow flex flex-col items-center justify-center p-4 mt-12 mb-1 md:mt-0 md:mb-0">
				<div className="max-w-4xl w-full overflow-auto mb-9">
					<p className="text-center font-bold text-[#4169e1] dark:text-blue-400">
						NETICENTS
					</p>
					<h2 className="text-3xl font-bold text-center text-black dark:text-white mt-1">
						Income Tax Calculator PH
					</h2>
					<p className="text-center text-gray-500 dark:text-gray-400 mt-2">
						Updated for 2025
					</p>
					<div
						className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-5"
						ref={formRef}
					>
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
							<div className="mt-4 flex justify-center" data-html2canvas-ignore>
								<button
									className={`w-full py-3 text-white rounded-lg transition duration-100 ${
										isGeneratingPDF
											? "bg-gray-400 cursor-not-allowed"
											: "bg-[#4169e1] hover:bg-blue-700"
									}`}
									onClick={handleDownload}
									disabled={isGeneratingPDF}
								>
									{isGeneratingPDF ? "Generating PDF..." : "Save as PDF"}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<footer className="w-full bg-white dark:bg-gray-900 p-4 text-center text-sm md:fixed md:bottom-0">
				<a
					href="https://nathanielseth.github.io/portfolio/"
					target="_blank"
					rel="noopener noreferrer"
					className="text-zinc-500 dark:text-gray-400"
				>
					nathanielseth.dev
				</a>
			</footer>
			<button
				type="button"
				aria-label="Toggle theme"
				className="fixed bottom-6 right-6 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-gray-300 transition duration-100"
				onClick={toggleTheme}
			>
				{theme === "dark" ? <HiSun size={26} /> : <HiMoon size={26} />}
			</button>
		</div>
	);
};

export default App;
