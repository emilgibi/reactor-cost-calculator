export async function exportToPDF(elementId: string, filename: string): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default;
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for PDF export:', elementId);
    return;
  }

  const options = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: 'portrait' as const,
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as const },
  };

  await html2pdf().set(options).from(element).save();
}
