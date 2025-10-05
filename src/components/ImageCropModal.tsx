import React, { useState, useRef, useCallback } from 'react';
import { X, RotateCcw, RefreshCw } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob, pageIndex: number, panelId: string) => void;
  fileName: string;
  pageIndex: number;
  panelId: string;
}

export default function ImageCropModal({ 
  isOpen, 
  onClose, 
  onCropComplete, 
  fileName,
  pageIndex,
  panelId
}: ImageCropModalProps) {
  const [step, setStep] = useState<'upload' | 'crop' | 'saving'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStep('crop');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSaveImage = async () => {
    if (!selectedFile || !imageRef.current) return;

    const imageElement = imageRef.current;
    setStep('saving');

    setTimeout(async () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = imageElement.naturalWidth;
        const height = imageElement.naturalHeight;

        canvas.width = width;
        canvas.height = height;

        ctx.translate(width / 2, height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        ctx.translate(-width / 2, -height / 2);

        ctx.drawImage(imageElement, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            onCropComplete(blob, pageIndex, panelId);
            handleClose();
          }
        }, 'image/jpeg', 0.95);
      } catch (error) {
        console.error('Error processing image:', error);
        handleClose();
      }
    }, 1500);
  };

  const handleClose = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreviewUrl('');
    setZoom(1);
    setRotation(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Upload an image</h3>
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text-gray-600 text-lg">
                Drag and drop your image here, or click to upload
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>
          </div>
        )}

        {/* Crop Step */}
        {step === 'crop' && (
          <div className="p-6">
            {/* Image with Letterbox Effect */}
            <div className="relative mb-6 h-[60vh] max-h-[500px] bg-gray-600 flex items-center justify-center overflow-hidden">
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Crop preview"
                className="max-w-full max-h-full object-contain"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4 mb-4">
              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-1"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Rotate Button */}
              <button
                onClick={handleRotate}
                className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-1"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* Zoom Slider */}
            <div className="mb-4">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </div>

            {/* File info */}
            <div className="mb-6">
              <span className="text-sm text-gray-700">{selectedFile?.name || 'image.jpg'}</span>
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={() => setStep('upload')}
                className="px-8 py-3 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
              >
                Change image
              </button>

              <button
                onClick={handleSaveImage}
                className="px-10 py-3 bg-yellow-400 text-black rounded hover:bg-yellow-500 transition-colors font-semibold"
              >
                Save image
              </button>
            </div>
          </div>
        )}

        {/* Saving Step */}
        {step === 'saving' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">
              UPLOADING YOUR IMAGE
            </h3>
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}