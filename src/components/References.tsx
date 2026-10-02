import type { ReferenceLink } from "../types";

const REFERENCE_LINKS: ReferenceLink[] = [
	{
		title: "Circular No. 2024-006",
		subtitle: "SSS Contributions 2025",
		url: "https://www.sss.gov.ph/wp-content/uploads/2024/12/Cir-2024-006-Employers-scaled.jpg",
	},
	{
		title: "Circular No. 2019-0009",
		subtitle: "PhilHealth Contribution Table",
		url: "https://www.philhealth.gov.ph/partners/employers/ContributionTable_v2.pdf",
	},
	{
		title: "Circular No. 460",
		subtitle: "Pag-IBIG Contribution",
		url: "https://www.pagibigfund.gov.ph/document/pdf/circulars/provident/Circular%20No.%20460%20-%20Guidelines%20on%20the%20Pag-IBIG%20Fund's%20Implementation%20of%20Increase%20in%20the%20MFS%20Effective%20February%202024.pdf",
	},
	{
		title: "RA 8291 - Section 11",
		subtitle: "GSIS Contributions",
		url: "https://www.gsis.gov.ph/about-us/gsis-laws/republic-act-no-8291/",
	},
	{
		title: "BIR Withholding Tax",
		subtitle: "Tax Tables & Guidelines",
		url: "https://www.bir.gov.ph/WithHoldingTax",
	},
	{
		title: "RA 10963",
		subtitle: "TRAIN Law",
		url: "https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/80559",
	},
	{
		title: "BIR RR No. 29-2025",
		subtitle: "De Minimis Ceilings 2026",
		url: "https://www.grantthornton.com.ph/insights/articles-and-updates1/tax-notes/updated-de-minimis-benefits-threshold/",
	},
	{
		title: "RA 11701",
		subtitle: "Government Night Differential",
		url: "https://www.csc.gov.ph/phocadownload/userupload/hrpso/issuances/RA11701/IRR%20RA%2011701.pdf",
	},
	{
		title: "DOLE Statutory Benefits Handbook",
		subtitle: "Overtime, Night Differential, Rate Factors",
		url: "https://bwc.dole.gov.ph/wp-content/uploads/2024/10/Workers-Statutory-Monetary-Benefits-Handbook-2024-Edition.pdf",
	},
	{
		title: "Article on Overtime Pay",
		subtitle: "Overtime Pay Guidelines",
		url: "https://laborlaw.ph/overtime-pay/",
	},
	{
		title: "Article on Night Differential",
		subtitle: "Night Shift Differential Pay",
		url: "https://laborlaw.ph/night-shift-differential-pay/",
	},
	{
		title: "Article on De Minimis Benefits",
		subtitle: "Guidelines on Allowance",
		url: "https://www.eezi.com/de-minimis-benefits-philippines/",
	},
];

const References = () => (
	<section
		aria-labelledby="references-heading"
		className="mt-12 border-t border-line pt-8"
	>
		<h2 id="references-heading" className="mb-4 text-sm font-medium text-fg">
			References
		</h2>
		<ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
			{REFERENCE_LINKS.map((link) => (
				<li key={link.title} className="min-w-0">
					<a
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						className="-mx-3 block rounded-lg px-3 py-2 hover:bg-sunken"
					>
						<span className="block text-sm font-medium text-fg">
							{link.title}
						</span>
						<span className="block text-xs text-muted">{link.subtitle}</span>
					</a>
				</li>
			))}
		</ul>
	</section>
);

export default References;
