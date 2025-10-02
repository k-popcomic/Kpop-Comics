import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, FileText, Send, CheckCircle } from 'lucide-react';
import Layout from './Layout';
import ImageUploader from './ImageUploader';
import { ComicImage, ComicSubmission } from '../types';
import { supabase, uploadImage } from '../lib/supabase';

export default function CustomerUpload() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  
  const [images, setImages] = useState<ComicImage[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [customerExists, setCustomerExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      checkCustomer();
    }
  }, [customerId]);

  const checkCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('unique_code', customerId)
        .single();

      if (error || !data) {
        setCustomerExists(false);
      } else {
        setCustomerExists(true);
        // Check if already submitted
        const { data: submission } = await supabase
          .from('submissions')
          .select('*')
          .eq('customer_id', customerId)
          .eq('status', 'submitted')
          .single();
        
        if (submission) {
          setSubmitted(true);
        }
      }
    } catch (error) {
      console.error('Error checking customer:', error);
      setCustomerExists(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setSubmitting(true);

    try {
      // Upload all images to Supabase Storage
      const uploadPromises = images.map(async (image, index) => {
        const file = (image as any).file;
        if (file) {
          const imageUrl = await uploadImage(file, customerId!);
          return {
            ...image,
            url: imageUrl,
            order_index: index
          };
        }
        return image;
      });

      const uploadedImages = await Promise.all(uploadPromises);

      // Create submission record
      const submission: Partial<ComicSubmission> = {
        customer_id: customerId!,
        title,
        description,
        date,
        images: uploadedImages,
        status: 'submitted'
      };

      const { error } = await supabase
        .from('submissions')
        .insert([submission]);

      if (error) throw error;

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting comic:', error);
      alert('Error submitting your comic. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Comic Upload">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!customerExists) {
    return (
      <Layout title="Invalid Link">
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
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout title="Submission Complete">
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
      </Layout>
    );
  }

  return (
    <Layout title="Upload Your Comic">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Upload Your Comic Images
            </h2>
            <p className="text-gray-600">
              Upload your comic images and add details. We'll create your professional comic layout.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Comic Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  onChange={(e) => setDate(e.target.value)}
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
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any special notes or instructions..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Image Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Images</h3>
              <ImageUploader
                images={images}
                onImagesChange={setImages}
                maxImages={10}
              />
            </div>

            {/* Submit Button */}
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
      </div>
    </Layout>
  );
}