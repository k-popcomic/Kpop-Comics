import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Upload, Calendar, Save, Send } from 'lucide-react';
import { supabase, uploadImage } from '../lib/supabase';
import { ComicImage } from '../types';
import ImageCropModal from './ImageCropModal';

interface ComicPage {
  id: string;
  layout: 'single' | 'double' | 'triple' | 'quad';
  panels: ComicPanel[];
}

interface ComicPanel {
  id: string;
  type: 'image' | 'text' | 'date';
  content: string;
  image?: File | string;
  placeholder: string;
  style: string;
}

const COMIC_LAYOUTS: ComicPage[] = [
  {
    id: 'page1',
    layout: 'double',
    panels: [
      { id: 'title', type: 'text', content: '', placeholder: 'Add a title here', style: 'title' },
      { id: 'subtitle', type: 'text', content: '', placeholder: 'Add a subtitle', style: 'subtitle' },
      { id: 'date', type: 'date', content: '2\nMar', placeholder: '2\nMar', style: 'date' },
      { id: 'image1', type: 'image', content: '', placeholder: 'Click to add image', style: 'main-image' },
      { id: 'caption1', type: 'text', content: '', placeholder: 'Add a caption', style: 'caption' },
      { id: 'dedication', type: 'text', content: '', placeholder: 'Write your dedication here', style: 'dedication' }
    ]
  },
  {
    id: 'page2',
    layout: 'double',
    panels: [
      { id: 'image2', type: 'image', content: '', placeholder: 'Click to add image', style: 'full-page' },
      { id: 'image3', type: 'image', content: '', placeholder: 'Click to add image', style: 'half-page' },
      { id: 'caption2', type: 'text', content: '', placeholder: 'Add a caption here', style: 'caption' },
      { id: 'image4', type: 'image', content: '', placeholder: 'Click to add image', style: 'half-page' }
    ]
  },
  {
    id: 'page3',
    layout: 'single',
    panels: [
      { id: 'image5', type: 'image', content: '', placeholder: 'Click to add image', style: 'full-page' },
      { id: 'caption3', type: 'text', content: '', placeholder: 'Add a caption here', style: 'caption' }
    ]
  },
  {
    id: 'page4',
    layout: 'double',
    panels: [
      { id: 'image6', type: 'image', content: '', placeholder: 'Click to add image', style: 'top-half' },
      { id: 'image7', type: 'image', content: '', placeholder: 'Click to add image', style: 'top-half' },
      { id: 'image8', type: 'image', content: '', placeholder: 'Click to add image', style: 'bottom-full' },
      { id: 'caption4', type: 'text', content: '', placeholder: 'Add a caption here', style: 'caption' }
    ]
  },
  {
    id: 'page5',
    layout: 'double',
    panels: [
      { id: 'image9', type: 'image', content: '', placeholder: 'Click to add image', style: 'half-page' },
      { id: 'caption5', type: 'text', content: '', placeholder: 'Add a caption here', style: 'caption' },
      { id: 'image10', type: 'image', content: '', placeholder: 'Click to add image', style: 'half-page' }
    ]
  }
];

export default function ComicTemplate() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<ComicPage[]>(COMIC_LAYOUTS);
  const [customerExists, setCustomerExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [cropModal, setCropModal] = useState<{
    isOpen: boolean;
    pageIndex: number;
    panelId: string;
    fileName: string;
  }>({
    isOpen: false,
    pageIndex: 0,
    panelId: '',
    fileName: ''
  });

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
        await loadExistingSubmission();
      }
    } catch (error) {
      console.error('Error checking customer:', error);
      setCustomerExists(false);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingSubmission = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setExistingSubmission(data);
        const restoredPages = [...pages];
        
        if (data.images && Array.isArray(data.images)) {
          data.images.forEach((img: any) => {
            for (let pageIndex = 0; pageIndex < restoredPages.length; pageIndex++) {
              const panel = restoredPages[pageIndex].panels.find(p => p.id === img.id);
              if (panel) {
                panel.content = img.url;
                panel.image = img.url;
                break;
              }
            }
          });
        }
        
        if (data.title) {
          const titlePanel = restoredPages[0].panels.find(p => p.id === 'title');
          if (titlePanel) titlePanel.content = data.title;
        }
        
        if (data.description) {
          const dedicationPanel = restoredPages[0].panels.find(p => p.id === 'dedication');
          if (dedicationPanel) dedicationPanel.content = data.description;
        }
        
        setPages(restoredPages);
      }
    } catch (error) {
      console.error('Error loading existing submission:', error);
    }
  };

  const handleImageClick = (pageIndex: number, panelId: string) => {
    setCropModal({
      isOpen: true,
      pageIndex,
      panelId,
      fileName: ''
    });
  };

  const handleCropComplete = (blob: Blob, pageIndex: number, panelId: string) => {
    // Create a file from the blob
    const file = new File([blob], `${panelId}.jpg`, { type: 'image/jpeg' });
    
    // Create a persistent data URL instead of blob URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      const newPages = [...pages];
      const panel = newPages[pageIndex].panels.find(p => p.id === panelId);
      if (panel) {
        panel.image = file;
        panel.content = imageUrl; // Store data URL for persistence
      }
      setPages(newPages);
      saveDraft(newPages);
    };
    reader.readAsDataURL(blob);
  };

  const handleTextChange = (pageIndex: number, panelId: string, value: string) => {
    const newPages = [...pages];
    const panel = newPages[pageIndex].panels.find(p => p.id === panelId);
    if (panel) {
      panel.content = value;
    }
    setPages(newPages);
    saveDraft(newPages);
  };

  const handleDateChange = (pageIndex: number, panelId: string, day: string, month: string) => {
    const newPages = [...pages];
    const panel = newPages[pageIndex].panels.find(p => p.id === panelId);
    if (panel) {
      panel.content = `${day}\n${month}`;
    }
    setPages(newPages);
    saveDraft(newPages);
  };

  const saveDraft = async (currentPages: ComicPage[]) => {
    try {
      const images: ComicImage[] = [];
      let imageIndex = 0;
      let title = '';
      let description = '';

      for (const page of currentPages) {
        for (const panel of page.panels) {
          if (panel.type === 'image' && panel.content && panel.image) {
            images.push({
              id: panel.id,
              url: panel.content, // Always use the content (data URL or uploaded URL)
              caption: '',
              order_index: imageIndex++,
              file_name: `${panel.id}.jpg`,
              file_size: typeof panel.image === 'object' ? panel.image.size : 0
            });
          } else if (panel.id === 'title' && panel.content) {
            title = panel.content;
          } else if (panel.id === 'dedication' && panel.content) {
            description = panel.content;
          }
        }
      }

      const draftData = {
        customer_id: customerId!,
        title: title || 'Draft Comic',
        description: description || '',
        date: new Date().toISOString().split('T')[0],
        images: images,
        status: 'draft' as const
      };

      if (existingSubmission) {
        await supabase
          .from('submissions')
          .update(draftData)
          .eq('id', existingSubmission.id);
      } else {
        const { data } = await supabase
          .from('submissions')
          .insert([draftData])
          .select()
          .single();
        
        if (data) {
          setExistingSubmission(data);
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Are you ready to submit your comic? This will lock it temporarily for processing.')) {
      return;
    }

    setSubmitting(true);
    try {
      // Upload any new images that are still File objects
      const updatedPages = [...pages];
      for (let pageIndex = 0; pageIndex < updatedPages.length; pageIndex++) {
        for (let panelIndex = 0; panelIndex < updatedPages[pageIndex].panels.length; panelIndex++) {
          const panel = updatedPages[pageIndex].panels[panelIndex];
          if (panel.type === 'image' && panel.image instanceof File) {
            const imageUrl = await uploadImage(panel.image, customerId!);
            panel.content = imageUrl;
            panel.image = imageUrl;
          }
        }
      }

      // Prepare images array for database
      const images: ComicImage[] = [];
      let imageIndex = 0;
      for (const page of updatedPages) {
        for (const panel of page.panels) {
          if (panel.type === 'image' && panel.content && panel.content !== '') {
            images.push({
              id: panel.id,
              url: panel.content,
              caption: '',
              order_index: imageIndex++,
              file_name: `${panel.id}.jpg`,
              file_size: 0
            });
          }
        }
      }

      const submissionData = {
        title: updatedPages[0].panels.find(p => p.id === 'title')?.content || 'Comic Submission',
        description: updatedPages[0].panels.find(p => p.id === 'dedication')?.content || '',
        date: new Date().toISOString().split('T')[0],
        images: images,
        status: 'submitted' as const
      };

      if (existingSubmission) {
        // Update existing submission
        const { error } = await supabase
          .from('submissions')
          .update(submissionData)
          .eq('id', existingSubmission.id);
        
        if (error) throw error;
      } else {
        // Create new submission (this should rarely happen)
        const { error } = await supabase
          .from('submissions')
          .insert([{
            customer_id: customerId!,
            ...submissionData
          }]);
        
        if (error) throw error;
      }

      alert('Comic submitted successfully! Your comic is now locked temporarily for processing. Contact Alex if you need to make changes.');
      navigate('/');
    } catch (error) {
      console.error('Error submitting comic:', error);
      alert('Error submitting comic. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center text-white">
        <div className="mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">LOADING...</h2>
      </div>
    );
  }

  if (!customerExists) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h2>
          <p className="text-gray-600">This upload link is not valid or has expired.</p>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">
            Welcome to your comic template! Please follow the guidelines below so we has everything he needs to make your comic look great! If you have any questions just reply to my email and I'll get back to you
          </h1>
          
          {/* <div className="mb-8">
            <p className="text-lg md:text-xl mb-4">
              Before you start, <span className="underline cursor-pointer text-red-400">watch the 3 minute tutorial video</span> and read the guidelines below:
            </p>
          </div> */}

          <div className="bg-white/10 rounded-lg p-4 md:p-6 mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-6">Guidelines</h2>
            <ol className="space-y-4 text-sm md:text-lg">
              <li>
                <span className="font-semibold">1.</span> Look through the template to <span className="font-semibold">familiarise yourself with the format</span> and plan what images and text go where. Think about the shape of the image box and the shape of the photo you want (landscape shape with a landscape image).
              </li>
              <li>
                <span className="font-semibold">2.</span> <span className="font-semibold">Choose your images</span> (avoid dark and low resolution ones) and save them to a folder on your PC or phone with an easy to recognise name. It's easier for us to work with good quality images so use them if you can.
              </li>
              <li>
                <span className="font-semibold">3.</span> To <span className="font-semibold">upload images</span>, tap or right click on the image box, choose the folder the image is in and select it. Then resize or crop it as you see fit.
              </li>
              <li>
                <span className="font-semibold">4.</span> To write <span className="font-semibold">your captions</span>, just tap or click on the box and type it out. You can leave the boxes blank if you don't want to write anything.
              </li>
              <li>
                <span className="font-semibold">5.</span> You can <span className="font-semibold">add your special date</span> to the cover by clicking on the date box saying 1 Sep in the top right hand corner and selecting the day and month.
              </li>
              <li>
                <span className="font-semibold">6.</span> <span className="font-semibold">Only use images that are yours</span> or that you have permission to use. Photos are fine, but <span className="font-semibold">we're not allowed to print images that belong to Disney for example.</span>
              </li>
              <li>
                <span className="font-semibold">7.</span> To <span className="font-semibold">submit your comic</span>, just tick the box at the end of the comic when you've uploaded all your images. This will lock your comic temporarily so <span className="font-semibold">we</span> can work from that version. Don\'t worry though, <span className="font-semibold">we</span> can always unlock it if you need to change anything!
              </li>
            </ol>
          </div>

          <button
            onClick={() => setShowWelcome(false)}
            className="bg-yellow-400 text-black px-6 md:px-8 py-3 rounded-lg font-semibold text-base md:text-lg hover:bg-yellow-300 transition-colors"
          >
            Start uploading!
          </button>
        </div>
      </div>
    );
  }

  const currentPageData = pages[currentPage];

  return (
    <div className="min-h-screen bg-gray-200 p-2 md:p-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-center mb-4 md:mb-6 relative">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="fixed left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-red-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          
          <div className="text-center">
            <p className="text-sm md:text-base text-gray-600">Page {currentPage + 1} of {pages.length}</p>
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
            disabled={currentPage === pages.length - 1}
            className="fixed right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-red-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        </div>

        {/* Comic Pages */}
        <div className="flex justify-center space-x-2 md:space-x-8 px-16 md:px-0">
          {currentPageData.layout === 'single' ? (
            <ComicPageRenderer
              page={currentPageData}
              pageIndex={currentPage}
              pages={pages}
              onImageClick={handleImageClick}
              onTextChange={handleTextChange}
              onDateChange={handleDateChange}
            />
          ) : (
            <>
              <ComicPageRenderer
                page={currentPageData}
                pageIndex={currentPage}
                pages={pages}
                onImageClick={handleImageClick}
                onTextChange={handleTextChange}
                onDateChange={handleDateChange}
                isLeftPage={true}
              />
              <ComicPageRenderer
                page={currentPageData}
                pageIndex={currentPage}
                pages={pages}
                onImageClick={handleImageClick}
                onTextChange={handleTextChange}
                onDateChange={handleDateChange}
                isRightPage={true}
              />
            </>
          )}
        </div>

        {/* Submit Button */}
        {currentPage === pages.length - 1 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>{submitting ? 'Submitting...' : 'Submit Comic'}</span>
            </button>
          </div>
        )}

        {/* Image Crop Modal */}
        <ImageCropModal
          isOpen={cropModal.isOpen}
          onClose={() => setCropModal({ ...cropModal, isOpen: false })}
          onCropComplete={handleCropComplete}
          fileName={cropModal.fileName}
          pageIndex={cropModal.pageIndex}
          panelId={cropModal.panelId}
        />
      </div>
    </div>
  );
}

interface ComicPageRendererProps {
  page: ComicPage;
  pageIndex: number;
  pages: ComicPage[];
  onImageClick: (pageIndex: number, panelId: string) => void;
  onTextChange: (pageIndex: number, panelId: string, value: string) => void;
  onDateChange: (pageIndex: number, panelId: string, day: string, month: string) => void;
  isLeftPage?: boolean;
  isRightPage?: boolean;
}

function ComicPageRenderer({ page, pageIndex, pages, onImageClick, onTextChange, onDateChange, isLeftPage, isRightPage }: ComicPageRendererProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getPagePanels = () => {
    if (page.layout === 'single') return page.panels;
    
    const midPoint = Math.ceil(page.panels.length / 2);
    if (isLeftPage) {
      return page.panels.slice(0, midPoint);
    } else {
      return page.panels.slice(midPoint);
    }
  };

  const panels = getPagePanels();

  return (
    <div className="bg-white border-4 md:border-8 border-black rounded-lg shadow-2xl w-full max-w-sm md:max-w-md mx-auto" style={{ aspectRatio: '2/3', minHeight: '400px' }}>
      <div className="h-full p-2 md:p-4 relative">
        {/* Cover Page (Page 1) */}
        {pageIndex === 0 && isLeftPage && (
          <>
            {/* Date box */}
            <div 
              className="absolute top-2 md:top-4 right-2 md:right-4 bg-yellow-400 text-black p-1 md:p-2 rounded text-center font-bold text-xs md:text-sm cursor-pointer hover:bg-yellow-300"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <div>{page.panels.find(p => p.id === 'date')?.content?.split('\n')[0] || '2'}</div>
              <div>{page.panels.find(p => p.id === 'date')?.content?.split('\n')[1] || 'Mar'}</div>
            </div>

            {/* Date Picker Modal */}
            {showDatePicker && (
              <div className="absolute top-16 right-2 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg z-20">
                <h3 className="font-bold mb-2">Select Date</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs">Day</label>
                    <select 
                      className="w-full border rounded p-1 text-xs"
                      onChange={(e) => {
                        const currentMonth = page.panels.find(p => p.id === 'date')?.content?.split('\n')[1] || 'Mar';
                        onDateChange(pageIndex, 'date', e.target.value, currentMonth);
                      }}
                    >
                      {Array.from({length: 31}, (_, i) => (
                        <option key={i+1} value={i+1}>{i+1}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs">Month</label>
                    <select 
                      className="w-full border rounded p-1 text-xs"
                      onChange={(e) => {
                        const currentDay = page.panels.find(p => p.id === 'date')?.content?.split('\n')[0] || '2';
                        onDateChange(pageIndex, 'date', currentDay, e.target.value);
                      }}
                    >
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button 
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-xs"
                  onClick={() => setShowDatePicker(false)}
                >
                  Done
                </button>
              </div>
            )}
            
            {/* Title */}
            <input
              type="text"
              placeholder="Add a title here"
              value={page.panels.find(p => p.id === 'title')?.content || ''}
              className="w-3/4 bg-yellow-400 text-black p-1 md:p-2 rounded font-bold text-center mb-1 md:mb-2 border-0 focus:ring-2 focus:ring-yellow-500 text-xs md:text-sm"
              onChange={(e) => onTextChange(pageIndex, 'title', e.target.value)}
            />
            
            {/* Subtitle */}
            <input
              type="text"
              placeholder="Add a subtitle"
              value={page.panels.find(p => p.id === 'subtitle')?.content || ''}
              className="w-3/4 bg-yellow-400 text-black p-1 rounded text-center mb-2 md:mb-4 border-0 focus:ring-2 focus:ring-yellow-500 text-xs md:text-sm"
              onChange={(e) => onTextChange(pageIndex, 'subtitle', e.target.value)}
            />
            
            {/* Main image area */}
            <div className="w-full h-32 md:h-64 bg-gray-300 rounded flex items-center justify-center mb-2 md:mb-4 cursor-pointer hover:bg-gray-400 transition-colors relative">
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => onImageClick(pageIndex, 'image1')}
              />
              {pages[pageIndex]?.panels?.find(p => p.id === 'image1')?.content ? (
                <img
                  src={pages[pageIndex].panels.find(p => p.id === 'image1')?.content}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    console.log('Image failed to load:', e.currentTarget.src);
                  }}
                />
              ) : (
                <div className="text-gray-500 text-center">
                  <Upload className="w-6 h-6 md:w-12 md:h-12 mx-auto mb-1 md:mb-2" />
                  <p className="text-xs md:text-sm">Click to add image</p>
                </div>
              )}
            </div>
            
            {/* Caption */}
            <input
              type="text"
              placeholder="Add a caption"
              value={page.panels.find(p => p.id === 'caption1')?.content || ''}
              className="w-full bg-yellow-400 text-black p-1 md:p-2 rounded text-center border-0 focus:ring-2 focus:ring-yellow-500 text-xs md:text-sm"
              onChange={(e) => onTextChange(pageIndex, 'caption1', e.target.value)}
            />
          </>
        )}
        
        {/* Dedication Page (Page 1 Right) */}
        {pageIndex === 0 && isRightPage && (
          <textarea
            placeholder="Write your dedication here"
            value={page.panels.find(p => p.id === 'dedication')?.content || ''}
            className="w-full h-full bg-yellow-400 text-black p-2 md:p-4 rounded resize-none border-0 focus:ring-2 focus:ring-yellow-500 text-xs md:text-sm"
            onChange={(e) => onTextChange(pageIndex, 'dedication', e.target.value)}
          />
        )}
        
        {/* Page 2 Left - Full page image */}
        {pageIndex === 1 && isLeftPage && (
          <div className="w-full h-full bg-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors relative">
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={() => onImageClick(pageIndex, 'image2')}
            />
            {page.panels.find(p => p.id === 'image2')?.content ? (
              <img
                src={page.panels.find(p => p.id === 'image2')?.content}
                alt="Uploaded"
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="text-gray-500 text-center">
                <Upload className="w-12 h-12 mx-auto mb-2" />
                <p>Click to add image</p>
              </div>
            )}
          </div>
        )}
        
        {/* Page 2 Right - Two images with caption */}
        {pageIndex === 1 && isRightPage && (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex-1 bg-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors relative">
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => onImageClick(pageIndex, 'image3')}
              />
              {page.panels.find(p => p.id === 'image3')?.content ? (
                <img
                  src={page.panels.find(p => p.id === 'image3')?.content}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-gray-500 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-sm">Click to add image</p>
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Add a caption here"
              value={page.panels.find(p => p.id === 'caption2')?.content || ''}
              className="bg-yellow-400 text-black p-2 rounded text-center border-0 focus:ring-2 focus:ring-yellow-500"
              onChange={(e) => onTextChange(pageIndex, 'caption2', e.target.value)}
            />
            <div className="flex-1 bg-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors relative">
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => onImageClick(pageIndex, 'image4')}
              />
              {page.panels.find(p => p.id === 'image4')?.content ? (
                <img
                  src={page.panels.find(p => p.id === 'image4')?.content}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-gray-500 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-sm">Click to add image</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Page 3 - Single large image with caption */}
        {pageIndex === 2 && (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors relative mb-4">
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => onImageClick(pageIndex, 'image5')}
              />
              {page.panels.find(p => p.id === 'image5')?.content ? (
                <img
                  src={page.panels.find(p => p.id === 'image5')?.content}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-gray-500 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-2" />
                  <p>Click to add image</p>
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Add a caption here"
              value={page.panels.find(p => p.id === 'caption3')?.content || ''}
              className="bg-yellow-400 text-black p-2 rounded text-center border-0 focus:ring-2 focus:ring-yellow-500"
              onChange={(e) => onTextChange(pageIndex, 'caption3', e.target.value)}
            />
          </div>
        )}
        
        {/* Page 4 Left - Single image */}
        {pageIndex === 3 && isLeftPage && (
          <div className="w-full h-full bg-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors relative">
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={() => onImageClick(pageIndex, 'image6')}
            />
            {page.panels.find(p => p.id === 'image6')?.content ? (
              <img
                src={page.panels.find(p => p.id === 'image6')?.content}
                alt="Uploaded"
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="text-gray-500 text-center">
                <Upload className="w-12 h-12 mx-auto mb-2" />
                <p>Click to add image</p>
              </div>
            )}
          </div>
        )}
        
        {/* Page 4 Right - Two top images, one bottom image, caption */}
        {pageIndex === 3 && isRightPage && (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex space-x-4 flex-1">
              <div className="flex-1 bg-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors relative">
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => onImageClick(pageIndex, 'image7')}
                />
                {page.panels.find(p => p.id === 'image7')?.content ? (
                  <img
                    src={page.panels.find(p => p.id === 'image7')?.content}
                    alt="Uploaded"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-gray-500 text-center">
                    <Upload className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Add image</p>
                  </div>
                )}
              </div>
              <div className="flex-1 bg-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors relative">
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => onImageClick(pageIndex, 'image8')}
                />
                {page.panels.find(p => p.id === 'image8')?.content ? (
                  <img
                    src={page.panels.find(p => p.id === 'image8')?.content}
                    alt="Uploaded"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-gray-500 text-center">
                    <Upload className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Add image</p>
                  </div>
                )}
              </div>
            </div>
            <input
              type="text"
              placeholder="Add a caption here"
              value={page.panels.find(p => p.id === 'caption4')?.content || ''}
              className="bg-yellow-400 text-black p-2 rounded text-center border-0 focus:ring-2 focus:ring-yellow-500"
              onChange={(e) => onTextChange(pageIndex, 'caption4', e.target.value)}
            />
          </div>
        )}
        
        {/* Page 5 Left - Image with caption */}
        {pageIndex === 4 && isLeftPage && (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors relative mb-4">
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => onImageClick(pageIndex, 'image9')}
              />
              {page.panels.find(p => p.id === 'image9')?.content ? (
                <img
                  src={page.panels.find(p => p.id === 'image9')?.content}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-gray-500 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-2" />
                  <p>Click to add image</p>
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Add a caption here"
              value={page.panels.find(p => p.id === 'caption5')?.content || ''}
              className="bg-yellow-400 text-black p-2 rounded text-center border-0 focus:ring-2 focus:ring-yellow-500"
              onChange={(e) => onTextChange(pageIndex, 'caption5', e.target.value)}
            />
          </div>
        )}
        
        {/* Page 5 Right - Single image */}
        {pageIndex === 4 && isRightPage && (
          <div className="w-full h-full bg-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors relative">
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={() => onImageClick(pageIndex, 'image10')}
            />
            {pages[pageIndex]?.panels?.find(p => p.id === 'image10')?.content ? (
              <img
                src={pages[pageIndex].panels.find(p => p.id === 'image10')?.content}
                alt="Uploaded"
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  console.log('Image failed to load:', e.currentTarget.src);
                }}
              />
            ) : (
              <div className="text-gray-500 text-center">
                <Upload className="w-12 h-12 mx-auto mb-2" />
                <p>Click to add image</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}