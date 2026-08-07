import { useImperativeHandle, useRef, useState } from "react";
import { X, Download } from "lucide-react";
import { downloadPDF } from "../utils/pdfGenerator";

export interface PDFPreviewModalHandle {
	open: (url: string) => void;
	close: () => void;
}

interface PDFPreviewModalProps {
	ref: React.Ref<PDFPreviewModalHandle>;
}

const PDFPreviewModal = ({ ref }: PDFPreviewModalProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	// not a ref because pdfUrl is read during render (iframe src)
	const [pdfUrl, setPdfUrl] = useState("");

	useImperativeHandle(ref, () => ({
		open(url: string) {
			setPdfUrl(url);
			dialogRef.current?.showModal();
		},
		close() {
			dialogRef.current?.close();
		},
	}));

	const closeDialog = () => {
		dialogRef.current?.close();
	};

	const handleDownload = () => {
		downloadPDF(pdfUrl);
		closeDialog();
	};

	const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
		// native escape key fires cancel; prevent default so we control teardown ourselves
		e.preventDefault();
		closeDialog();
	};

	return (
		<dialog
			ref={dialogRef}
			onCancel={handleCancel}
			aria-label="Tax Summary Preview"
			className="backdrop:bg-black/50 backdrop:backdrop-blur-sm m-auto w-full max-w-4xl h-[90vh] p-0 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border-0"
		>
			<div
				role="presentation"
				className="w-full h-full flex flex-col"
				onClick={(e) => {
					if (e.target === e.currentTarget) closeDialog();
				}}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
					<h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
						Tax Summary Preview
					</h3>
					<button
						type="button"
						onClick={closeDialog}
						aria-label="Close preview"
						className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
					>
						<X size={20} />
					</button>
				</div>

				{/* PDF iframe */}
				<div className="flex-1 overflow-hidden relative">
					{pdfUrl && (
						<iframe
							src={pdfUrl}
							sandbox="allow-scripts allow-popups allow-modals"
							className="w-full h-full border-0"
							title="PDF Preview"
						/>
					)}

					<button
						type="button"
						onClick={handleDownload}
						className="absolute bottom-6 right-6 flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-lg shadow-lg"
					>
						<Download size={18} />
						Download PDF
					</button>
				</div>
			</div>
		</dialog>
	);
};

export default PDFPreviewModal;