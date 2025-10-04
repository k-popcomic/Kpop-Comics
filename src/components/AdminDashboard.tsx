import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComicSubmission } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import DashboardHeader from './admin/DashboardHeader';
import StatsOverview from './admin/StatsOverview';
import CustomerManagementSection from './admin/CustomerManagementSection';
import SubmissionsFilters from './admin/SubmissionsFilters';
import SubmissionsTable from './admin/SubmissionsTable';
import SubmissionDetailsModal from './admin/SubmissionDetailsModal';
import CreateCustomerModal from './admin/CreateCustomerModal';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<ComicSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ComicSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
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

  const createCustomer = async (customerData: { name: string; email: string; unique_code: string }) => {
    try {
      const newCustomer = {
        ...customerData,
        unique_code: customerData.unique_code || generateUniqueCode()
      };

      const { error } = await supabase
        .from('customers')
        .insert([newCustomer]);

      if (error) throw error;

      await fetchCustomers();
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

  const statusCounts = {
    all: getStatusCount('all'),
    draft: getStatusCount('draft'),
    submitted: getStatusCount('submitted'),
    processing: getStatusCount('processing'),
    completed: getStatusCount('completed')
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DashboardHeader onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <StatsOverview
          totalCustomers={customers.length}
          totalSubmissions={statusCounts.all}
          submittedCount={statusCounts.submitted}
          completedCount={statusCounts.completed}
        />

        <CustomerManagementSection
          customers={customers}
          submissions={submissions}
          onCreateCustomer={() => setShowCreateCustomer(true)}
          onCopyLink={copyToClipboard}
        />

        <SubmissionsFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          statusCounts={statusCounts}
        />

        <SubmissionsTable
          submissions={filteredSubmissions}
          onViewSubmission={setSelectedSubmission}
          onDownloadImages={downloadImages}
          onDeleteSubmission={deleteSubmission}
          onStatusChange={updateSubmissionStatus}
        />
      </main>

      {selectedSubmission && (
        <SubmissionDetailsModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onDownloadImages={downloadImages}
          onDeleteImage={deleteImage}
        />
      )}

      {showCreateCustomer && (
        <CreateCustomerModal
          onClose={() => setShowCreateCustomer(false)}
          onSubmit={createCustomer}
        />
      )}
    </div>
  );
}
