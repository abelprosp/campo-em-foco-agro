
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface InvoiceData {
  numero: string;
  serie: string;
  dataEmissao: Date;
  cliente: {
    nome: string;
    cpfCnpj: string;
    endereco: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  emitente: {
    nome: string;
    cnpj: string;
    endereco: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  itens: Array<{
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
  valorTotal: number;
  tributos: {
    icms: number;
    ipi: number;
    pis: number;
    cofins: number;
  };
}

export const useInvoices = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDANFE = async (invoiceData: InvoiceData) => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      
      // Cabeçalho
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DANFE - Documento Auxiliar da Nota Fiscal Eletrônica', pageWidth / 2, 20, { align: 'center' });
      
      // Dados do emitente
      pdf.setFontSize(12);
      pdf.text('EMITENTE', 20, 40);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${invoiceData.emitente.nome}`, 20, 50);
      pdf.text(`CNPJ: ${invoiceData.emitente.cnpj}`, 20, 60);
      pdf.text(`${invoiceData.emitente.endereco}`, 20, 70);
      pdf.text(`${invoiceData.emitente.cidade} - ${invoiceData.emitente.uf} - CEP: ${invoiceData.emitente.cep}`, 20, 80);
      
      // Dados da nota
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DADOS DA NOTA FISCAL', 120, 40);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Número: ${invoiceData.numero}`, 120, 50);
      pdf.text(`Série: ${invoiceData.serie}`, 120, 60);
      pdf.text(`Data de Emissão: ${format(invoiceData.dataEmissao, 'dd/MM/yyyy')}`, 120, 70);
      
      // Destinatário
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DESTINATÁRIO', 20, 100);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${invoiceData.cliente.nome}`, 20, 110);
      pdf.text(`CPF/CNPJ: ${invoiceData.cliente.cpfCnpj}`, 20, 120);
      pdf.text(`${invoiceData.cliente.endereco}`, 20, 130);
      pdf.text(`${invoiceData.cliente.cidade} - ${invoiceData.cliente.uf} - CEP: ${invoiceData.cliente.cep}`, 20, 140);
      
      // Tabela de itens
      let yPosition = 160;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PRODUTOS/SERVIÇOS', 20, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(10);
      pdf.text('Descrição', 20, yPosition);
      pdf.text('Qtd', 120, yPosition);
      pdf.text('Valor Unit.', 140, yPosition);
      pdf.text('Valor Total', 170, yPosition);
      
      pdf.line(20, yPosition + 2, 190, yPosition + 2);
      
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
      
      invoiceData.itens.forEach((item) => {
        pdf.text(item.descricao, 20, yPosition);
        pdf.text(item.quantidade.toString(), 120, yPosition);
        pdf.text(`R$ ${item.valorUnitario.toFixed(2)}`, 140, yPosition);
        pdf.text(`R$ ${item.valorTotal.toFixed(2)}`, 170, yPosition);
        yPosition += 10;
      });
      
      // Totais
      yPosition += 10;
      pdf.line(20, yPosition, 190, yPosition);
      yPosition += 15;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`VALOR TOTAL DA NOTA: R$ ${invoiceData.valorTotal.toFixed(2)}`, 20, yPosition);
      
      // Tributos
      yPosition += 20;
      pdf.setFontSize(10);
      pdf.text('TRIBUTOS INCIDENTES', 20, yPosition);
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`ICMS: R$ ${invoiceData.tributos.icms.toFixed(2)}`, 20, yPosition);
      pdf.text(`IPI: R$ ${invoiceData.tributos.ipi.toFixed(2)}`, 60, yPosition);
      pdf.text(`PIS: R$ ${invoiceData.tributos.pis.toFixed(2)}`, 100, yPosition);
      pdf.text(`COFINS: R$ ${invoiceData.tributos.cofins.toFixed(2)}`, 140, yPosition);
      
      // Salvar PDF
      const fileName = `DANFE_${invoiceData.numero}_${invoiceData.serie}.pdf`;
      pdf.save(fileName);
      
      toast.success('DANFE gerada com sucesso!', {
        description: `Arquivo ${fileName} foi baixado.`
      });
      
    } catch (error) {
      toast.error('Erro ao gerar DANFE', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateDANFE,
    isGenerating
  };
};
