import { useState, useEffect } from "react";
import { Hero } from "../components/Hero";
import { Calculator } from "../components/Calculator";
import { LeadCapture } from "../components/LeadCapture";
import { CalculatorData, CalculatorResults, AppStep } from "../types";
import { calculateROI } from "../lib/calculator";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "../components/Logo";
import { useNavigate } from "react-router-dom";

export function Home() {
  const [step, setStep] = useState<AppStep>("hero");
  const [data, setData] = useState<CalculatorData | null>(null);
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const navigate = useNavigate();

  const handleStart = () => {
    setStep("calculator");
  };

  const handleCalculatorComplete = (calculatorData: CalculatorData) => {
    const calculatedResults = calculateROI(calculatorData);
    setData(calculatorData);
    setResults(calculatedResults);
    setStep("leadcapture");
  };

  const handleLeadCaptureComplete = (id?: string) => {
    if (id) {
      navigate(`/resultado/${id}`);
    } else {
      // Fallback se não salvou no supabase
      setStep("results");
    }
  };

  return (
    <div className="min-h-screen bg-[#07111F] text-[#F5FAFF] font-sans selection:bg-[#00E676]/30 selection:text-white">
      {/* Header */}
      <header className="w-full py-6 px-8 flex items-center justify-between border-b border-white/5 bg-[#07111F]/80 backdrop-blur-md sticky top-0 z-50">
        <a 
          href="https://nuzzlabs.com.br/?utm_campaign=roi-calculator&utm_medium=landing-page&utm_source=tools"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <Logo className="h-8 w-auto text-white" />
        </a>
        {step !== "hero" && (
          <button
            onClick={() => {
              setStep("hero");
              setData(null);
              setResults(null);
            }}
            className="text-sm font-medium text-[#8FA6BA] hover:text-white transition-colors"
          >
            Reiniciar
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {step === "hero" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <Hero onStart={handleStart} />
            </motion.div>
          )}

          {step === "calculator" && (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <Calculator onComplete={handleCalculatorComplete} />
            </motion.div>
          )}

          {step === "leadcapture" && data && results && (
            <motion.div
              key="leadcapture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <LeadCapture data={data} results={results} onComplete={handleLeadCaptureComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
