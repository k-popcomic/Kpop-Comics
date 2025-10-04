import React from 'react';
import { Calendar, FileText, Send } from 'lucide-react';
import ImageUploader from '../ImageUploader';
import { ComicImage } from '../../types';

interface SubmissionFormProps {
  title: string;
  description: string;
  date: string;
  images: ComicImage[];
  submitting: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onDateChange: (date: string) => void;
  onImagesChange: (images: ComicImage[]) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SubmissionForm({
  title,
  description,
  date,
  images,
  submitting,
  onTitleChange,
  onDescriptionChange,
  onDateChange,
  onImagesChange,
  onSubmit
}: SubmissionFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
      <div className="p-8 border-b border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Your Comic Images
        </h2>
        <p className="text-gray-600">
          Upload your comic images and add details. We'll create your professional comic layout.
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 mr-2" />
              Comic Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter your comic title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              Publication Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Add any special notes or instructions..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Images</h3>
          <ImageUploader
            images={images}
            onImagesChange={onImagesChange}
            maxImages={10}
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting || images.length === 0}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            ) : (
              <Send className="w-5 h-5 mr-3" />
            )}
            {submitting ? 'Submitting...' : 'Submit Comic'}
          </button>
        </div>
      </form>
    </div>
  );
}
