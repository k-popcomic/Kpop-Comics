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
  const [cropPosition, setCropPosition] = useState({ x: 50, y: 50 });
  const [cropSize, setCropSize] = useState({ width: 60, height: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);

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

  const handleCropMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingCrop(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingCrop || !cropRef.current) return;

    const rect = cropRef.current.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCropPosition({
      x: Math.max(cropSize.width / 2, Math.min(100 - cropSize.width / 2, x)),
      y: Math.max(cropSize.height / 2, Math.min(100 - cropSize.height / 2, y))
    });
  }, [isDraggingCrop, cropSize]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingCrop(false);
  }, []);

  React.useEffect(() => {
    if (isDraggingCrop) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingCrop, handleMouseMove, handleMouseUp]);

  const handleReset = () => {
    setCropPosition({ x: 50, y: 50 });
    setCropSize({ width: 60, height: 40 });
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

        // Calculate crop area in pixels
        const cropX = (cropPosition.x - cropSize.width / 2) / 100 * imageElement.naturalWidth;
        const cropY = (cropPosition.y - cropSize.height / 2) / 100 * imageElement.naturalHeight;
        const cropWidth = (cropSize.width / 100) * imageElement.naturalWidth;
        const cropHeight = (cropSize.height / 100) * imageElement.naturalHeight;

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Apply rotation if needed
        if (rotation !== 0) {
          ctx.translate(cropWidth / 2, cropHeight / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-cropWidth / 2, -cropHeight / 2);
        }

        ctx.drawImage(
          imageElement,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );

        canvas.toBlob((blob) => {
          if (blob) {
            onCropComplete(blob, pageIndex, panelId);
            handleClose();
          }
        }, 'image/jpeg', 0.9);
      } catch (error) {
        console.error('Error cropping image:', error);
        handleClose();
      }
    }, 1500);
  };

  const handleClose = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreviewUrl('');
    setCropPosition({ x: 50, y: 50 });
    setCropSize({ width: 60, height: 40 });
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
            {/* Image with Grid Overlay */}
            <div className="relative mb-6 max-h-96 overflow-hidden bg-gray-100 rounded-lg">
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Crop preview"
                className="w-full h-full object-contain mx-auto block"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
              />
              
              {/* Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Vertical lines */}
                <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-blue-400 opacity-70"></div>
                <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-blue-400 opacity-70"></div>
                {/* Horizontal lines */}
                <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-blue-400 opacity-70"></div>
                <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-blue-400 opacity-70"></div>
              </div>
              
              {/* Crop overlay */}
              <div className="absolute inset-0">
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/50"></div>
                
                {/* Rectangular crop area */}
                <div 
                  ref={cropRef}
                  className="absolute border-2 border-blue-500 cursor-move bg-transparent"
                  style={{ 
                    left: `${cropPosition.x - cropSize.width / 2}%`,
                    top: `${cropPosition.y - cropSize.height / 2}%`,
                    width: `${cropSize.width}%`,
                    height: `${cropSize.height}%`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                  }}
                  onMouseDown={handleCropMouseDown}
                >
                  {/* Corner handles */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white"></div>
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between mb-4">
              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
              
              {/* Rotate Button */}
              <button
                onClick={handleRotate}
                className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Rotate
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
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoom - 0.5) / 2.5) * 100}%, #cbd5e1 ${((zoom - 0.5) / 2.5) * 100}%, #cbd5e1 100%)`
                }}
              />
            </div>

            {/* File info */}
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">{selectedFile?.name || 'image.jpg'}</span>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep('upload')}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Change image
              </button>
              
              <button
                onClick={handleSaveImage}
                className="px-8 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 transition-colors font-medium"
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