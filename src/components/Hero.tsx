import { motion } from "motion/react";
import { ArrowRight, Calculator, BarChart3, TrendingUp, Clock } from "lucide-react";
import { useEffect } from "react";
import { trackEvent } from "../lib/analytics";

interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
  useEffect(() => {
    trackEvent("start");
  }, []);

  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Glows - Subtle and professional */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-[#4DC3FF] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-4xl mx-auto flex flex-col items-center mt-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
          <BarChart3 className="w-4 h-4 text-[#4DC3FF]" />
          <span className="text-sm font-medium text-[#C6D7E6]">Calculadora de ROI & Eficiência</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
          Descubra quanto sua empresa poderia economizar{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4DC3FF] to-[#7CE7FF]">
            automatizando tarefas manuais
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#8FA6BA] mb-4 max-w-2xl leading-relaxed">
          Calcule em menos de 3 minutos quanto uma automação com IA poderia economizar na sua operação.
        </p>

        <p className="text-sm font-medium text-[#6E8498] mb-12 max-w-2xl">
          Mais de 200 empresas já usaram esta calculadora para identificar oportunidades de automação.
        </p>

        {/* Analytical Dashboard-like Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-3xl">
          <div className="glass-card p-6 flex flex-col items-start text-left border-l-4 border-l-[#4DC3FF]">
            <span className="text-3xl font-bold text-white mb-1 font-heading">3 min</span>
            <span className="text-sm text-[#8FA6BA]">Tempo médio do diagnóstico</span>
          </div>
          
          <div className="glass-card p-6 flex flex-col items-start text-left border-l-4 border-l-[#00E676]">
            <span className="text-3xl font-bold text-white mb-1 font-heading">100%</span>
            <span className="text-sm text-[#8FA6BA]">Baseado nos seus dados reais</span>
          </div>
          
          <div className="glass-card p-6 flex flex-col items-start text-left border-l-4 border-l-[#F59E0B]">
            <span className="text-3xl font-bold text-white mb-1 font-heading">ROI</span>
            <span className="text-sm text-[#8FA6BA]">Cálculo de payback em meses</span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="primary-button flex items-center gap-2 text-lg px-8 py-4 mb-[50px]"
        >
          <Calculator className="w-5 h-5" />
          Iniciar Diagnóstico Gratuito
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
      </motion.div>

      {/* Decorative Grid - More subtle, technical feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,transparent_10%,#000_50%,transparent_90%)] pointer-events-none" />
    </section>
  );
}
