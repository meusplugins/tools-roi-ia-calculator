import { motion } from "motion/react";
import { CalculatorData, CalculatorResults } from "../types";
import { useState, useEffect, useMemo } from "react";
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
import { trackEvent } from "../lib/analytics";
import { useTranslation, Trans } from "react-i18next";

interface ResultsProps {
  data: CalculatorData;
  results: CalculatorResults;
  userName?: string;
  userEmail?: string;
  userWhatsapp?: string;
  onAction?: () => void;
}

export function Results({ data, results, userName, userEmail, userWhatsapp, onAction }: ResultsProps) {
  const { t, i18n } = useTranslation();
  
  useEffect(() => {
    trackEvent("step_03");
  }, []);

  const [copied, setCopied] = useState(false);
  const [timeframe, setTimeframe] = useState<6 | 12>(12);

  const firstName = userName ? userName.split(" ")[0] : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const localeInfo = useMemo(() => {
    const lang = i18n.language;
    if (lang.startsWith('pt-BR')) return { locale: 'pt-BR', currency: 'BRL' };
    if (lang.startsWith('pt-PT')) return { locale: 'pt-PT', currency: 'EUR' };
    if (lang.startsWith('es')) return { locale: 'es-ES', currency: 'EUR' };
    if (lang.startsWith('it')) return { locale: 'it-IT', currency: 'EUR' };
    return { locale: 'en-US', currency: 'USD' };
  }, [i18n.language]);

  const currencyFormatter = useMemo(() => 
    new Intl.NumberFormat(localeInfo.locale, { style: "currency", currency: localeInfo.currency }),
  [localeInfo]);

  const numberFormatter = useMemo(() => 
    new Intl.NumberFormat(localeInfo.locale, { maximumFractionDigits: 1 }),
  [localeInfo]);

  const formatCurrency = (value: number) => currencyFormatter.format(value);
  const formatNumber = (value: number) => numberFormatter.format(value);

  const getDiagnosticText = () => {
    if (results.paybackMonths <= 0) {
      return t('results.diagnostic_texts.no_return');
    }
    if (results.paybackMonths <= 3) {
      return t('results.diagnostic_texts.fast_return');
    }
    if (results.paybackMonths <= 6) {
      return t('results.diagnostic_texts.good_return');
    }
    if (results.paybackMonths <= 12) {
      return t('results.diagnostic_texts.exists_return');
    }
    return t('results.diagnostic_texts.scale_return');
  };

  const getPriorityLabel = () => {
    if (results.priorityScore >= 80) return { text: t('results.priority_labels.high'), color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" };
    if (results.priorityScore >= 50) return { text: t('results.priority_labels.good'), color: "text-[#4DC3FF]", bg: "bg-[#4DC3FF]/10", border: "border-[#4DC3FF]/20" };
    return { text: t('results.priority_labels.moderate'), color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/20" };
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
  
  const costOfInaction12m = manualMonthlyCost * 12;
  const hoursSavedPerMonth = Number(results.hoursSavedPerMonth) || 0;
  const hoursSavedPeriod = hoursSavedPerMonth * timeframe;
  const equivalentMonthsFreed = hoursSavedPeriod / 160;

  // Generate chart data
  const chartData = Array.from({ length: timeframe }, (_, i) => {
    const month = i + 1;
    const profit = monthlyNetSavingsDiluted * month;
    return {
      name: `${month}`,
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
          title={t('results.copy_link')}
        >
          {copied ? <Check className="w-4 h-4 text-[#00E676]" /> : <LinkIcon className="w-4 h-4" />}
          {copied ? t('results.link_copied') : t('results.copy_link')}
        </button>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight pt-12 md:pt-0">
          <Trans i18nKey="results.headline" values={{ amount: formatCurrency(costOfInaction12m) }}>
            Você está deixando <span className="text-[#F59E0B]">{'{{amount}}'}</span> na mesa em 12 meses
          </Trans>
          {firstName ? `, ${firstName}` : ""}.
        </h2>
        <p className="text-lg text-[#8FA6BA] max-w-2xl mx-auto">
          <Trans i18nKey="results.subheadline" values={{ taskName: data.taskName, amount: formatCurrency(manualMonthlyCost) }}>
            O processo <span className="text-white font-semibold">"{'{{taskName}}'}"</span> consome{" "}
            <span className="text-[#4DC3FF] font-semibold">{'{{amount}}'}/mês</span> da sua operação em execução manual.
          </Trans>
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
            {t('results.view_6m')}
          </button>
          <button
            onClick={() => setTimeframe(12)}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${timeframe === 12 ? 'bg-[#4DC3FF] text-[#07111F]' : 'text-[#8FA6BA] hover:text-white'}`}
          >
            {t('results.view_12m')}
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
              <h3 className="font-semibold text-sm uppercase tracking-wider">{t('results.current_cost')}</h3>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(manualMonthlyCost)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-[#8FA6BA]">
              <Trans i18nKey="results.cost_calc" values={{ hours: formatNumber(results.monthlyHours), rate: formatCurrency(results.hourlyRateCalculated) }}>
                Cálculo: <span className="text-white">{'{{hours}}'}h/mês</span> × <span className="text-white">{'{{rate}}'}/h</span>
              </Trans>
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
              <h3 className="font-semibold text-sm uppercase tracking-wider">{t('results.ia_cost')}</h3>
            </div>
            <p className="text-3xl font-bold text-[#F59E0B]">{formatCurrency(monthlyIaCost)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-[#8FA6BA]">
              <Trans i18nKey="results.ia_calc" values={{ value: formatCurrency(effectiveProjectValue), months: timeframe, api: formatCurrency(apiCost) }}>
                Cálculo: (<span className="text-white">{'{{value}}'}</span> ÷ {'{{months}}'}m) + <span className="text-white">{'{{api}}'}</span> API
              </Trans>
            </p>
            {results.isDefaultProjectValue && (
              <p className="text-[10px] text-[#F59E0B] mt-2 bg-[#F59E0B]/10 p-2 rounded-md border border-[#F59E0B]/20">
                {t('results.ia_default_hint')}
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
              <h3 className="font-semibold text-sm uppercase tracking-wider">{t('results.savings')}</h3>
            </div>
            <p className="text-4xl font-extrabold text-[#4DC3FF]">{formatCurrency(monthlyNetSavingsDiluted)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#4DC3FF]/20">
            <p className="text-xs text-[#8FA6BA]">
              <Trans i18nKey="results.savings_calc" values={{ cost: formatCurrency(manualMonthlyCost), percentage: automationPercentage, ia: formatCurrency(monthlyIaCost) }}>
                Cálculo: (<span className="text-white">{'{{cost}}'}</span> × {'{{percentage}}'}%) - <span className="text-white">{'{{ia}}'}</span> IA
              </Trans>
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
              <h3 className="font-semibold text-sm uppercase tracking-wider">{t('results.profit', { months: timeframe })}</h3>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(accumulatedProfit)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-[#8FA6BA]">
              <Trans i18nKey="results.profit_calc" values={{ savings: formatCurrency(monthlyNetSavingsDiluted), months: timeframe }}>
                Cálculo: <span className="text-white">{'{{savings}}'}</span> × {'{{months}}'} meses
              </Trans>
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
            <h3 className="text-xl font-bold text-white">{t('results.diagnostic_title')}</h3>
          </div>
          <p className="text-[#C6D7E6] leading-relaxed text-lg">
            {getDiagnosticText()}
          </p>
        </div>
        <div className={`shrink-0 flex flex-col items-center justify-center p-6 rounded-2xl border ${priority.bg} ${priority.border}`}>
          <span className="text-sm font-semibold text-[#8FA6BA] mb-2 uppercase tracking-wider">{t('results.opportunity_score')}</span>
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
              {firstName ? `${firstName}, ${t('results.inaction_title')}` : t('results.inaction_title')}
            </h3>
          </div>
          <p className="text-4xl font-extrabold text-[#F59E0B] mb-4">
            {formatCurrency(costOfInaction12m)}
          </p>
          <p className="text-[#C6D7E6] mb-4">
            {t('results.inaction_desc')}
          </p>
          <p className="text-[#8FA6BA] text-sm">
            <Trans i18nKey="results.inaction_hint" values={{ amount: formatCurrency(manualMonthlyCost) }}>
              Cada mês de espera = <span className="text-white font-semibold">{'{{amount}}'}</span> em custo não otimizado.
            </Trans>
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
            <h3 className="text-xl font-bold text-white">{t('results.impact_title')}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[#8FA6BA]">{t('results.freed_hours_month')}</span>
              <span className="text-white font-bold">{formatNumber(hoursSavedPerMonth)}h</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[#8FA6BA]">{t('results.freed_hours_period', { months: timeframe })}</span>
              <span className="text-white font-bold">{formatNumber(hoursSavedPeriod)}h</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[#8FA6BA]">{t('results.equivalent_months')}</span>
              <span className="text-[#9B8CFF] font-bold">{formatNumber(equivalentMonthsFreed)} {t('calculator.unit_hours').toLowerCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8FA6BA]">{t('results.roi_label')}</span>
              <span className={`font-bold ${results.priorityScore >= 50 ? 'text-[#22C55E]' : 'text-red-400'}`}>
                {results.priorityScore}%
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
        <h3 className="text-xl font-bold text-white mb-6">{t('results.chart_title', { months: timeframe })}</h3>
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
              <YAxis stroke="#6E8498" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${localeInfo.currency === 'BRL' ? 'R$' : localeInfo.currency === 'USD' ? '$' : '€'} ${value / 1000}k`} />
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
            {t('results.cta_title', { name: firstName })}
          </h3>
          <p className="text-[#C6D7E6] mb-8 max-w-2xl mx-auto">
            {t('results.cta_desc')}
          </p>
          <a
            href={`https://app.cal.com/nuzzlabs/reuniao-follow-up?name=${encodeURIComponent(userName || "")}&email=${encodeURIComponent(userEmail || "")}&whatsapp=${encodeURIComponent(userWhatsapp || "")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("click_call_button")}
            className="primary-button inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-lg"
          >
            {t('results.cta_button')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
          <p className="text-[#6E8498] text-xs mt-6">
            {t('results.disclaimer')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
