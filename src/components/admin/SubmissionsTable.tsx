import React from 'react';
import { Eye, Download, Calendar, User, Image as ImageIcon, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ComicSubmission } from '../../types';

interface SubmissionsTableProps {
  submissions: ComicSubmission[];
  onViewSubmission: (submission: ComicSubmission) => void;
  onDownloadImages: (submission: ComicSubmission) => void;
  onDeleteSubmission: (id: string) => void;
  onStatusChange: (id: string, status: ComicSubmission['status']) => void;
}

export default function SubmissionsTable({
  submissions,
  onViewSubmission,
  onDownloadImages,
  onDeleteSubmission,
  onStatusChange
}: SubmissionsTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-12 text-center">
          <div className="flex flex-col items-center">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-500">
              Customer submissions will appear here once they upload their comics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Submission Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Images
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{submission.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      ID: {submission.id.slice(0, 8)}...
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm text-gray-900 font-mono">{submission.customer_id}</div>
                      <div className="text-xs text-gray-500">{submission.images.length} images</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={submission.status}
                    onChange={(e) => onStatusChange(submission.id, e.target.value as ComicSubmission['status'])}
                    className="text-sm border-0 bg-transparent focus:ring-0 font-medium cursor-pointer hover:bg-gray-50 rounded p-1"
                  >
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ImageIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900 font-semibold">{submission.images.length}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    {format(new Date(submission.created_at), 'MMM dd, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onViewSubmission(submission)}
                      className="text-red-600 hover:text-red-800 inline-flex items-center transition-colors duration-150"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => onDownloadImages(submission)}
                      className="text-green-600 hover:text-green-800 inline-flex items-center transition-colors duration-150"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                    <button
                      onClick={() => onDeleteSubmission(submission.id)}
                      className="text-red-600 hover:text-red-800 inline-flex items-center transition-colors duration-150"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
