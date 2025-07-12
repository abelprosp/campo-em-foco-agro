import { Badge } from "@/components/ui/badge";
import { MessageCircle, Crown, ArrowRight, Clock, X } from "lucide-react";

interface TrialExpiredScreenProps {
  onUpgrade: () => void;
  onContactExpert: () => void;
  onClose: () => void;
}

export default function TrialExpiredScreen({ onUpgrade, onContactExpert, onClose }: TrialExpiredScreenProps) {
  const whatsappLink = "https://wa.me/5551999135237?text=Olá!%20Gostaria%20de%20fazer%20upgrade%20para%20o%20plano%20Pro%20do%20AgroAjuda.%20Pode%20me%20ajudar?";

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Topo bonito */}
      <div className="w-full flex items-center justify-between bg-gray-100 rounded-t-xl px-6 py-3 mb-2" style={{ minHeight: 64 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80">
            <Clock className="w-6 h-6" style={{ color: 'rgb(27, 75, 71)' }} />
          </div>
          <Badge variant="outline" className="text-xs font-medium text-black">Trial Expirado</Badge>
        </div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-xl sm:text-2xl font-bold" style={{ color: 'rgb(27, 75, 71)' }}>
            R$ 27,90/mês
          </span>
          <span className="text-gray-500 text-xs">Cancele quando quiser</span>
        </div>
        <button
          className="ml-4 rounded-full p-1 hover:bg-gray-200 transition flex items-center justify-center"
          aria-label="Sair da plataforma"
          onClick={onClose}
          style={{ lineHeight: 0 }}
        >
          <X className="w-5 h-5 text-gray-400 hover:text-gray-700" />
        </button>
      </div>
      {/* Conteúdo principal */}
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2 px-2">
        <div className="flex flex-col items-center md:items-start flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center md:text-left mb-1">
            Seu período de teste gratuito expirou
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center md:text-left">
            Para continuar aproveitando todos os recursos do AgroAjuda e transformar sua gestão agrícola, faça o upgrade para o plano Pro.
          </p>
        </div>
        <div className="flex flex-col items-center flex-shrink-0 gap-2 min-w-[220px] mt-2 md:mt-0">
          <button 
            className="w-full py-3 text-base font-semibold rounded-lg text-white hover:opacity-90" 
            style={{ backgroundColor: 'rgb(27, 75, 71)' }}
            onClick={onUpgrade}
          >
            Fazer Upgrade para Pro
            <ArrowRight className="ml-2 w-5 h-5 inline" />
          </button>
          <button 
            className="w-full py-3 text-base font-semibold rounded-lg border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-100 flex items-center justify-center"
            onClick={onContactExpert}
          >
            <MessageCircle className="mr-2 w-5 h-5" />
            Falar com Especialista
          </button>
        </div>
      </div>
      {/* Benefícios do Plano Pro */}
      <div className="bg-gray-50 rounded-xl p-3 sm:p-4 my-2 w-full">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-base mb-2">
          <Crown className="w-4 h-4" style={{ color: 'rgb(27, 75, 71)' }} />
          Benefícios do Plano Pro
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(27, 75, 71)' }}></div>
            <span>Controle Financeiro Avançado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(27, 75, 71)' }}></div>
            <span>Análise de Produção Completa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(27, 75, 71)' }}></div>
            <span>Gestão de Talhões com Mapeamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(27, 75, 71)' }}></div>
            <span>Relatórios Inteligentes com IA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(27, 75, 71)' }}></div>
            <span>Análise de Riscos Climáticos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(27, 75, 71)' }}></div>
            <span>Previsão do Tempo Integrada</span>
          </div>
        </div>
      </div>
      {/* Link direto do WhatsApp */}
      <div className="pt-1 w-full text-right px-2">
        <a 
          href={whatsappLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Ou clique aqui para falar diretamente pelo WhatsApp
        </a>
      </div>
    </div>
  );
} 