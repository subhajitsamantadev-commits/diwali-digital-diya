/**
 * Rasterise a DOM element to a PNG download using SVG foreignObject.
 * Works fully client-side; no external service.
 */
export async function downloadElementAsImage(element: HTMLElement, filename: string): Promise<void> {
  const { width, height } = element.getBoundingClientRect();
  // clone with inlined styles via XMLSerializer
  const clone = element.cloneNode(true) as HTMLElement;
  const xml = new XMLSerializer().serializeToString(clone);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <foreignObject width="100%" height="100%">${xml}</foreignObject>
  </svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.width = width;
  img.height = height;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Image render failed'));
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);

  URL.revokeObjectURL(url);

  canvas.toBlob((pngBlob) => {
    if (!pngBlob) return;
    const dl = URL.createObjectURL(pngBlob);
    const a = document.createElement('a');
    a.href = dl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(dl);
  }, 'image/png');
}
