import { useState, useEffect } from "react";
import { HiAdjustmentsHorizontal, HiXMark } from "react-icons/hi2";

const SettingsModal = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [settings, setSettings] = useState({
		withholdingTaxRates: "2023",
		sssRates: "2025",
		philhealthRates: "2024",
		pagibigRates: "2024",
	});

	const settingOptions = {
		withholdingTaxRates: [{ value: "2023", label: "2023" }],
		sssRates: [{ value: "2025", label: "2025" }],
		philhealthRates: [{ value: "2024", label: "2024" }],
		pagibigRates: [{ value: "2024", label: "2024" }],
	};

	const handleSettingChange = (settingKey, value) => {
		setSettings((prev) => ({
			...prev,
			[settingKey]: value,
		}));
		console.log(`Updated ${settingKey} to ${value}`);
	};

	const handleOpen = () => {
		setIsOpen(true);
		setTimeout(() => setIsAnimating(true), 10);
	};

	const handleClose = () => {
		setIsAnimating(false);
		setTimeout(() => setIsOpen(false), 150);
	};

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};

	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === "Escape") {
				handleClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	return (
		<>
			<button
				type="button"
				aria-label="Open preferences"
				className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition duration-100 mr-3"
				onClick={handleOpen}
			>
				<HiAdjustmentsHorizontal size={20} />
			</button>

			{isOpen && (
				<div
					className={`fixed inset-0 bg-black/20 dark:bg-black/40 z-50 flex items-start justify-center p-4 pt-36 transition-opacity duration-150 ${
						isAnimating ? "opacity-100" : "opacity-0"
					}`}
					onClick={handleBackdropClick}
				>
					<div
						className={`relative bg-[#fbfcfd] dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto p-6 transition-all duration-150 ${
							isAnimating
								? "opacity-100 scale-100 translate-y-0"
								: "opacity-0 scale-95 translate-y-2"
						}`}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-black dark:text-white">
								Calculation Preference
							</h2>
							<button
								onClick={handleClose}
								className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
								aria-label="Close preferences"
							>
								<HiXMark size={20} />
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Withholding Tax Rates
								</label>
								<div className="relative">
									<select
										value={settings.withholdingTaxRates}
										onChange={(e) =>
											handleSettingChange("withholdingTaxRates", e.target.value)
										}
										className="w-full px-3 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 transition-colors appearance-none"
									>
										{settingOptions.withholdingTaxRates.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
									<div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
										<svg
											className="w-4 h-4 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									SSS Rates
								</label>
								<div className="relative">
									<select
										value={settings.sssRates}
										onChange={(e) =>
											handleSettingChange("sssRates", e.target.value)
										}
										className="w-full px-3 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 transition-colors appearance-none"
									>
										{settingOptions.sssRates.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
									<div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
										<svg
											className="w-4 h-4 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									PhilHealth Rates
								</label>
								<div className="relative">
									<select
										value={settings.philhealthRates}
										onChange={(e) =>
											handleSettingChange("philhealthRates", e.target.value)
										}
										className="w-full px-3 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 transition-colors appearance-none"
									>
										{settingOptions.philhealthRates.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
									<div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
										<svg
											className="w-4 h-4 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Pag-IBIG Rates
								</label>
								<div className="relative">
									<select
										value={settings.pagibigRates}
										onChange={(e) =>
											handleSettingChange("pagibigRates", e.target.value)
										}
										className="w-full px-3 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 transition-colors appearance-none"
									>
										{settingOptions.pagibigRates.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
									<div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
										<svg
											className="w-4 h-4 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default SettingsModal;
