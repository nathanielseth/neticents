import PropTypes from "prop-types";

const References = ({ theme }) => {
	const referenceLinks = [
		{
			title: "Circular No. 2024-006",
			subtitle: "SSS Contributions 2025",
			url: "https://www.sss.gov.ph/wp-content/uploads/2024/12/Cir-2024-006-Employers-scaled.jpg",
			category: "sss",
		},
		{
			title: "Circular No. 2019-0009",
			subtitle: "PhilHealth Contribution Table",
			url: "https://www.philhealth.gov.ph/partners/employers/ContributionTable_v2.pdf",
			category: "philhealth",
		},
		{
			title: "Circular No. 460",
			subtitle: "Pag-Ibig Contribution",
			url: "https://www.philhealth.gov.ph/circulars/2019/circ2019-0009.pdf",
			category: "pagibig",
		},
		{
			title: "RA 8291 - Section 11",
			subtitle: "GSIS Contributions",
			url: "https://www.gsis.gov.ph/about-us/gsis-laws/republic-act-no-8291/",
			category: "gsis",
		},
		{
			title: "BIR Withholding Tax",
			subtitle: "Tax Tables & Guidelines",
			url: "https://www.bir.gov.ph/WithHoldingTax",
			category: "tax",
		},
		{
			title: "RA 10963",
			subtitle: "TRAIN Law",
			url: "https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/80559",
			category: "tax",
		},
		{
			title: "Article on Overtime Pay",
			subtitle: "Overtime Pay Guidelines",
			url: "https://laborlaw.ph/overtime-pay/",
			category: "other",
		},
		{
			title: "Article on Night Differential",
			subtitle: "Night Shift Differential Pay",
			url: "https://laborlaw.ph/night-shift-differential-pay/",
			category: "other",
		},
		{
			title: "Article on De Minimis Benefits",
			subtitle: "Guidelines on Allowance",
			url: "https://www.eezi.com/de-minimis-benefits-philippines/",
			category: "other",
		},
	];

	const getHoverClasses = (category) => {
		const hoverStyles = {
			sss:
				theme === "dark"
					? "hover:bg-green-400/15 hover:text-green-400"
					: "hover:bg-green-50 hover:text-green-700",
			gsis:
				theme === "dark"
					? "hover:bg-green-400/15 hover:text-green-400"
					: "hover:bg-green-50 hover:text-green-700",
			philhealth:
				theme === "dark"
					? "hover:bg-purple-400/15 hover:text-purple-400"
					: "hover:bg-purple-50 hover:text-purple-700",
			pagibig:
				theme === "dark"
					? "hover:bg-yellow-400/15 hover:text-yellow-400"
					: "hover:bg-yellow-50 hover:text-yellow-700",
			tax:
				theme === "dark"
					? "hover:bg-red-400/15 hover:text-red-400"
					: "hover:bg-red-50 hover:text-red-700",
			other:
				theme === "dark"
					? "hover:bg-blue-400/15 hover:text-blue-400"
					: "hover:bg-blue-50 hover:text-blue-700",
		};
		return hoverStyles[category] || hoverStyles.other;
	};

	return (
		<div className="max-w-4xl w-full px-4 mb-8">
			<div className="relative mb-6">
				<div className="absolute inset-0 flex items-center">
					<div
						className={`w-full border-t ${
							theme === "dark" ? "border-gray-600" : "border-gray-300"
						}`}
					></div>
				</div>
				<div className="relative flex justify-left">
					<span
						className={`px-4 text-sm font-medium ${
							theme === "dark"
								? "bg-gray-900 text-gray-400"
								: "bg-[#fbfcfd] text-gray-500"
						}`}
					>
						References
					</span>
				</div>
			</div>

			<div
				className={`p-6 rounded-lg ${
					theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
				} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
					{referenceLinks.map((link, index) => (
						<a
							key={index}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							className={`block p-3 rounded-lg border ${
								theme === "dark"
									? "bg-gray-700 text-gray-300 border-gray-600"
									: "bg-gray-50 text-gray-700 border-gray-200"
							} ${getHoverClasses(link.category)}`}
						>
							<div className="font-medium text-sm mb-1">{link.title}</div>
							<div
								className={`text-xs ${
									theme === "dark" ? "text-gray-400" : "text-gray-600"
								}`}
							>
								{link.subtitle}
							</div>
						</a>
					))}
				</div>
			</div>
		</div>
	);
};

References.propTypes = {
	theme: PropTypes.string.isRequired,
};

export default References;
