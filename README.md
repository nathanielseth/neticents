# NETICENTS 

NetiCents is an income tax calculator that helps you estimate how much tax is taken from your salary in the Philippines.

### Built With
- React
- Vite
- TailwindCSS

## Getting Started

Start calculating your taxes by visiting https://nathanielseth.github.io/neticents

## Formulas

### Tax Bracket

```javascript
const computeWithholdingTax = (taxableAnnualIncome) => {
  let taxAmount = 0;

  switch (true) {
    case taxableAnnualIncome <= 250000:
      taxAmount = 0; // no withholding tax for annual income up to PHP 250,000
      break;
    case taxableAnnualIncome <= 400000:
      taxAmount = (taxableAnnualIncome - 250000) * 0.15; // 15% tax on income above PHP 250,000 up to PHP 400,000
      break;
    case taxableAnnualIncome <= 800000:
      taxAmount = 22500 + (taxableAnnualIncome - 400000) * 0.2; // 20% tax on income above PHP 400,000 up to PHP 800,000 plus PHP 22,500
      break;
    case taxableAnnualIncome <= 2000000:
      taxAmount = 102500 + (taxableAnnualIncome - 800000) * 0.25; // 25% tax on income above PHP 800,000 up to PHP 2,000,000 plus PHP 102,500
      break;
    case taxableAnnualIncome <= 8000000:
      taxAmount = 402500 + (taxableAnnualIncome - 2000000) * 0.3; // 30% tax on income above PHP 2,000,000 up to PHP 8,000,000 plus PHP 402,500
      break;
    default:
      taxAmount = 2202500 + (taxableAnnualIncome - 8000000) * 0.35; // 35% tax on income above PHP 8,000,000 plus PHP 2,202,500
  }
  return taxAmount / 12; // convert annual tax amount to monthly
};
```
### Contributions
```javascript
// check if income falls within a specific bracket
const bracket = (lower, upper) => (income) =>
  (isNaN(lower) || income >= lower) && (isNaN(upper) || income <= upper);

// philhealth contribution brackets
const bracketPhilHealth = [
  [NaN, 10000, () => 500], // fixed contribution of PHP 500 for income up to PHP 10,000
  [10000.01, 99999.99, (mon) => mon * 0.05], // 5% of monthly income for income between PHP 10,000.01 and PHP 99,999.99
  [100000, NaN, () => 5000], // fixed contribution of PHP 5000 for income above PHP 100,000
];

// compute philhealth contribution based on monthly income
const computePhilHealth = (monthly) => {
  return (
    bracketPhilHealth
      .filter((phBracket) => bracket(phBracket[0], phBracket[1])(monthly)) // filter for applicable bracket
      .reduce(
        (contribution, phBracket) => (contribution += phBracket[2](monthly)), // compute contribution
        0
      ) * 0.5 
  );
};

// check if income falls within a specific SSS bracket
const bracketSSS = (lower, upper) => (income) =>
  (isNaN(lower) || income >= lower) && (isNaN(upper) || income < upper);

// SSS contribution brackets and corresponding contributions
const computeSSS = (salary) => {
  const matrix = [
    [1000, 3250, 135, 0],[3250, 3750, 157.5, 0],
    [3750, 4250, 180, 0],[4250, 4750, 202.5, 0],
    [4750, 5250, 225, 0],[5250, 5750, 247.5, 0],
    [5750, 6250, 270, 0],[6250, 6750, 292.5, 0],
    [6750, 7250, 315, 0],[7250, 7750, 337.5, 0],
    [7750, 8250, 360, 0],[8250, 8750, 382.5, 0],
    [8750, 9250, 405, 0],[9250, 9750, 427.5, 0],
    [9750, 10250, 450, 0],[10250, 10750, 472.5, 0],
    [10750, 11250, 495, 0],[11250, 11750, 517.5, 0],
    [11750, 12250, 540, 0],[12250, 12750, 562.5, 0],
    [12750, 13250, 585, 0],[13250, 13750, 607.5, 0],
    [13750, 14250, 630, 0],[14250, 14750, 652.5, 0],
    [14750, 15250, 675, 0],[15250, 15750, 697.5, 0],
    [15750, 16250, 720, 0],[16250, 16750, 742.5, 0],
    [16750, 17250, 765, 0],[17250, 17750, 787.5, 0],
    [17750, 18250, 810, 0],[18250, 18750, 832.5, 0],
    [18750, 19250, 855, 0],[19250, 19750, 877.5, 0],
    [19750, 20250, 900, 0],[20250, 20750, 900, 22.5],
    [20750, 21250, 900, 45],[21250, 21750, 900, 67.5],
    [21750, 22250, 990, 90],[22250, 22750, 900, 112.5],
    [22750, 23250, 900, 135],[23250, 23750, 900, 157.5],
    [23750, 24250, 900, 180],[24250, 24750, 900, 202.5],
    [24750, NaN, 900, 225],
  ];

  let sss = 0;
  let mpf = 0;

  // find the applicable SSS bracket
  for (const bracket of matrix) {
    if (bracketSSS(bracket[0], bracket[1])(salary)) {
      sss += bracket[2]; // employee SSS contribution
      mpf += bracket[3]; // MPF contribution
    }
  }

  return { sss, mpf };
};
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
