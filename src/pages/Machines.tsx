import { Tractor, Wrench, Fuel, Clock, CheckCircle } from "lucide-react";

export default function Machines() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col items-center mb-10">
        <div className="bg-gradient-to-r from-green-100 via-green-50 to-lime-100 rounded-full p-4 shadow-lg animate-pulse-slow mb-4">
          <Tractor className="w-16 h-16 text-green-700 drop-shadow" />
        </div>
        <h1 className="text-4xl font-extrabold text-green-800 mb-2 text-center drop-shadow">Gestão de Máquinas e Equipamentos</h1>
        <p className="text-lg text-muted-foreground text-center max-w-2xl mb-2">Módulo em produção — em breve você terá o controle total das suas máquinas agrícolas, manutenções e custos operacionais em um só lugar!</p>
      </div>
      <div className="bg-gradient-to-br from-yellow-50 via-white to-green-50 border-l-4 border-yellow-400 p-8 rounded-xl shadow mb-10 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-yellow-800 mb-2 flex items-center gap-2">
          <Clock className="w-7 h-7 text-yellow-500 animate-spin-slow" /> Módulo em produção
        </h2>
        <p className="text-yellow-700 mb-2 text-center">O módulo de Gestão de Máquinas e Equipamentos está em desenvolvimento e será lançado em breve!</p>
        <p className="text-yellow-700 text-center">Veja algumas vantagens que você terá ao utilizar este módulo:</p>
      </div>
      <ul className="list-none max-w-2xl mx-auto text-lg space-y-4 mb-12">
        <li className="flex items-center gap-3 text-green-900 dark:text-green-200 font-semibold"><CheckCircle className="w-6 h-6 text-green-600" /> Controle total de manutenções preventivas e corretivas</li>
        <li className="flex items-center gap-3 text-green-900 dark:text-green-200 font-semibold"><CheckCircle className="w-6 h-6 text-green-600" /> Registro e análise de horas trabalhadas por máquina</li>
        <li className="flex items-center gap-3 text-green-900 dark:text-green-200 font-semibold"><CheckCircle className="w-6 h-6 text-green-600" /> Monitoramento do consumo de combustível por operação</li>
        <li className="flex items-center gap-3 text-green-900 dark:text-green-200 font-semibold"><CheckCircle className="w-6 h-6 text-green-600" /> Alertas automáticos de manutenção e uso excessivo</li>
        <li className="flex items-center gap-3 text-green-900 dark:text-green-200 font-semibold"><CheckCircle className="w-6 h-6 text-green-600" /> Relatórios de custos e eficiência operacional</li>
        <li className="flex items-center gap-3 text-green-900 dark:text-green-200 font-semibold"><CheckCircle className="w-6 h-6 text-green-600" /> Histórico completo de cada equipamento</li>
        <li className="flex items-center gap-3 text-green-900 dark:text-green-200 font-semibold"><CheckCircle className="w-6 h-6 text-green-600" /> Integração futura com sensores e telemetria</li>
      </ul>
      <div className="mt-10 text-center">
        <span className="inline-block bg-gradient-to-r from-green-400 to-lime-400 text-white text-lg font-bold px-8 py-4 rounded-full shadow-lg animate-bounce-slow">
          Fique atento às próximas atualizações!
        </span>
      </div>
      <style>{`
        .animate-pulse-slow { animation: pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite; }
        .animate-spin-slow { animation: spin 2.5s linear infinite; }
        .animate-bounce-slow { animation: bounce 2.5s infinite; }
      `}</style>
    </div>
  );
} 