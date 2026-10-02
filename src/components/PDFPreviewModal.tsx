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
			className="m-auto h-[90dvh] w-[calc(100%-2rem)] max-w-4xl rounded-2xl border-0 bg-surface p-0 text-fg shadow-2xl backdrop:bg-black/50"
		>
			<div
				role="presentation"
				className="w-full h-full flex flex-col"
				onClick={(e) => {
					if (e.target === e.currentTarget) closeDialog();
				}}
			>
				<div className="flex items-center justify-between border-b border-line p-4">
					<h3 className="text-lg font-semibold">
						Tax Summary Preview
					</h3>
					<button
						type="button"
						onClick={closeDialog}
						aria-label="Close preview"
						className="grid size-9 place-items-center rounded-lg text-muted hover:bg-sunken hover:text-fg"
					>
						<X aria-hidden className="size-5" />
					</button>
				</div>

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
						className="absolute right-6 bottom-6 flex h-10 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white shadow-lg hover:bg-brand-hover"
					>
						<Download aria-hidden className="size-4.5" />
						Download PDF
					</button>
				</div>
			</div>
		</dialog>
	);
};

export default PDFPreviewModal;