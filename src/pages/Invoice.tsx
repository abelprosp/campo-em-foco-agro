
import InvoiceForm from '@/components/InvoiceForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Clock, CheckCircle } from 'lucide-react';

const Invoice = () => {
  return (
    <div className="container mx-auto py-8 px-2 sm:px-4">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold">Geração de Nota Fiscal</h1>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Rocket className="mr-1 h-3 w-3" />
            Em Produção
          </Badge>
        </div>
        
        <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              Funcionalidade Pronta para Lançamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-green-800 dark:text-green-200 font-medium mb-1">
                  Lançamento em Breve
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Nossa funcionalidade de geração de DANFE está finalizada e testada. 
                  Em breve estará disponível para todos os usuários com geração automática 
                  de notas fiscais eletrônicas completas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <InvoiceForm />
    </div>
  );
};

export default Invoice;
