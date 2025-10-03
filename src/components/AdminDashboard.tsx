import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Eye, 
  Download, 
  Calendar, 
  User, 
  Image as ImageIcon, 
  Search, 
  Filter, 
  LogOut,
  Users,
  FileText,
  Clock,
  CheckCircle,
  Trash2,
  Plus,
  Link,
  Copy,
  Mail
} from 'lucide-react';
import Layout from './Layout';
import { ComicSubmission } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<ComicSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ComicSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    unique_code: '',
    email: '',
    name: ''
  });
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
    fetchCustomers();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const generateUniqueCode = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const createCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const customerData = {
        ...newCustomer,
        unique_code: newCustomer.unique_code || generateUniqueCode()
      };

      const { error } = await supabase
        .from('customers')
        .insert([customerData]);

      if (error) throw error;

      await fetchCustomers();
      setNewCustomer({ unique_code: '', email: '', name: '' });
      setShowCreateCustomer(false);
      alert('Customer created successfully!');
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Error creating customer. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  const getUploadLink = (customerId: string) => {
    return `${window.location.origin}/${customerId}`;
  };

  const updateSubmissionStatus = async (id: string, status: ComicSubmission['status']) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setSubmissions(prev => 
        prev.map(sub => sub.id === id ? { ...sub, status } : sub)
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const downloadImages = async (submission: ComicSubmission) => {
    for (let i = 0; i < submission.images.length; i++) {
      const image = submission.images[i];
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${submission.title}_image_${i + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading image:', error);
      }
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSubmissions(prev => prev.filter(sub => sub.id !== id));
      alert('Submission deleted successfully');
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Error deleting submission');
    }
  };

  const deleteImage = async (submissionId: string, imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) return;

      const updatedImages = submission.images.filter(img => img.id !== imageId);
      
      const { error } = await supabase
        .from('submissions')
        .update({ images: updatedImages })
        .eq('id', submissionId);

      if (error) throw error;
      
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, images: updatedImages }
            : sub
        )
      );
      
      // Update selected submission if it's currently open
      if (selectedSubmission && selectedSubmission.id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, images: updatedImages });
      }
      
      alert('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image');
    }
  };
  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

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

  const getStatusCount = (status: string) => {
    if (status === 'all') return submissions.length;
    return submissions.filter(s => s.status === status).length;
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.customer_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kpop Comics Admin</h1>
                <p className="text-sm text-gray-500">Kpop Comic Submission Management</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { 
              label: 'Total Customers', 
              value: customers.length, 
              color: 'red',
              icon: <Users className="w-6 h-6" />
            },
            { 
              label: 'Total Submissions', 
              value: getStatusCount('all'), 
              color: 'blue',
              icon: <FileText className="w-6 h-6" />
            },
            { 
              label: 'Submitted', 
              value: getStatusCount('submitted'), 
              color: 'yellow',
              icon: <Clock className="w-6 h-6" />
            },
            { 
              label: 'Completed', 
              value: getStatusCount('completed'), 
              color: 'green',
              icon: <CheckCircle className="w-6 h-6" />
            }
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center text-${stat.color}-600`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Management Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Customer Upload Links</h2>
            <button
              onClick={() => setShowCreateCustomer(true)}
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
                            onClick={() => copyToClipboard(getUploadLink(customer.unique_code))}
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

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title or customer ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white transition-all duration-200"
                >
                  <option value="all">All Status ({getStatusCount('all')})</option>
                  <option value="draft">Draft ({getStatusCount('draft')})</option>
                  <option value="submitted">Submitted ({getStatusCount('submitted')})</option>
                  <option value="processing">Processing ({getStatusCount('processing')})</option>
                  <option value="completed">Completed ({getStatusCount('completed')})</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
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
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                        <p className="text-gray-500">
                          {searchTerm || statusFilter !== 'all' 
                            ? 'Try adjusting your search or filter criteria.'
                            : 'Customer submissions will appear here once they upload their comics.'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
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
                          onChange={(e) => updateSubmissionStatus(submission.id, e.target.value as ComicSubmission['status'])}
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
                            onClick={() => setSelectedSubmission(submission)}
                           className="text-red-600 hover:text-red-800 inline-flex items-center transition-colors duration-150"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => downloadImages(submission)}
                            className="text-green-600 hover:text-green-800 inline-flex items-center transition-colors duration-150"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </button>
                          <button
                            onClick={() => deleteSubmission(submission.id)}
                            className="text-red-600 hover:text-red-800 inline-flex items-center transition-colors duration-150"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submission Details Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
             <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-yellow-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedSubmission.title}
                    </h3>
                    <p className="text-gray-600 mt-1">Customer: {selectedSubmission.customer_id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedSubmission(null)}
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
                      <p className="text-gray-900 font-mono mt-1">{selectedSubmission.customer_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Publication Date</label>
                      <p className="text-gray-900 mt-1">{selectedSubmission.date}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Submitted</label>
                      <p className="text-gray-900 mt-1">{format(new Date(selectedSubmission.created_at), 'PPp')}</p>
                    </div>
                  </div>
                  
                  {selectedSubmission.description && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Description</label>
                      <p className="text-gray-900 mt-2 p-4 bg-gray-50 rounded-lg">{selectedSubmission.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-semibold text-gray-700">
                        Images ({selectedSubmission.images.length})
                      </label>
                      <button
                        onClick={() => downloadImages(selectedSubmission)}
                       className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        <Download className="w-4 h-4 mr-1.5" />
                        Download All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSubmission.images.map((image, index) => (
                        <div key={image.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="relative group mb-3">
                            <img
                              src={image.url}
                              alt={`Image ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg shadow-sm"
                            />
                            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                              #{index + 1}
                            </div>
                            <button
                              onClick={() => deleteImage(selectedSubmission.id, image.id)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {image.caption && (
                            <div>
                              <label className="text-xs font-medium text-gray-600">Caption</label>
                              <p className="text-sm text-gray-900 mt-1">{image.caption}</p>
                            </div>
                          )}
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
        )}

        {/* Create Customer Modal */}
        {showCreateCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Create Customer Upload Link</h3>
                  <button
                    onClick={() => setShowCreateCustomer(false)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
              </div>
              
              <form onSubmit={createCustomer} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCustomer.unique_code}
                    onChange={(e) => setNewCustomer({...newCustomer, unique_code: e.target.value})}
                    placeholder="Auto-generated if empty"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate a unique ID</p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateCustomer(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Create Customer Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}