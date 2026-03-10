export interface CalculatorData {
  taskName: string;
  inputMode: 'salary' | 'hourly';
  monthlySalary: number;
  hourlyRate: number;
  timePerExecution: number;
  timeUnit: 'minutes' | 'hours';
  executionsPerWeek: number;
  numberOfPeople: number;
  automationPercentage: number;
  projectValue: number;
  monthlyToolCost: number;
}

export interface CalculatorResults {
  hourlyRateCalculated: number;
  weeklyHours: number;
  monthlyHours: number;
  manualMonthlyCost: number;
  monthlySavingsGross: number;
  monthlySavingsNet: number;
  paybackMonths: number;
  annualProfit: number;
  hoursSavedPerMonth: number;
  hoursSavedPerYear: number;
  costOfInaction12Months: number;
  equivalentMonthsFreed: number;
  priorityScore: number;
  roiPercentage: number;
  isDefaultProjectValue?: boolean;
}

export type AppStep = 'hero' | 'calculator' | 'leadcapture' | 'results';
