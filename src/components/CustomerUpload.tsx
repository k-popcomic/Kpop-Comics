import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from './Layout';
import { ComicImage, ComicSubmission } from '../types';
import { supabase, uploadImage } from '../lib/supabase';
import SubmissionForm from './customer/SubmissionForm';
import InvalidLinkMessage from './customer/InvalidLinkMessage';
import SubmissionSuccessMessage from './customer/SubmissionSuccessMessage';

export default function CustomerUpload() {
  const { customerId } = useParams<{ customerId: string }>();
  
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
        <InvalidLinkMessage />
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout title="Submission Complete">
        <SubmissionSuccessMessage customerId={customerId!} />
      </Layout>
    );
  }

  return (
    <Layout title="Upload Your Comic">
      <div className="max-w-4xl mx-auto">
        <SubmissionForm
          title={title}
          description={description}
          date={date}
          images={images}
          submitting={submitting}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onDateChange={setDate}
          onImagesChange={setImages}
          onSubmit={handleSubmit}
        />
      </div>
    </Layout>
  );
}