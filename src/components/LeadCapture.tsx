import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CalculatorData, CalculatorResults } from "../types";
import { Send } from "lucide-react";
import { supabase } from "../lib/supabase";
import { trackEvent } from "../lib/analytics";
import { useTranslation } from "react-i18next";

interface LeadCaptureProps {
  data: CalculatorData;
  results: CalculatorResults;
  onComplete: (id?: string) => void;
}

export function LeadCapture({ data, results, onComplete }: LeadCaptureProps) {
  const { t } = useTranslation();
  useEffect(() => {
    trackEvent("step_02");
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    website: "",
  });

  const handleWhatsappChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 10) {
      value = `${value.slice(0, 10)}-${value.slice(10)}`;
    }
    
    setFormData({ ...formData, whatsapp: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      lead: formData,
      calculatorData: data,
      results: results,
      submittedAt: new Date().toISOString(),
    };

    try {
      // Enviar para o Webhook (Opcional, mantido para redundância)
      fetch("https://webhook.nuzz.com.br/webhook/tools-roi-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch(err => console.error("Webhook error:", err));

      // Salvar no localStorage como fallback
      localStorage.setItem("nuzz_calculator_last_result", JSON.stringify(payload));

      let resultId = "local";

      // Salvar no Supabase se estiver configurado
      if (supabase) {
        const { data: insertedData, error } = await supabase
          .from("tools_roi_ia_diagnostics")
          .insert([
            {
              lead_name: formData.name,
              lead_email: formData.email,
              lead_whatsapp: formData.whatsapp,
              lead_website: formData.website,
              calculator_data: data,
              results: results,
            }
          ])
          .select("id")
          .single();

        if (error) {
          console.error("Erro ao salvar no Supabase:", error);
          setSubmitError(`Erro no banco de dados: ${error.message}`);
          setIsSubmitting(false);
          return; // Para a execução para o usuário ver o erro
        } else if (insertedData) {
          resultId = insertedData.id;
        }
      } else {
        console.warn("Supabase não configurado. Usando fallback local.");
      }

      onComplete(resultId);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setSubmitError(error.message || "Erro inesperado ao salvar os dados.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{t('lead.title')}</h2>
            <p className="text-[#8FA6BA]">
              {t('lead.desc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">{t('lead.name_label')}</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder={t('lead.name_placeholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">{t('lead.email_label')}</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder={t('lead.email_placeholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">{t('lead.whatsapp_label')}</label>
              <input
                type="tel"
                required
                className="input-field"
                placeholder={t('lead.whatsapp_placeholder')}
                value={formData.whatsapp}
                onChange={handleWhatsappChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#C6D7E6] mb-2">
                {t('lead.website_label')} <span className="text-[#6E8498] font-normal">{t('lead.website_optional')}</span>
              </label>
              <input
                type="url"
                className="input-field"
                placeholder={t('lead.website_placeholder')}
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            {submitError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-button w-full flex items-center justify-center gap-2 mt-8"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-[#07111F] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t('lead.cta')}
                </>
              )}
            </button>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
