export interface ComicSubmission {
  id: string;
  customer_id: string;
  title: string;
  description: string;
  date: string;
  images: ComicImage[];
  created_at: string;
  status: 'draft' | 'submitted' | 'processing' | 'completed';
}

export interface ComicImage {
  id: string;
  url: string;
  caption: string;
  order_index: number;
  file_name: string;
  file_size: number;
}

export interface Customer {
  id: string;
  unique_code: string;
  email?: string;
  name?: string;
  created_at: string;
}