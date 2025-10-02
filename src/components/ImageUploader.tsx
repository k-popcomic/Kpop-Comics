import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { ComicImage } from '../types';

interface ImageUploaderProps {
  images: ComicImage[];
  onImagesChange: (images: ComicImage[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onImagesChange, maxImages = 10 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    
    try {
      const newImages: ComicImage[] = await Promise.all(
        acceptedFiles.map(async (file, index) => {
          const url = URL.createObjectURL(file);
          return {
            id: `temp-${Date.now()}-${index}`,
            url,
            caption: '',
            order_index: images.length + index,
            file_name: file.name,
            file_size: file.size,
            file: file // Store file for later upload
          } as ComicImage & { file: File };
        })
      );

      onImagesChange([...images, ...newImages]);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    disabled: uploading || images.length >= maxImages
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages.map((img, i) => ({ ...img, order_index: i })));
  };

  const updateCaption = (index: number, caption: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], caption };
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50/50 scale-105' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50'
          }
          ${uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          {uploading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          ) : (
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {uploading ? 'Processing images...' : 'Drop your comic images here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse • PNG, JPG, GIF up to 10MB each
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {images.length} of {maxImages} images uploaded
            </p>
          </div>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((image, index) => (
            <div key={image.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="relative group">
                <img
                  src={image.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  #{index + 1}
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={image.caption}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  placeholder="Add a caption for this image..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>{image.file_name}</span>
                <span>{(image.file_size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}