const Summary = () => {
	const deductions = {
		withholdingTax: 1000,
		sss: 1000,
		providentFund: 1000,
		philHealth: 1000,
		pagIbig: 1000,
		total: 10000,
	};

	const getWidthPercentage = (amount) => (amount / deductions.total) * 100;

	const handleDownload = () => {
		alert("not implemented yet");
	};

	return (
		<div className="relative mt-6">
			<div
				className="p-6 bg-white rounded-lg border-b-4 border-[#7f2ffa]"
				style={{
					boxShadow: "0 -1px 15px rgba(0, 0, 0, 0.15)",
				}}
			>
				<h3 className="text-md font-normal text-center text-gray-500 mt-1 mb-1">
					Take Home Pay:
				</h3>
				<div className="grid grid-cols-1 justify-items-center">
					<h1 className="text-4xl font-bold text-[#7f2ffa]">₱22,145.00</h1>
				</div>
				<div className="relative mt-7 w-full h-2 bg-gray-300 rounded-full">
					<div
						className="absolute h-full bg-purple-500 rounded-l-full"
						style={{
							width: `${getWidthPercentage(deductions.withholdingTax)}%`,
						}}
						title={`Withholding Tax (${getWidthPercentage(
							deductions.withholdingTax
						).toFixed(2)}%)`}
					></div>
					<div
						className="absolute h-full bg-gray-400"
						style={{
							width: `${getWidthPercentage(deductions.sss)}%`,
							left: `${getWidthPercentage(deductions.withholdingTax)}%`,
						}}
						title={`SSS Contribution (${getWidthPercentage(
							deductions.sss
						).toFixed(2)}%)`}
					></div>
					<div
						className="absolute h-full bg-green-500"
						style={{
							width: `${getWidthPercentage(deductions.providentFund)}%`,
							left: `${getWidthPercentage(
								deductions.withholdingTax + deductions.sss
							)}%`,
						}}
						title={`Mandatory Provident Fund (${getWidthPercentage(
							deductions.providentFund
						).toFixed(2)}%)`}
					></div>
					<div
						className="absolute h-full bg-yellow-500"
						style={{
							width: `${getWidthPercentage(deductions.philHealth)}%`,
							left: `${getWidthPercentage(
								deductions.withholdingTax +
									deductions.sss +
									deductions.providentFund
							)}%`,
						}}
						title={`PhilHealth Contribution (${getWidthPercentage(
							deductions.philHealth
						).toFixed(2)}%)`}
					></div>
					<div
						className="absolute h-full bg-blue-500"
						style={{
							width: `${getWidthPercentage(deductions.pagIbig)}%`,
							left: `${getWidthPercentage(
								deductions.withholdingTax +
									deductions.sss +
									deductions.providentFund +
									deductions.philHealth
							)}%`,
						}}
						title={`Pag-Ibig Contribution (${getWidthPercentage(
							deductions.pagIbig
						).toFixed(2)}%)`}
					></div>
					<div
						className="absolute h-full bg-red-500 rounded-r-full"
						style={{
							width: `${getWidthPercentage(
								deductions.total -
									(deductions.withholdingTax +
										deductions.sss +
										deductions.providentFund +
										deductions.philHealth +
										deductions.pagIbig)
							)}%`,
							left: `${getWidthPercentage(
								deductions.withholdingTax +
									deductions.sss +
									deductions.providentFund +
									deductions.philHealth +
									deductions.pagIbig
							)}%`,
						}}
						title={`Total Deduction (${getWidthPercentage(
							deductions.total
						).toFixed(2)}%)`}
					></div>
				</div>
				<div className="mt-6 text-gray-900 space-y-4">
					<div className="flex justify-between items-center mb-2">
						<span className="flex items-center">
							<span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
							<span className="font-semibold text-zinc-600">
								Withholding Tax
							</span>
						</span>
						<span className="font-bold">₱1,000</span>
					</div>
					<div className="flex justify-between items-center mb-2">
						<span className="flex items-center">
							<span className="w-3 h-3 rounded-full bg-gray-400 border border-gray-300 mr-2"></span>
							<span className="font-semibold text-zinc-600">
								SSS Contribution
							</span>
						</span>
						<span className="font-bold">₱1,000</span>
					</div>
					<div className="flex justify-between items-center mb-2">
						<span className="flex items-center">
							<span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
							<span className="font-semibold text-zinc-600">
								Mandatory Provident Fund
							</span>
						</span>
						<span className="font-bold">₱1,000</span>
					</div>
					<div className="flex justify-between items-center mb-2">
						<span className="flex items-center">
							<span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
							<span className="font-semibold text-zinc-600">
								PhilHealth Contribution
							</span>
						</span>
						<span className="font-bold">₱1,000</span>
					</div>
					<div className="flex justify-between items-center mb-2">
						<span className="flex items-center">
							<span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
							<span className="font-semibold text-zinc-600">
								Pag-Ibig Contribution
							</span>
						</span>
						<span className="font-bold">₱1,000</span>
					</div>
					<div className="flex justify-between items-center mb-2">
						<span className="flex items-center">
							<span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
							<span className="font-semibold text-zinc-600">
								Total Deduction
							</span>
						</span>
						<span className="font-bold">₱10,000</span>
					</div>
				</div>
			</div>
			<div className="mt-4 flex justify-center">
				<button
					className="w-full py-3 text-white bg-[#7f2ffa] rounded-lg transition duration-200"
					onClick={handleDownload}
				>
					Save as PDF
				</button>
			</div>
		</div>
	);
};

export default Summary;
