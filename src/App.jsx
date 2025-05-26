import { useState, useRef } from "react";
import Inputs from "./components/Inputs";
import Summary from "./components/Summary";
import { useTheme } from "./utils/themeContext";
import { HiSun, HiMoon } from "react-icons/hi";

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

	const formRef = useRef(null);

	const handleDownload = async () => {
		const element = formRef.current;
		const isMobile = window.innerWidth < 768;

		const html2pdf = (await import("html2pdf.js")).default;

		const opt = {
			margin: isMobile ? 0 : 1,
			filename: "neticents.pdf",
			image: { type: "png", quality: 1 },
			html2canvas: { scale: isMobile ? 0.85 : 0.961, letterRendering: true },
			jsPDF: {
				unit: "in",
				format: "letter",
				orientation: isMobile ? "portrait" : "landscape",
			},
		};

		html2pdf().from(element).set(opt).save();
	};

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col relative">
			<div className="flex-grow flex flex-col items-center justify-center p-4 mt-12 mb-12 md:mt-0 md:mb-0">
				<div className="max-w-4xl w-full overflow-auto mb-8">
					<p className="text-center font-bold text-[#4169e1] dark:text-blue-400">
						INCOME TAX CALCULATOR
					</p>
					<h2 className="text-3xl font-bold text-center text-black dark:text-white mt-2">
						How much are they taking from you?
					</h2>
					<p className="text-center text-gray-500 dark:text-gray-300 mt-3">
						Philippine tax rate per RA 10963
					</p>

					<div
						className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-3"
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
									className="w-full py-3 text-white bg-[#4169e1] dark:bg-blue-600 rounded-lg transition duration-100"
									onClick={handleDownload}
								>
									Save as PDF
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
					className="text-zinc-400 dark:text-gray-300"
				>
					made by nathanielseth.dev
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
