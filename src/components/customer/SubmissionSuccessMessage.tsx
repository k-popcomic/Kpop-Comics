import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SubmissionSuccessMessageProps {
  customerId: string;
}

export default function SubmissionSuccessMessage({ customerId }: SubmissionSuccessMessageProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-900 mb-2">Submission Complete!</h2>
        <p className="text-green-700 mb-6">
          Thank you for submitting your comic images. We'll process your order and get back to you soon.
        </p>
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-600">
            <strong>Submission ID:</strong> {customerId}
          </p>
        </div>
      </div>
    </div>
  );
}
