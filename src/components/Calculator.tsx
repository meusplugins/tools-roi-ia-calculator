import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CalculatorData } from "../types";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { trackEvent } from "../lib/analytics";

interface CalculatorProps {
  onComplete: (data: CalculatorData) => void;
}

const STEPS = [
  { id: 1, title: "Contexto da Tarefa" },
  { id: 2, title: "Custo Atual" },
  { id: 3, title: "Viabilidade & Investimento" },
];

export function Calculator({ onComplete }: CalculatorProps) {
  useEffect(() => {
    trackEvent("step_01");
  }, []);

  const [step, setStep] = useState(1);
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({});
  const [data, setData] = useState<CalculatorData>({
    taskName: "",
    inputMode: "salary",
    monthlySalary: 0,
    hourlyRate: 0,
    timePerExecution: 0,
    timeUnit: "minutes",
    executionsPerWeek: 0,
    numberOfPeople: 1,
    automationPercentage: 80,
    projectValue: 0,
    monthlyToolCost: 0,
  });

  const handleNext = () => {
    if (step < STEPS.length) setStep(step + 1);
    else onComplete(data);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateData = (updates: Partial<CalculatorData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNumberChange = (field: keyof CalculatorData, value: string) => {
    const cleanValue = value.replace(/[^0-9.,]/g, "");
    setRawInputs((prev) => ({ ...prev, [field]: cleanValue }));
    const numValue = parseFloat(cleanValue.replace(",", ".")) || 0;
    updateData({ [field]: numValue as never });
  };

  const isStepValid = () => {
    if (step === 1) return data.taskName.trim() !== "" && data.numberOfPeople > 0;
    if (step === 2) {
      const hasCost = data.inputMode === "salary" ? data.monthlySalary > 0 : data.hourlyRate > 0;
      return hasCost && data.timePerExecution > 0 && data.executionsPerWeek > 0;
    }
    if (step === 3) return data.automationPercentage > 0;
    return false;
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between mb-4">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`text-sm font-semibold transition-colors duration-300 ${
                step >= s.id ? "text-[#4DC3FF]" : "text-[#6E8498]"
              }`}
            >
              {s.title}
            </div>
          ))}
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#4DC3FF] to-[#7CE7FF]"
            initial={{ width: "33%" }}
            animate={{ width: `${(step / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className="glass-card p-8 md:p-12 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Qual tarefa está consumindo o tempo do seu time?</h2>
              <p className="text-[#8FA6BA] mb-8">
                Escolha algo que acontece com frequência e envolve execução manual — mesmo que pareça simples. Esses são os maiores geradores de custo oculto.
              </p>

              <div>
                <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">
                  Nome da tarefa ou processo
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Conferência manual de notas fiscais"
                  value={data.taskName}
                  onChange={(e) => updateData({ taskName: e.target.value })}
                />
                <p className="text-xs text-[#8FA6BA] mt-2">Seja específico — isso vai aparecer no seu diagnóstico personalizado.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">
                  Quantas pessoas executam essa tarefa hoje?
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input-field"
                  placeholder="Ex: 2"
                  value={rawInputs.numberOfPeople ?? (data.numberOfPeople || "")}
                  onChange={(e) => handleNumberChange("numberOfPeople", e.target.value)}
                />
                <p className="text-xs text-[#8FA6BA] mt-2">Inclua todos que participam do processo, mesmo parcialmente.</p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-2">O que essa tarefa custa por mês, de verdade?</h2>
              <p className="text-[#8FA6BA] mb-8">
                A maioria das empresas subestima esse número. Vamos calcular com precisão o que está sendo gasto hoje — antes de qualquer otimização.
              </p>

              <div className="flex gap-4 mb-6">
                <button
                  className={`flex-1 py-3 px-4 rounded-xl border font-semibold transition-all ${
                    data.inputMode === "salary"
                      ? "bg-[#4DC3FF]/10 border-[#4DC3FF] text-[#4DC3FF]"
                      : "bg-white/5 border-white/10 text-[#8FA6BA] hover:bg-white/10"
                  }`}
                  onClick={() => updateData({ inputMode: "salary" })}
                >
                  Salário Mensal
                </button>
                <button
                  className={`flex-1 py-3 px-4 rounded-xl border font-semibold transition-all ${
                    data.inputMode === "hourly"
                      ? "bg-[#4DC3FF]/10 border-[#4DC3FF] text-[#4DC3FF]"
                      : "bg-white/5 border-white/10 text-[#8FA6BA] hover:bg-white/10"
                  }`}
                  onClick={() => updateData({ inputMode: "hourly" })}
                >
                  Valor por Hora
                </button>
              </div>

              {data.inputMode === "salary" ? (
                <div>
                  <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">
                    Salário mensal médio por pessoa (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="input-field"
                    placeholder="Ex: 3500"
                    value={rawInputs.monthlySalary ?? (data.monthlySalary || "")}
                    onChange={(e) => handleNumberChange("monthlySalary", e.target.value)}
                  />
                  <p className="text-xs text-[#8FA6BA] mt-2">Use o custo total (CLT = salário + ~70% de encargos).</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">
                    Valor por hora (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="input-field"
                    placeholder="Ex: 25"
                    value={rawInputs.hourlyRate ?? (data.hourlyRate || "")}
                    onChange={(e) => handleNumberChange("hourlyRate", e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">
                    Tempo médio por execução
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="input-field"
                    placeholder="Ex: 40"
                    value={rawInputs.timePerExecution ?? (data.timePerExecution || "")}
                    onChange={(e) => handleNumberChange("timePerExecution", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">
                    Unidade de tempo
                  </label>
                  <select
                    className="input-field appearance-none"
                    value={data.timeUnit}
                    onChange={(e) => updateData({ timeUnit: e.target.value as "minutes" | "hours" })}
                  >
                    <option value="minutes">Minutos</option>
                    <option value="hours">Horas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">
                  Vezes por semana que a tarefa ocorre
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input-field"
                  placeholder="Ex: 15"
                  value={rawInputs.executionsPerWeek ?? (data.executionsPerWeek || "")}
                  onChange={(e) => handleNumberChange("executionsPerWeek", e.target.value)}
                />
                <p className="text-xs text-[#8FA6BA] mt-2">Se for diária, multiplique pelos dias úteis da semana. (Ex: 2x ao dia em 5 dias da semana = 10)</p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Qual o tamanho do investimento que estamos avaliando?</h2>
              <p className="text-[#8FA6BA] mb-8">
                Com esses dados, calculamos o payback exato e o lucro líquido projetado para os próximos 12 meses.
              </p>

              <div>
                <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">
                  Percentual estimado de automação (%)
                </label>
                <select
                  className="input-field appearance-none"
                  value={data.automationPercentage}
                  onChange={(e) => updateData({ automationPercentage: parseFloat(e.target.value) || 0 })}
                >
                  <option value="50">50% (Conservador)</option>
                  <option value="70">70% (Provável)</option>
                  <option value="80">80% (Recomendado)</option>
                  <option value="90">90% (Agressivo)</option>
                  <option value="100">100% (Total)</option>
                </select>
                <p className="text-xs text-[#8FA6BA] mt-2">Percentual do processo que será eliminado da operação manual.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">
                  Valor estimado do projeto de automação (R$) <span className="text-[#6E8498] font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input-field"
                  placeholder="Ex: 12000"
                  value={rawInputs.projectValue ?? (data.projectValue || "")}
                  onChange={(e) => handleNumberChange("projectValue", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">
                  Custo mensal de ferramentas/API (R$) <span className="text-[#6E8498] font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input-field"
                  placeholder="Ex: 500"
                  value={rawInputs.monthlyToolCost ?? (data.monthlyToolCost || "")}
                  onChange={(e) => handleNumberChange("monthlyToolCost", e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 sm:gap-0 pt-6 border-t border-white/10">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`flex items-center justify-center gap-2 font-semibold transition-colors w-full sm:w-auto py-3 sm:py-0 ${
              step === 1 ? "opacity-0 pointer-events-none hidden sm:flex" : "text-[#8FA6BA] hover:text-white"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="primary-button flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto"
          >
            <span className="text-center">
              {step === STEPS.length ? "Ver Meu Diagnóstico Completo" : "Avançar"}
            </span>
            {step === STEPS.length ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <ArrowRight className="w-5 h-5 flex-shrink-0" />}
          </button>
        </div>
      </div>
    </div>
  );
}
