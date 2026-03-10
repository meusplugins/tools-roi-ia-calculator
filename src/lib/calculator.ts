import { CalculatorData, CalculatorResults } from "../types";

export function calculateROI(data: CalculatorData): CalculatorResults {
  // 1. Hourly Rate
  let hourlyRateCalculated = 0;
  if (data.inputMode === 'salary') {
    hourlyRateCalculated = data.monthlySalary / 160;
  } else {
    hourlyRateCalculated = data.hourlyRate;
  }

  // 2. Time per execution in hours
  let timePerExecutionHours = data.timePerExecution;
  if (data.timeUnit === 'minutes') {
    timePerExecutionHours = data.timePerExecution / 60;
  }

  // 3. Weekly and Monthly Hours
  const weeklyHours = timePerExecutionHours * data.executionsPerWeek * data.numberOfPeople;
  const monthlyHours = weeklyHours * 4;

  // 4. Manual Monthly Cost
  const manualMonthlyCost = monthlyHours * hourlyRateCalculated;

  // 5. Monthly Savings
  const automationRatio = data.automationPercentage / 100;
  const monthlySavingsGross = manualMonthlyCost * automationRatio;
  const monthlySavingsNet = monthlySavingsGross - (data.monthlyToolCost || 0);

  // Determine Project Value
  const isDefaultProjectValue = !data.projectValue || data.projectValue <= 0;
  const effectiveProjectValue = isDefaultProjectValue ? 4000 : data.projectValue;

  // 6. Payback
  let paybackMonths = 0;
  if (monthlySavingsNet > 0) {
    paybackMonths = effectiveProjectValue / monthlySavingsNet;
  }

  // 7. Annual Profit
  const annualProfit = (monthlySavingsNet * 12) - effectiveProjectValue;

  // 7.5 ROI Percentage
  let roiPercentage = 0;
  if (effectiveProjectValue > 0) {
    roiPercentage = (annualProfit / effectiveProjectValue) * 100;
  }

  // 8. Hours Saved
  const hoursSavedPerMonth = monthlyHours * automationRatio;
  const hoursSavedPerYear = hoursSavedPerMonth * 12;
  const equivalentMonthsFreed = hoursSavedPerYear / 160;

  // 9. Cost of Inaction
  const costOfInaction12Months = manualMonthlyCost * 12;

  // 10. Priority Score (0-100) - Nova Lógica Focada em Negócios
  let priorityScore = 0;

  // 1. ROI (Peso: 30 pontos)
  if (roiPercentage > 200) priorityScore += 30;
  else if (roiPercentage >= 100) priorityScore += 20;
  else if (roiPercentage >= 50) priorityScore += 10;

  // 2. Payback (Peso: 25 pontos)
  if (paybackMonths > 0 && paybackMonths < 3) priorityScore += 25;
  else if (paybackMonths >= 3 && paybackMonths <= 6) priorityScore += 15;
  else if (paybackMonths > 6 && paybackMonths <= 12) priorityScore += 5;

  // 3. Lucro Anual (Peso: 20 pontos)
  if (annualProfit > 20000) priorityScore += 20;
  else if (annualProfit > 10000) priorityScore += 10;
  else if (annualProfit > 5000) priorityScore += 5;

  // 4. Potencial de Automação (Peso: 15 pontos)
  if (data.automationPercentage >= 70) priorityScore += 15;
  else if (data.automationPercentage >= 50) priorityScore += 8;

  // 5. Volume/Gargalo (Peso: 10 pontos)
  if (data.executionsPerWeek > 10 || data.numberOfPeople > 2) priorityScore += 10;

  // Cap at 100
  priorityScore = Math.min(100, Math.max(0, priorityScore));

  return {
    hourlyRateCalculated,
    weeklyHours,
    monthlyHours,
    manualMonthlyCost,
    monthlySavingsGross,
    monthlySavingsNet,
    paybackMonths,
    annualProfit,
    hoursSavedPerMonth,
    hoursSavedPerYear,
    costOfInaction12Months,
    equivalentMonthsFreed,
    priorityScore,
    roiPercentage,
    isDefaultProjectValue,
  };
}
