import React from 'react';
import { FileText } from 'lucide-react';

export default function InvalidLinkMessage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-red-900 mb-2">Invalid Upload Link</h2>
        <p className="text-red-700">
          This upload link is not valid or has expired. Please contact support for assistance.
        </p>
      </div>
    </div>
  );
}
