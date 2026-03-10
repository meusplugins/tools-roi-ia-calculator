import { motion } from "motion/react";
import { CalculatorData, CalculatorResults } from "../types";
import { useState } from "react";
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  DollarSign,
  Activity,
  ArrowRight,
  Zap,
  Link as LinkIcon,
  Check
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface ResultsProps {
  data: CalculatorData;
  results: CalculatorResults;
  userName?: string;
  userEmail?: string;
  userWhatsapp?: string;
  onAction?: () => void;
}

export function Results({ data, results, userName, userEmail, userWhatsapp, onAction }: ResultsProps) {
  const [copied, setCopied] = useState(false);
  const [timeframe, setTimeframe] = useState<6 | 12>(12);

  const firstName = userName ? userName.split(" ")[0] : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value);

  const getDiagnosticText = () => {
    if (results.paybackMonths <= 0) {
      return "Com os dados informados, o projeto não apresenta retorno financeiro direto. Talvez o ganho esteja em escala, qualidade ou redução de erros.";
    }
    if (results.paybackMonths <= 3) {
      return "Esse é um caso com retorno muito rápido. A automação tende a se pagar em pouco tempo e começar a gerar caixa ainda no curto prazo.";
    }
    if (results.paybackMonths <= 6) {
      return "Esse processo apresenta um bom potencial de retorno. O investimento tende a se pagar em prazo saudável e gerar economia consistente.";
    }
    if (results.paybackMonths <= 12) {
      return "O retorno existe, mas pode depender de escopo, ganho de qualidade e redução de retrabalho para ficar ainda mais forte.";
    }
    return "Com os dados informados, talvez essa automação faça mais sentido por escala, padronização ou redução de erros do que por economia direta.";
  };

  const getPriorityLabel = () => {
    if (results.priorityScore >= 80) return { text: "Alta Prioridade", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" };
    if (results.priorityScore >= 50) return { text: "Boa Oportunidade", color: "text-[#4DC3FF]", bg: "bg-[#4DC3FF]/10", border: "border-[#4DC3FF]/20" };
    return { text: "Oportunidade Moderada", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/20" };
  };

  const priority = getPriorityLabel();

  // New timeframe-based calculations
  const effectiveProjectValue = results.isDefaultProjectValue ? 4000 : (Number(data.projectValue) || 0);
  const apiCost = Number(data.monthlyToolCost) || 0;
  const manualMonthlyCost = Number(results.manualMonthlyCost) || 0;
  const automationPercentage = Number(data.automationPercentage) || 0;

  const grossSavings = manualMonthlyCost * (automationPercentage / 100);
  const monthlyIaCost = (effectiveProjectValue / timeframe) + apiCost;
  const monthlyNetSavingsDiluted = grossSavings - monthlyIaCost;
  const accumulatedProfit = monthlyNetSavingsDiluted * timeframe;
  const currentRoi = effectiveProjectValue > 0 ? (accumulatedProfit / effectiveProjectValue) * 100 : 0;
  
  const costOfInaction12m = manualMonthlyCost * 12;
  const hoursSavedPerMonth = Number(results.hoursSavedPerMonth) || 0;
  const hoursSavedPeriod = hoursSavedPerMonth * timeframe;
  const equivalentMonthsFreed = hoursSavedPeriod / 160;

  // Generate chart data
  const chartData = Array.from({ length: timeframe }, (_, i) => {
    const month = i + 1;
    const profit = monthlyNetSavingsDiluted * month;
    return {
      name: `Mês ${month}`,
      lucro: profit,
    };
  });

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 relative"
      >
        <button
          onClick={handleCopyLink}
          className="absolute top-0 right-0 md:-right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium text-[#C6D7E6]"
          title="Copiar link deste resultado"
        >
          {copied ? <Check className="w-4 h-4 text-[#00E676]" /> : <LinkIcon className="w-4 h-4" />}
          {copied ? "Link copiado!" : "Copiar Link"}
        </button>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight pt-12 md:pt-0">
          Você está deixando <span className="text-[#F59E0B]">{formatCurrency(costOfInaction12m)}</span> na mesa em 12 meses{firstName ? `, ${firstName}` : ""}.
        </h2>
        <p className="text-lg text-[#8FA6BA] max-w-2xl mx-auto">
          O processo <span className="text-white font-semibold">"{data.taskName}"</span> consome{" "}
          <span className="text-[#4DC3FF] font-semibold">{formatCurrency(manualMonthlyCost)}/mês</span> da sua operação em execução manual.
        </p>
      </motion.div>

      {/* Timeframe Toggle */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div className="bg-[#0B1728] p-1 rounded-lg inline-flex border border-white/10">
          <button
            onClick={() => setTimeframe(6)}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${timeframe === 6 ? 'bg-[#4DC3FF] text-[#07111F]' : 'text-[#8FA6BA] hover:text-white'}`}
          >
            Visão 6 Meses
          </button>
          <button
            onClick={() => setTimeframe(12)}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${timeframe === 12 ? 'bg-[#4DC3FF] text-[#07111F]' : 'text-[#8FA6BA] hover:text-white'}`}
          >
            Visão 12 Meses
          </button>
        </div>
      </motion.div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="metric-card flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4 text-[#8FA6BA]">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Custo Atual / Mês</h3>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(manualMonthlyCost)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-[#8FA6BA]">
              Cálculo: <span className="text-white">{formatNumber(results.monthlyHours)}h/mês</span> × <span className="text-white">{formatCurrency(results.hourlyRateCalculated)}/h</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="metric-card flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4 text-[#F59E0B]">
              <Zap className="w-5 h-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Custo IA / Mês</h3>
            </div>
            <p className="text-3xl font-bold text-[#F59E0B]">{formatCurrency(monthlyIaCost)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-[#8FA6BA]">
              Cálculo: (<span className="text-white">{formatCurrency(effectiveProjectValue)}</span> ÷ {timeframe}m) + <span className="text-white">{formatCurrency(apiCost)}</span> API
            </p>
            {results.isDefaultProjectValue && (
              <p className="text-[10px] text-[#F59E0B] mt-2 bg-[#F59E0B]/10 p-2 rounded-md border border-[#F59E0B]/20">
                * Baseado em projeto de R$ 4k
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="highlight-card flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4 text-[#4DC3FF]">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Economia / Mês</h3>
            </div>
            <p className="text-4xl font-extrabold text-[#4DC3FF]">{formatCurrency(monthlyNetSavingsDiluted)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#4DC3FF]/20">
            <p className="text-xs text-[#8FA6BA]">
              Cálculo: (<span className="text-white">{formatCurrency(manualMonthlyCost)}</span> × {automationPercentage}%) - <span className="text-white">{formatCurrency(monthlyIaCost)}</span> IA
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="metric-card flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4 text-[#8FA6BA]">
              <CheckCircle className="w-5 h-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Lucro em {timeframe} Meses</h3>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(accumulatedProfit)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-[#8FA6BA]">
              Cálculo: <span className="text-white">{formatCurrency(monthlyNetSavingsDiluted)}</span> × {timeframe} meses
            </p>
          </div>
        </motion.div>
      </div>

      {/* Diagnostic & Priority */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-8 flex flex-col md:flex-row gap-8 items-center"
      >
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-[#9B8CFF]" />
            <h3 className="text-xl font-bold text-white">Diagnóstico Executivo</h3>
          </div>
          <p className="text-[#C6D7E6] leading-relaxed text-lg">
            {getDiagnosticText()}
          </p>
        </div>
        <div className={`shrink-0 flex flex-col items-center justify-center p-6 rounded-2xl border ${priority.bg} ${priority.border}`}>
          <span className="text-sm font-semibold text-[#8FA6BA] mb-2 uppercase tracking-wider">Score de Oportunidade</span>
          <span className={`text-5xl font-extrabold ${priority.color}`}>{results.priorityScore}</span>
          <span className={`mt-2 font-medium ${priority.color}`}>{priority.text}</span>
        </div>
      </motion.div>

      {/* Impact & Loss Aversion (MOVED UP) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-8 border-l-4 border-l-[#F59E0B]"
        >
          <div className="flex items-center gap-3 mb-4 text-[#F59E0B]">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-xl font-bold text-white">
              {firstName ? `${firstName}, olhe o Custo de não automatizar` : "Custo de não automatizar"}
            </h3>
          </div>
          <p className="text-4xl font-extrabold text-[#F59E0B] mb-4">
            {formatCurrency(costOfInaction12m)}
          </p>
          <p className="text-[#C6D7E6] mb-4">
            É o que essa tarefa vai custar nos próximos 12 meses se nada mudar.
          </p>
          <p className="text-[#8FA6BA] text-sm">
            Cada mês de espera = <span className="text-white font-semibold">{formatCurrency(manualMonthlyCost)}</span> em custo não otimizado.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-8 border-l-4 border-l-[#9B8CFF]"
        >
          <div className="flex items-center gap-3 mb-4 text-[#9B8CFF]">
            <Activity className="w-6 h-6" />
            <h3 className="text-xl font-bold text-white">Impacto Operacional Projetado</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[#8FA6BA]">Horas liberadas / mês</span>
              <span className="text-white font-bold">{formatNumber(hoursSavedPerMonth)}h</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[#8FA6BA]">Horas liberadas em {timeframe} meses</span>
              <span className="text-white font-bold">{formatNumber(hoursSavedPeriod)}h</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[#8FA6BA]">Equivalente em meses de trabalho</span>
              <span className="text-[#9B8CFF] font-bold">{formatNumber(equivalentMonthsFreed)} meses</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8FA6BA]">Retorno sobre investimento (ROI)</span>
              <span className={`font-bold ${currentRoi >= 0 ? 'text-[#22C55E]' : 'text-red-400'}`}>
                {!isNaN(currentRoi) ? `${formatNumber(currentRoi)}%` : "0%"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart Section (MOVED DOWN) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-8"
      >
        <h3 className="text-xl font-bold text-white mb-6">Projeção de Retorno ({timeframe} Meses)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4DC3FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4DC3FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#6E8498" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6E8498" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value / 1000}k`} />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B1728', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#4DC3FF' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area type="monotone" dataKey="lucro" stroke="#4DC3FF" strokeWidth={3} fillOpacity={1} fill="url(#colorLucro)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass-card p-10 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#4DC3FF]/5 to-[#9B8CFF]/5" />
        <div className="relative z-10">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Pronto para transformar esse número em resultado real{firstName ? `, ${firstName}` : ""}?
          </h3>
          <p className="text-[#C6D7E6] mb-8 max-w-2xl mx-auto">
            Com base no seu diagnóstico, podemos desenhar uma automação sob medida — reduzindo custo operacional, acelerando execução e liberando seu time para o que realmente importa.
          </p>
          <a
            href={`https://app.cal.com/nuzzlabs/reuniao-follow-up?name=${encodeURIComponent(userName || "")}&email=${encodeURIComponent(userEmail || "")}&whatsapp=${encodeURIComponent(userWhatsapp || "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-button inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-lg"
          >
            Quero Otimizar esse processo
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
          <p className="text-[#6E8498] text-xs mt-6">
            * Estimativas baseadas nas informações fornecidas. Resultados reais podem variar conforme complexidade do processo.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
