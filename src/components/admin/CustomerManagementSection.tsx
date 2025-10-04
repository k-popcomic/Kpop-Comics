import React from 'react';
import { Plus, Copy, Mail } from 'lucide-react';
import { ComicSubmission } from '../../types';

interface CustomerManagementSectionProps {
  customers: any[];
  submissions: ComicSubmission[];
  onCreateCustomer: () => void;
  onCopyLink: (link: string) => void;
}

export default function CustomerManagementSection({
  customers,
  submissions,
  onCreateCustomer,
  onCopyLink
}: CustomerManagementSectionProps) {
  const getUploadLink = (customerId: string) => {
    return `${window.location.origin}/${customerId}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Customer Upload Links</h2>
        <button
          onClick={onCreateCustomer}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Customer Link
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Upload Link
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => {
              const hasSubmission = submissions.find(s => s.customer_id === customer.unique_code);
              return (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.name || 'No name'}</div>
                      <div className="text-sm text-gray-500">{customer.email || 'No email'}</div>
                      <div className="text-xs text-gray-400 font-mono">ID: {customer.unique_code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{getUploadLink(customer.unique_code)}</code>
                      <button
                        onClick={() => onCopyLink(getUploadLink(customer.unique_code))}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      hasSubmission ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {hasSubmission ? 'Submitted' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => window.open(`mailto:${customer.email}?subject=Your Comic Upload Link&body=Hi ${customer.name},%0D%0A%0D%0APlease use this link to upload your comic images:%0D%0A${getUploadLink(customer.unique_code)}%0D%0A%0D%0AThank you!`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                      disabled={!customer.email}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email Link
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
