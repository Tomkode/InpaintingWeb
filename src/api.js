export async function inpaintImage(file, mask) {
  // Uncomment and use this for real API
  
  const formData = new FormData();
  formData.append('image', file, 'image.png');
  formData.append('x1', mask.x1);
  formData.append('y1', mask.y1);
  formData.append('x2', mask.x2);
  formData.append('y2', mask.y2);
  console.log(formData);
  const res = await fetch('http://localhost:8000/inpaint', {
    method: 'POST',
    body: formData
  });
  console.log(res);
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  const pixelArray = data.image;
  return arrayToImageDataURL(pixelArray);
  
  // Stub: return a placeholder image
}

// Utility: Convert 3D pixel array to PNG data URL
function arrayToImageDataURL(pixelArray) {
  const height = pixelArray.length;
  const width = pixelArray[0].length;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  let i = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelArray[y][x];
      imageData.data[i++] = r;
      imageData.data[i++] = g;
      imageData.data[i++] = b;
      imageData.data[i++] = 255; // alpha
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
} 