declare module 'html2pdf.js' {
  interface Options {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: object;
    jsPDF?: object;
    pagebreak?: object;
  }

  interface Html2PdfInstance {
    set(options: Options): Html2PdfInstance;
    from(element: HTMLElement): Html2PdfInstance;
    save(): Promise<void>;
  }

  function html2pdf(): Html2PdfInstance;
  export default html2pdf;
}
