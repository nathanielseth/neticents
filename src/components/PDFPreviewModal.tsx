import { X, Download } from 'lucide-react'
import { downloadPDF } from '../utils/pdfGenerator'

interface PDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
}

const PDFPreviewModal = ({ isOpen, onClose, pdfUrl }: PDFPreviewModalProps) => {
  if (!isOpen) return null

  const handleDownload = () => {
    downloadPDF(pdfUrl)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl h-[90vh] mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tax Summary Preview
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="PDF Preview"
          />
          
          <button
            onClick={handleDownload}
            className="absolute bottom-6 right-6 flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#4169e1] hover:bg-[#3557c1] rounded-lg shadow-lg transition-colors"
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  )
}

export default PDFPreviewModal