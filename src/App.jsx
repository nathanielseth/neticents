import { useState } from "react";
import Inputs from "./components/Inputs";
import Summary from "./components/Summary";

const App = () => {
	const [monthlySalary, setMonthlySalary] = useState("");
	const [allowance, setAllowance] = useState("");
	const [allowanceTaxable, setAllowanceTaxable] = useState(false);
	const [sector, setSector] = useState("private");
	const [period, setPeriod] = useState("monthly");

	return (
		<div className="flex items-center justify-center h-screen bg-white text-gray-900">
			<div className="max-w-4xl w-full">
				<p className="text-center font-bold text-[#7f2ffa]">
					INCOME TAX CALCULATOR
				</p>
				<h2 className="text-3xl font-bold text-center text-black mt-2">
					How much are they taking from you?
				</h2>
				<p className="text-center text-gray-600 mt-3">
					Philippine tax rate per RA 10963
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
					<div>
						<Inputs
							setMonthlySalary={setMonthlySalary}
							setAllowance={setAllowance}
							setAllowanceTaxable={setAllowanceTaxable}
							setSector={setSector}
							setPeriod={setPeriod}
							allowanceTaxable={allowanceTaxable}
						/>
					</div>

					<div className="p-2 ">
						<Summary
							monthlySalary={monthlySalary}
							allowance={allowance}
							sector={sector}
							period={period}
							allowanceTaxable={allowanceTaxable}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default App;
