# Neticents

A real-time Philippine income tax calculator that helps estimate salary deductions.

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646cff?style=for-the-badge&logo=vite&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/github/license/nathanielseth/neticents?style=for-the-badge" />
</p>

**[Try it now](https://nathanielseth.github.io/neticents/)**

## Features

- **Withholding Tax** - computed against BIR's progressive tax brackets
- **Mandatory Contributions** - SSS/GSIS, PhilHealth, and Pag-IBIG
- **Premium Pay** - overtime and night differential
- **De Minimis Benefits** - tax-free allowance handling up to the annual/monthly limit
- **Multiple Pay Periods** - view results as monthly, biweekly, or annual figures
- **PDF Export** - generate and download a tax summary
- **Installable PWA** - works offline once loaded, installable on desktop and mobile

## Getting Started

### Prerequisites

- **[Node.js 20](https://nodejs.org/en/download)**

### Installation

```bash
git clone https://github.com/nathanielseth/neticents.git
cd neticents
npm install
```

### Development

```bash
npm run dev
```


### Build

```bash
npm run build
```


### Preview production build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/   # UI components
├── utils/        # Calculation logic, formatting, PDF generation
├── types/        # Shared types
├── App.tsx       # App shell
└── main.tsx      # Entry point
```

## Contributing

Contributions are welcome.

1. Fork the repo and create a branch from `main`
2. Make your changes (`npm run lint` before committing)
3. Open a pull request with a clear description of the changes and why

When adding or updating a contribution/tax rate, include the official circular or issuance in your PR description. See below for references this project already uses.

## Disclaimer

This calculator is intended for **estimation purposes only**. It does not account
for holidays, unique employer policies, or every edge case in Philippine labor law.

## References

- [SSS Circular No. 2024-006](https://www.sss.gov.ph/wp-content/uploads/2024/12/Cir-2024-006-Employers-scaled.jpg)
- [PhilHealth Circular No. 2019-0009](https://www.philhealth.gov.ph/partners/employers/ContributionTable_v2.pdf)
- [Pag-IBIG Circular No. 460](https://www.philhealth.gov.ph/circulars/2019/circ2019-0009.pdf)
- [RA 8291, Section 11](https://www.gsis.gov.ph/about-us/gsis-laws/republic-act-no-8291/)
- [BIR Withholding Tax](https://www.bir.gov.ph/WithHoldingTax)
- [RA 10963 (TRAIN Law)](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/80559)

## License

[MIT](./LICENSE)