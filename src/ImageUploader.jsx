import React, { useRef } from 'react';

function ImageUploader({ onImageUpload }) {
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        // Create two canvases: one for display (512x512) and one for API (256x256)
        const displayCanvas = document.createElement('canvas');
        displayCanvas.width = 512;
        displayCanvas.height = 512;
        const displayCtx = displayCanvas.getContext('2d');
        displayCtx.drawImage(img, 0, 0, 512, 512);

        const apiCanvas = document.createElement('canvas');
        apiCanvas.width = 256;
        apiCanvas.height = 256;
        const apiCtx = apiCanvas.getContext('2d');
        apiCtx.drawImage(img, 0, 0, 256, 256);

        apiCanvas.toBlob((blob) => {
          onImageUpload({
            src: displayCanvas.toDataURL('image/png'),
            file: blob
          });
        }, 'image/png');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <div
      className="upload-area"
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
      onClick={() => inputRef.current.click()}
    >
      <input
        type="file"
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={onChange}
      />
      <div className="upload-content">
        <div className="upload-icon">&#8682;</div>
        <div className="upload-title">Upload Face Image</div>
        <div className="upload-desc">Drag and drop or click to select</div>
        <div className="upload-types">Supports JPG and PNG</div>
      </div>
    </div>
  );
}

export default ImageUploader; 