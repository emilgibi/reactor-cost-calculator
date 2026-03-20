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

/**
 * Export a unified PDF from a hidden container element.
 * The element should contain all 5 report sections with proper section headers.
 * The element is temporarily made visible during export.
 */
export async function exportUnifiedPDF(elementId: string, filename: string): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default;
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for unified PDF export:', elementId);
    return;
  }

  // Temporarily bring element into normal document flow for accurate rendering
  const prevCssText = element.style.cssText;
  element.style.cssText = 'position: static; left: 0; visibility: visible;';

  const options = {
    margin: [15, 15, 15, 15] as [number, number, number, number],
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
    pagebreak: { mode: ['css', 'legacy'] as const },
  };

  try {
    await html2pdf().set(options).from(element).save();
  } finally {
    // Restore original hidden state
    element.style.cssText = prevCssText;
  }
}
