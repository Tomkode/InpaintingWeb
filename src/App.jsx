import React, { useState, useRef } from 'react';
import ImageUploader from './ImageUploader.jsx';
import MaskCanvas from './MaskCanvas.jsx';
import { inpaintImage } from './api.js';
import './styles.css';

function App() {
  const [image, setImage] = useState(null); // { src, file }
  const [mask, setMask] = useState(null); // { x1, y1, x2, y2 }
  const [rect, setRect] = useState(null); // { x1, y1, x2, y2 }
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('png');
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const convertImageFormat = async (imageUrl, format) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const mimeType = `image/${format}`;
        const quality = format === 'jpeg' ? 0.9 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.src = imageUrl;
    });
  };

  const handleDownload = async (format = 'png') => {
    if (!result) return;
    
    try {
      const convertedImage = await convertImageFormat(result, format);
      const link = document.createElement('a');
      link.href = convertedImage;
      link.download = `inpainted-image.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleImageUpload = (imgObj) => {
    setImage(imgObj);
    setMask(null);
    setRect(null);
    setResult(null);
    setError('');
    setElapsedTime(0);
    setFinalTime(null);
  };

  const handleMaskChange = (maskCoords) => {
    setMask(maskCoords);
  };

  const handleClearMask = () => {
    setMask(null);
    setRect(null);
  };

  const handleSubmit = async () => {
    if (!image || !mask) {
      setError('Please upload an image and select a mask.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setElapsedTime(0);
    setFinalTime(null);
    
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    try {
      const resImg = await inpaintImage(image.file, mask);
      setResult(resImg);
    } catch (e) {
      setError('Failed to inpaint image.');
    } finally {
      setLoading(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        const totalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setFinalTime(totalTime);
      }
    }
  };

  return (
    <div className="container">
      <h1>AI Face Inpainting Tool</h1>
      <p className="subtitle">Advanced Image Restoration for Human Faces using Diffusion Models</p>
      <p className="desc">Upload a face image and select the area you want to restore. Our AI model will intelligently fill in the masked region with realistic facial features.</p>
      <div className="card">
        <h2>Image Inpainting Interface</h2>
        <ImageUploader onImageUpload={handleImageUpload} />
        {image && (
          <MaskCanvas
            imageSrc={image.src}
            onMaskChange={handleMaskChange}
            rect={rect}
            setRect={setRect}
          />
        )}
        <div className="button-group">
          <button
            className="clear-btn"
            onClick={handleClearMask}
            disabled={!mask}
          >
            Clear Mask
          </button>
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!image || !mask || loading}
          >
            {loading ? `Processing... (${elapsedTime}s)` : 'Submit for Inpainting'}
          </button>
        </div>
        {loading && (
          <div className="disclaimer">
            <p>⏳ This may take a few minutes. Please be patient while our AI model processes your image.</p>
          </div>
        )}
        {error && <div className="error">{error}</div>}
        {result && (
          <div className="result-section">
            <div className="result-info">
              <p className="processing-time">Processing completed in {finalTime} seconds</p>
              <div className="download-controls">
                <div className="format-select-wrapper">
                  <select 
                    className="format-select"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WebP</option>
                  </select>
                  <div className="format-select-arrow">▼</div>
                </div>
                <button className="download-btn" onClick={() => handleDownload(selectedFormat)}>
                  Download Image
                </button>
              </div>
            </div>
            <img src={result} alt="Inpainted result" className="result-img" />
          </div>
        )}
      </div>
      <footer>
        <p>Bachelor Thesis Project - Image Inpainting using Postconditioned Diffusion Models</p>
        <p>Images displayed at 512×512 pixels for easier mask selection</p>
      </footer>
    </div>
  );
}

export default App; 