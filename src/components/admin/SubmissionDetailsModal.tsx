import React from 'react';
import { Download, Trash2, FileText, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ComicSubmission } from '../../types';

interface SubmissionDetailsModalProps {
  submission: ComicSubmission;
  onClose: () => void;
  onDownloadImages: (submission: ComicSubmission) => void;
  onDeleteImage: (submissionId: string, imageId: string) => void;
}

export default function SubmissionDetailsModal({
  submission,
  onClose,
  onDownloadImages,
  onDeleteImage
}: SubmissionDetailsModalProps) {
  const getStatusBadge = (status: ComicSubmission['status']) => {
    const statusStyles = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      submitted: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200'
    };

    const statusIcons = {
      draft: <FileText className="w-3 h-3" />,
      submitted: <Clock className="w-3 h-3" />,
      processing: <Clock className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
        {statusIcons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-yellow-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {submission.title}
              </h3>
              <p className="text-gray-600 mt-1">Customer: {submission.customer_id}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all duration-200"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">Customer ID</label>
                <p className="text-gray-900 font-mono mt-1">{submission.customer_id}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <div className="mt-1">{getStatusBadge(submission.status)}</div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Publication Date</label>
                <p className="text-gray-900 mt-1">{submission.date}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Submitted</label>
                <p className="text-gray-900 mt-1">{format(new Date(submission.created_at), 'PPp')}</p>
              </div>
            </div>

            {submission.description && (
              <div>
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <p className="text-gray-900 mt-2 p-4 bg-gray-50 rounded-lg">{submission.description}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700">
                  Images ({submission.images.length})
                </label>
                <button
                  onClick={() => onDownloadImages(submission)}
                  className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Download All
                </button>
              </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {submission.images.map((image, index) => (
    <div key={image.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      {/* Image Container */}
      <div className="relative group mb-3">
        <a href={image.url} target="_blank" rel="noopener noreferrer">
          <img
            src={image.url}
            alt={`Image ${index + 1}`}
            className="w-full h-48 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition"
          />
        </a>

        {/* Index badge */}
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
          #{index + 1}
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDeleteImage(submission.id, image.id)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Caption - moved below the image container */}
     {image.caption && (
  <div className="mt-1">
    <label className="text-xs font-medium text-gray-600 block">Caption</label>
    <p className="text-sm text-gray-900 mt-1 break-words">
      {image.caption}
    </p>
  </div>
)}


      {/* File info */}
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{image.file_name}</span>
        <span>{(image.file_size / 1024 / 1024).toFixed(1)} MB</span>
      </div>
    </div>
  ))}
</div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
