import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Results } from "../components/Results";
import { CalculatorData, CalculatorResults } from "../types";
import { supabase } from "../lib/supabase";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Logo } from "../components/Logo";
import { LanguageSelector } from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";

export function SharedResult() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [data, setData] = useState<CalculatorData | null>(null);
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userWhatsapp, setUserWhatsapp] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        if (id === "local") {
          const saved = localStorage.getItem("nuzz_calculator_last_result");
          if (saved) {
            const parsed = JSON.parse(saved);
            setData(parsed.calculatorData);
            setResults(parsed.results);
            setUserName(parsed.lead?.name || "");
            setUserEmail(parsed.lead?.email || "");
            setUserWhatsapp(parsed.lead?.whatsapp || "");
          } else {
            setError("Resultado não encontrado localmente.");
          }
          setLoading(false);
          return;
        }

        if (!supabase) {
          setError("Supabase não configurado. Por favor, adicione as chaves no arquivo .env");
          setLoading(false);
          return;
        }

        const { data: record, error: dbError } = await supabase
          .from("tools_roi_ia_diagnostics")
          .select("*")
          .eq("id", id)
          .single();

        if (dbError) throw dbError;

        if (record) {
          setData(record.calculator_data);
          setResults(record.results);
          setUserName(record.lead_name || "");
          setUserEmail(record.lead_email || "");
          setUserWhatsapp(record.lead_whatsapp || "");
        } else {
          setError("Diagnóstico não encontrado.");
        }
      } catch (err) {
        console.error("Error fetching result:", err);
        setError("Não foi possível carregar o diagnóstico.");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [id]);

  const handleFinalAction = () => {
    alert("Um de nossos especialistas entrará em contato em breve pelo WhatsApp fornecido!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07111F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00E676] animate-spin" />
      </div>
    );
  }

  if (error || !data || !results) {
    return (
      <div className="min-h-screen bg-[#07111F] text-[#F5FAFF] font-sans flex flex-col items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Ops!</h2>
          <p className="text-[#8FA6BA] mb-8">{error || "Algo deu errado."}</p>
          <Link to="/" className="primary-button inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Fazer novo diagnóstico
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111F] text-[#F5FAFF] font-sans selection:bg-[#00E676]/30 selection:text-white">
      {/* Header */}
      <header className="w-full py-6 px-8 flex items-center justify-between border-b border-white/5 bg-[#07111F]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <a 
            href="https://nuzzlabs.com.br/?utm_campaign=roi-calculator&utm_medium=landing-page&utm_source=tools"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Logo className="h-8 w-auto text-white" />
          </a>
          <Link
            to="/"
            className="text-sm font-medium text-[#8FA6BA] hover:text-white transition-colors"
          >
            {t('shared.new_diagnostic')}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative py-12">
        <div className="w-full">
          <Results 
            data={data} 
            results={results} 
            userName={userName} 
            userEmail={userEmail}
            userWhatsapp={userWhatsapp}
            onAction={handleFinalAction} 
          />
        </div>
      </main>
    </div>
  );
}
