import { useRef, useState } from "react";
import Inputs from "./components/Inputs";
import Summary from "./components/Summary";
import References from "./components/References";
import PDFPreviewModal, {
	type PDFPreviewModalHandle,
} from "./components/PDFPreviewModal";
import { useTheme } from "./utils/themeContext";
import { Sun, Moon, Download } from "lucide-react";
import { useSalaryCalculator } from "./utils/useSalaryCalculator";
import { generateTaxSummaryPDF } from "./utils/pdfGenerator";

const App = () => {
	const { theme, toggleTheme } = useTheme();
	const { inputs, results, setters } = useSalaryCalculator();
	const modalRef = useRef<PDFPreviewModalHandle>(null);
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

	const handleDownload = async () => {
		setIsGeneratingPDF(true);
		try {
			const url = await generateTaxSummaryPDF(results);
			modalRef.current?.open(url);
		} catch (error) {
			console.error("Error generating PDF:", error);
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	return (
		<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white flex flex-col relative">
			<div className="grow flex flex-col items-center justify-center p-4 mt-2 mb-1 md:mt-8 md:mb-0">
				<div className="max-w-4xl w-full mb-8">
					<div className="flex items-center justify-between mb-4">
						<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
							Philippine Income Tax Calculator
						</h1>
						<button
							type="button"
							aria-label="Toggle theme"
							className="p-1.5 shrink-0 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
							onClick={toggleTheme}
						>
							{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
						</button>
					</div>

					<div className="relative mb-8">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-neutral-200 dark:border-neutral-800"></div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="min-w-0">
							<Inputs inputs={inputs} setters={setters} />
						</div>

						<div className="min-w-0 p-2 flex flex-col justify-center">
							<Summary results={results} />

							<div className="mt-3 flex justify-center">
								<button
									type="button"
									className={`w-full py-3 px-6 text-white font-medium rounded-xl ${
										isGeneratingPDF
											? "bg-neutral-400 cursor-not-allowed"
											: "bg-brand hover:bg-brand-hover"
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
											<Download size={16} />
											Generate PDF
										</span>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>

				<References />
			</div>

			<PDFPreviewModal ref={modalRef} />

			<footer className="w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-4 text-center text-sm">
				<div className="flex items-center justify-center gap-1">
					<span className="text-neutral-400 dark:text-neutral-500">
						Developed by{" "}
					</span>
					<a
						href="https://nathanielseth.github.io/portfolio/"
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium text-brand hover:text-brand-hover"
					>
						nathanielseth.dev
					</a>
				</div>
			</footer>
		</div>
	);
};

export default App;