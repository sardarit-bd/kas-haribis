export async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  if (w.pdfjsLib) {
    w.pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js';
    return w.pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pdfjs]');
    if (existing) {
      if (w.pdfjsLib) {
        w.pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js';
        resolve(w.pdfjsLib);
      } else {
        existing.addEventListener('load', () => {
          if (w.pdfjsLib) {
            w.pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js';
            resolve(w.pdfjsLib);
          } else {
            reject(new Error('PDF.js library could not be loaded'));
          }
        });
        existing.addEventListener('error', reject);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = '/vendor/pdfjs/pdf.min.js';
    script.async = true;
    script.dataset.pdfjs = 'true';
    script.onload = () => {
      const lib = w.pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js';
        resolve(lib);
      } else {
        reject(new Error('PDF.js library could not be loaded'));
      }
    };
    script.onerror = () =>
      reject(new Error('Failed to load PDF.js from /vendor/pdfjs/pdf.min.js'));
    document.head.appendChild(script);
  });
}

export async function renderPdfFirstPage(
  fileOrBlob: File | Blob,
): Promise<Blob | null> {
  try {
    const pdfjs = await loadPdfJs();
    if (!pdfjs) return null;
    const arrayBuffer = await fileOrBlob.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(1);

    const unscaledViewport = page.getViewport({ scale: 1 });
    const targetWidth = 696;
    const scale = targetWidth / unscaledViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    const context = canvas.getContext('2d');
    if (!context) return null;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
    });
  } catch (e) {
    console.error('Error generating PDF cover:', e);
    return null;
  }
}

export async function renderPdfFirstPageFromUrl(
  url: string,
): Promise<Blob | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return renderPdfFirstPage(blob);
  } catch (e) {
    console.error('Error rendering PDF cover from url:', e);
    return null;
  }
}
