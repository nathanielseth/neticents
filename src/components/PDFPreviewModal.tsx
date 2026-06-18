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
			className="backdrop:bg-black/50 backdrop:backdrop-blur-sm m-auto w-full max-w-4xl h-[90vh] p-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-0"
		>
			{/* a <div> avoids no-noninteractive-element-interactions lint rule on <dialog> */}
			<div
				role="presentation"
				className="w-full h-full flex flex-col"
				onClick={(e) => {
					if (e.target === e.currentTarget) closeDialog();
				}}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
						Tax Summary Preview
					</h3>
					<button
						type="button"
						onClick={closeDialog}
						aria-label="Close preview"
						className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<X size={20} />
					</button>
				</div>

				{/* PDF iframe */}
				<div className="flex-1 overflow-hidden relative">
					<iframe
						src={pdfUrl}
						sandbox="allow-scripts allow-popups allow-modals"
						className="w-full h-full border-0"
						title="PDF Preview"
					/>

					<button
						type="button"
						onClick={handleDownload}
						className="absolute bottom-6 right-6 flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#4169e1] hover:bg-[#3557c1] rounded-lg shadow-lg transition-colors"
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