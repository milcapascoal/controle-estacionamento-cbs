
/**
 * Converte um array de objetos em uma string CSV e inicia o download.
 * @param data O array de objetos para exportar.
 * @param filename O nome do arquivo a ser salvo (ex: 'relatorio.csv').
 */
export const exportToCsv = (data: any[], filename: string): void => {
  if (data.length === 0) {
    alert('Não há dados para exportar.');
    return;
  }

  const headers = Object.keys(data[0]);
  
  // Função para garantir que os valores com vírgulas sejam encapsulados em aspas
  const escapeCsvValue = (value: any): string => {
    const stringValue = String(value ?? ''); // Trata nulos e undefined como string vazia
    if (stringValue.includes(',')) {
      return `"${stringValue.replace(/"/g, '""')}"`; // Escapa aspas duplas dentro do valor
    }
    return stringValue;
  };
  
  const csvRows = [
    headers.join(','), // Cabeçalho
    ...data.map(row => 
      headers.map(header => escapeCsvValue(row[header])).join(',')
    )
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // \uFEFF para garantir compatibilidade com Excel

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
