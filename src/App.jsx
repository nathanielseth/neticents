import { useState, useRef } from "react";
import Inputs from "./components/Inputs";
import Summary from "./components/Summary";
import html2pdf from "html2pdf.js";

const App = () => {
	const [monthlySalary, setMonthlySalary] = useState("");
	const [allowance, setAllowance] = useState("");
	const [allowanceTaxable, setAllowanceTaxable] = useState(false);
	const [sector, setSector] = useState("private");
	const [takeHomePay, setTakeHomePay] = useState(0);
	const [withholdingTax, setWithholdingTax] = useState(0);
	const formRef = useRef(null);

	const handleDownload = () => {
		const element = formRef.current;
		const isMobile = window.innerWidth < 768;
		const opt = {
			margin: isMobile ? 0 : 1,
			filename: "neticents.pdf",
			image: { type: "jpeg", quality: 1 },
			html2canvas: { scale: isMobile ? 0.85 : 0.961 },
			jsPDF: {
				unit: "in",
				format: "letter",
				orientation: isMobile ? "portrait" : "landscape",
			},
		};
		html2pdf().from(element).set(opt).save();
	};

	return (
		<div className="min-h-screen bg-white text-gray-900 flex flex-col">
			<div className="flex-grow flex flex-col items-center justify-center p-4 mt-12 mb-12 md:mt-0 md:mb-0">
				<div className="max-w-4xl w-full overflow-auto mb-8">
					<p className="text-center font-bold text-[#4169e1]">
						INCOME TAX CALCULATOR
					</p>
					<h2 className="text-3xl font-bold text-center text-black mt-2">
						How much are they taking from you?
					</h2>
					<p className="text-center text-gray-500 mt-3">
						Philippine tax rate per RA 10963
					</p>

					<div
						className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-3 "
						ref={formRef}
					>
						<div>
							<Inputs
								setMonthlySalary={setMonthlySalary}
								setAllowance={setAllowance}
								setAllowanceTaxable={setAllowanceTaxable}
								setSector={setSector}
								setTakeHomePay={setTakeHomePay}
								allowanceTaxable={allowanceTaxable}
								setWithholdingTax={setWithholdingTax}
							/>
						</div>

						<div className="p-2">
							<Summary
								monthlySalary={monthlySalary}
								allowance={allowance}
								sector={sector}
								allowanceTaxable={allowanceTaxable}
								takeHomePay={takeHomePay}
								withholdingTax={withholdingTax}
								activeSector={sector}
							/>
							<div className="mt-4 flex justify-center">
								<button
									className="w-full py-3 text-white bg-[#4169e1] rounded-lg transition duration-200"
									onClick={handleDownload}
								>
									Save as PDF
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<footer className="w-full bg-white p-4 text-center text-sm md:fixed md:bottom-0">
				<a
					href="https://nathanielseth.github.io/portfolio/"
					target="_blank"
					rel="noopener noreferrer"
					className="text-zinc-400"
				>
					made by nathanielseth.dev
				</a>
			</footer>
		</div>
	);
};

export default App;
