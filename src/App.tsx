import { useRef, useState } from "react";
import Inputs from "./components/Inputs";
import Summary from "./components/Summary";
import References from "./components/References";
import PDFPreviewModal, {
	type PDFPreviewModalHandle,
} from "./components/PDFPreviewModal";
import { useTheme } from "./utils/themeContext";
import { Sun, Moon, Download, LoaderCircle } from "lucide-react";
import { useSalaryCalculator } from "./utils/useSalaryCalculator";
import { generateTaxSummaryPDF } from "./utils/pdfGenerator";

const App = () => {
	const { theme, toggleTheme } = useTheme();
	const { inputs, results, setters } = useSalaryCalculator();
	const modalRef = useRef<PDFPreviewModalHandle>(null);
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const [pdfFailed, setPdfFailed] = useState(false);

	const handleDownload = async () => {
		setIsGeneratingPDF(true);
		setPdfFailed(false);
		try {
			const url = await generateTaxSummaryPDF(results);
			modalRef.current?.open(url);
		} catch (error) {
			console.error("Error generating PDF:", error);
			setPdfFailed(true);
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	return (
		<div className="flex min-h-dvh flex-col bg-page text-fg">
			<div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:py-12">
				<header className="mb-8 flex items-start justify-between gap-4 border-b border-line pb-6 md:mb-10">
					<h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">
						Philippine Income Tax Calculator
					</h1>
					<button
						type="button"
						aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
						className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-sunken hover:text-fg"
						onClick={toggleTheme}
					>
						{theme === "dark" ? (
							<Sun aria-hidden className="size-4.5" />
						) : (
							<Moon aria-hidden className="size-4.5" />
						)}
					</button>
				</header>

				<main className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_22rem] md:gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
					<Inputs inputs={inputs} setters={setters} />

					<div className="space-y-3 md:sticky md:top-8">
						<Summary results={results} />

						<button
							type="button"
							className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand font-medium text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
							onClick={handleDownload}
							disabled={isGeneratingPDF}
						>
							{isGeneratingPDF ? (
								<LoaderCircle
									aria-hidden
									className="size-4 animate-spin motion-reduce:animate-none"
								/>
							) : (
								<Download aria-hidden className="size-4" />
							)}
							{isGeneratingPDF ? "Generating PDF" : "Generate PDF"}
						</button>

						{pdfFailed && (
							<p role="alert" className="text-center text-xs text-warn">
								The PDF could not be generated. Try again.
							</p>
						)}

						<p className="text-center text-xs text-muted">
							This calculator is intended for estimation purposes only.
						</p>
					</div>
				</main>

				<References />
			</div>

			<PDFPreviewModal ref={modalRef} />

			<footer className="py-6 text-center text-sm text-muted">
				Developed by{" "}
				<a
					href="https://nathanielseth.github.io/portfolio/"
					target="_blank"
					rel="noopener noreferrer"
					className="font-medium text-accent hover:underline"
				>
					nathanielseth.dev
				</a>
			</footer>
		</div>
	);
};

export default App;
