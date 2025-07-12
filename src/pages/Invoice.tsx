
import InvoiceForm from '@/components/InvoiceForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Clock, CheckCircle } from 'lucide-react';

const Invoice = () => {
  return (
    <div className="container mx-auto py-8 px-2 sm:px-4">
      <div className="mb-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
            <div>
              <span className="font-semibold text-yellow-900">Solicite a funcionalidade de emissão para um vendedor.</span>
              <br />
              <span className="text-yellow-800 text-sm">Emissão de até <b>250 notas por mês</b> a partir de <b>R$ 200/mês</b>.</span>
            </div>
            <a
              href="https://wa.me/5551999135237?text=Olá!%20Tenho%20interesse%20na%20emissão%20de%20notas%20fiscais%20para%20vendedor%20no%20AgroAjuda.%20Gostaria%20de%20saber%20mais.%20"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 md:mt-0 px-5 py-2 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition"
            >
              Solicitar para um vendedor
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold">Geração de Nota Fiscal</h1>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Rocket className="mr-1 h-3 w-3" />
            Em Produção
          </Badge>
        </div>
        
      </div>
      
      <div className="max-w-2xl mx-auto mt-8">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-2 text-gray-800 flex items-center gap-2">
            <span>Exemplo de Emissão de Nota Fiscal</span>
            <span className="text-xs px-2 py-1 rounded bg-yellow-200 text-yellow-900 font-semibold">Em breve</span>
          </h2>
          <p className="text-gray-600 mb-4 text-sm">Veja como será a experiência de emissão de DANFE pelo AgroAjuda. Em breve você poderá emitir suas notas fiscais eletrônicas diretamente pela plataforma!</p>
          <form className="space-y-4 opacity-70 pointer-events-none select-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Número *</label>
                <input className="w-full rounded border px-2 py-1 bg-gray-100" disabled value="000001" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Série *</label>
                <input className="w-full rounded border px-2 py-1 bg-gray-100" disabled value="001" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Data de Emissão *</label>
                <input className="w-full rounded border px-2 py-1 bg-gray-100" disabled value="2024-07-01" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cliente</label>
                <input className="w-full rounded border px-2 py-1 bg-gray-100" disabled value="João da Silva" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">CPF/CNPJ</label>
                <input className="w-full rounded border px-2 py-1 bg-gray-100" disabled value="123.456.789-00" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Endereço</label>
                <input className="w-full rounded border px-2 py-1 bg-gray-100" disabled value="Rua Exemplo, 123" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cidade</label>
                <input className="w-full rounded border px-2 py-1 bg-gray-100" disabled value="Porto Alegre" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Produto</label>
                <input className="w-full rounded border px-2 py-1 bg-gray-100" disabled value="Saco de Soja" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Valor Total</label>
                <input className="w-full rounded border px-2 py-1 bg-gray-100" disabled value="R$ 2.500,00" />
              </div>
            </div>
            <button type="button" className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold mt-4 opacity-60 cursor-not-allowed" disabled>
              Emitir Nota Fiscal (em breve)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Invoice;

