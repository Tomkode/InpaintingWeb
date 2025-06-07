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
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = 'inpainted-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    
    // Start timer
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
      // Stop timer and save final time
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
      <p className="subtitle">Advanced Image Restoration for Human Faces</p>
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
            <h3>Inpainted Result</h3>
            <div className="result-info">
              <p className="processing-time">Processing completed in {finalTime} seconds</p>
              <button className="download-btn" onClick={handleDownload}>
                Download Image
              </button>
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