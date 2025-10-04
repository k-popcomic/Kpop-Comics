import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Calendar,
  Send,
} from "lucide-react";
import { supabase, uploadImage } from "../lib/supabase";
import { ComicImage } from "../types";
import ImageCropModal from "./ImageCropModal";

interface ComicPage {
  id: string;
  layout: "single" | "double" | "triple";
  panels: ComicPanel[];
}

interface ComicPanel {
  id: string;
  type: "image" | "text" | "date";
  content: string;
  image?: File | string;
  placeholder: string;
  style: string;
}

const COMIC_LAYOUTS: ComicPage[] = [
  {
    id: "cover",
    layout: "single",
    panels: [
      {
        id: "title",
        type: "text",
        content: "",
        placeholder: "dont need to this",
        style: "title",
      },
      {
        id: "subtitle",
        type: "text",
        content: "",
        placeholder: "Add a subtitle",
        style: "subtitle",
      },
      {
        id: "date",
        type: "date",
        content: "3\nMar",
        placeholder: "3\nMar",
        style: "date",
      },
      {
        id: "coverImage",
        type: "image",
        content: "",
        placeholder: "Click to add image",
        style: "cover-image",
      },
      {
        id: "coverCaption",
        type: "text",
        content: "",
        placeholder: "Add a caption",
        style: "caption",
      },
    ],
  },
  {
    id: "message",
    layout: "single",
    panels: [
      {
        id: "messageText",
        type: "text",
        content: "",
        placeholder: "msage here",
        style: "message",
      },
    ],
  },
  {
    id: "page1",
    layout: "single",
    panels: [
      {
        id: "image1",
        type: "image",
        content: "",
        placeholder: "/",
        style: "top-full",
      },
      {
        id: "caption1",
        type: "text",
        content: "",
        placeholder: "caption",
        style: "caption-left",
      },
      {
        id: "image2",
        type: "image",
        content: "",
        placeholder: "2",
        style: "bottom-full",
      },
    ],
  },
  {
    id: "page2",
    layout: "single",
    panels: [
      {
        id: "image3",
        type: "image",
        content: "",
        placeholder: "3",
        style: "full-centered",
      },
      {
        id: "caption3",
        type: "text",
        content: "",
        placeholder: "caption",
        style: "caption-right",
      },
    ],
  },
  {
    id: "page3",
    layout: "single",
    panels: [
      {
        id: "image4",
        type: "image",
        content: "",
        placeholder: "4",
        style: "top-left",
      },
      {
        id: "image5",
        type: "image",
        content: "",
        placeholder: "5",
        style: "top-right",
      },
      {
        id: "image6",
        type: "image",
        content: "",
        placeholder: "6",
        style: "bottom-full",
      },
      {
        id: "caption6",
        type: "text",
        content: "",
        placeholder: "caption",
        style: "caption-right",
      },
    ],
  },
  {
    id: "page4",
    layout: "single",
    panels: [
      {
        id: "image7",
        type: "image",
        content: "",
        placeholder: "7",
        style: "top-full",
      },
      {
        id: "caption7",
        type: "text",
        content: "",
        placeholder: "caption",
        style: "caption-left",
      },
      {
        id: "image8",
        type: "image",
        content: "",
        placeholder: "8",
        style: "bottom-full",
      },
    ],
  },
  {
    id: "page5",
    layout: "single",
    panels: [
      {
        id: "image9",
        type: "image",
        content: "",
        placeholder: "9",
        style: "full-centered",
      },
      {
        id: "caption9",
        type: "text",
        content: "",
        placeholder: "caption",
        style: "caption-right",
      },
    ],
  },
  {
    id: "page6",
    layout: "single",
    panels: [
      {
        id: "image10",
        type: "image",
        content: "",
        placeholder: "/0",
        style: "top-full",
      },
      {
        id: "caption10",
        type: "text",
        content: "",
        placeholder: "caption",
        style: "caption-left",
      },
      {
        id: "image11",
        type: "image",
        content: "",
        placeholder: "/ /",
        style: "bottom-full",
      },
    ],
  },
  {
    id: "page7",
    layout: "single",
    panels: [
      {
        id: "image12",
        type: "image",
        content: "",
        placeholder: "/2",
        style: "top-full",
      },
      {
        id: "caption12",
        type: "text",
        content: "",
        placeholder: "caption",
        style: "caption-left",
      },
      {
        id: "image13",
        type: "image",
        content: "",
        placeholder: "/3",
        style: "bottom-left",
      },
      {
        id: "image14",
        type: "image",
        content: "",
        placeholder: "/4",
        style: "bottom-right",
      },
    ],
  },
  {
    id: "page8",
    layout: "single",
    panels: [
      {
        id: "image15",
        type: "image",
        content: "",
        placeholder: "/5",
        style: "full-centered",
      },
      {
        id: "caption15",
        type: "text",
        content: "",
        placeholder: "caption",
        style: "caption-left",
      },
    ],
  },
  {
    id: "page9",
    layout: "single",
    panels: [
      {
        id: "image16",
        type: "image",
        content: "",
        placeholder: "/6",
        style: "top-full",
      },
      {
        id: "caption16",
        type: "text",
        content: "",
        placeholder: "caption",
        style: "caption-left",
      },
      {
        id: "image17",
        type: "image",
        content: "",
        placeholder: "/7",
        style: "bottom-full",
      },
    ],
  },
  {
    id: "page10",
    layout: "single",
    panels: [
      {
        id: "image18",
        type: "image",
        content: "",
        placeholder: "/8",
        style: "full-centered",
      },
      {
        id: "caption18",
        type: "text",
        content: "",
        placeholder: "caption",
        style: "caption-left",
      },
    ],
  },
];

export default function ComicTemplate() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
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
    panelId: "",
    fileName: "",
  });

  useEffect(() => {
    if (customerId) {
      checkCustomer();
    }
  }, [customerId]);

  const checkCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("unique_code", customerId)
        .single();

      if (error || !data) {
        setCustomerExists(false);
      } else {
        setCustomerExists(true);
        await loadExistingSubmission();
      }
    } catch (error) {
      console.error("Error checking customer:", error);
      setCustomerExists(false);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingSubmission = async () => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setExistingSubmission(data);
        const restoredPages = [...pages];

        if (data.images && Array.isArray(data.images)) {
          data.images.forEach((img: any) => {
            for (
              let pageIndex = 0;
              pageIndex < restoredPages.length;
              pageIndex++
            ) {
              const panel = restoredPages[pageIndex].panels.find(
                (p) => p.id === img.id
              );
              if (panel) {
                panel.content = img.url;
                panel.image = img.url;
                break;
              }
            }
          });
        }

        if (data.title) {
          const titlePanel = restoredPages[0].panels.find(
            (p) => p.id === "title"
          );
          if (titlePanel) titlePanel.content = data.title;
        }

        if (data.description) {
          const subtitlePanel = restoredPages[0].panels.find(
            (p) => p.id === "subtitle"
          );
          if (subtitlePanel) subtitlePanel.content = data.description;
        }

        setPages(restoredPages);
      }
    } catch (error) {
      console.error("Error loading existing submission:", error);
    }
  };

  const handleImageClick = (pageIndex: number, panelId: string) => {
    setCropModal({
      isOpen: true,
      pageIndex,
      panelId,
      fileName: "",
    });
  };

  const handleCropComplete = (
    blob: Blob,
    pageIndex: number,
    panelId: string
  ) => {
    // Create a file from the blob
    const file = new File([blob], `${panelId}.jpg`, { type: "image/jpeg" });

    // Create a persistent data URL instead of blob URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;

      const newPages = [...pages];
      const panel = newPages[pageIndex].panels.find((p) => p.id === panelId);
      if (panel) {
        panel.image = file;
        panel.content = imageUrl; // Store data URL for persistence
      }
      setPages(newPages);
      saveDraft(newPages);
    };
    reader.readAsDataURL(blob);
  };

  const handleTextChange = (
    pageIndex: number,
    panelId: string,
    value: string
  ) => {
    const newPages = [...pages];
    const panel = newPages[pageIndex].panels.find((p) => p.id === panelId);
    if (panel) {
      panel.content = value;
    }
    setPages(newPages);
    saveDraft(newPages);
  };

  const handleDateChange = (
    pageIndex: number,
    panelId: string,
    day: string,
    month: string
  ) => {
    const newPages = [...pages];
    const panel = newPages[pageIndex].panels.find((p) => p.id === panelId);
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
      let title = "";
      let description = "";

      for (const page of currentPages) {
        for (const panel of page.panels) {
          if (panel.type === "image" && panel.content && panel.image) {
            images.push({
              id: panel.id,
              url: panel.content, // Always use the content (data URL or uploaded URL)
              caption: "",
              order_index: imageIndex++,
              file_name: `${panel.id}.jpg`,
              file_size: typeof panel.image === "object" ? panel.image.size : 0,
            });
          } else if (panel.id === "title" && panel.content) {
            title = panel.content;
          } else if (panel.id === "subtitle" && panel.content) {
            description = panel.content;
          }
        }
      }

      const draftData = {
        customer_id: customerId!,
        title: title || "Draft Comic",
        description: description || "",
        date: new Date().toISOString().split("T")[0],
        images: images,
        status: "draft" as const,
      };

      if (existingSubmission) {
        await supabase
          .from("submissions")
          .update(draftData)
          .eq("id", existingSubmission.id);
      } else {
        const { data } = await supabase
          .from("submissions")
          .insert([draftData])
          .select()
          .single();

        if (data) {
          setExistingSubmission(data);
        }
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const handleSubmit = async () => {
    if (
      !confirm(
        "Are you ready to submit your comic? This will lock it temporarily for processing."
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      // Upload any new images that are still File objects
      const updatedPages = [...pages];
      for (let pageIndex = 0; pageIndex < updatedPages.length; pageIndex++) {
        for (
          let panelIndex = 0;
          panelIndex < updatedPages[pageIndex].panels.length;
          panelIndex++
        ) {
          const panel = updatedPages[pageIndex].panels[panelIndex];
          if (panel.type === "image" && panel.image instanceof File) {
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
          if (panel.type === "image" && panel.content && panel.content !== "") {
            images.push({
              id: panel.id,
              url: panel.content,
              caption: "",
              order_index: imageIndex++,
              file_name: `${panel.id}.jpg`,
              file_size: 0,
            });
          }
        }
      }

      const submissionData = {
        title:
          updatedPages[0].panels.find((p) => p.id === "title")?.content ||
          "Comic Submission",
        description:
          updatedPages[0].panels.find((p) => p.id === "subtitle")?.content ||
          "",
        date: new Date().toISOString().split("T")[0],
        images: images,
        status: "submitted" as const,
      };

      if (existingSubmission) {
        // Update existing submission
        const { error } = await supabase
          .from("submissions")
          .update(submissionData)
          .eq("id", existingSubmission.id);

        if (error) throw error;
      } else {
        // Create new submission (this should rarely happen)
        const { error } = await supabase.from("submissions").insert([
          {
            customer_id: customerId!,
            ...submissionData,
          },
        ]);

        if (error) throw error;
      }

      alert(
        "Comic submitted successfully! Your comic is now locked temporarily for processing. Contact Alex if you need to make changes."
      );
      navigate("/");
    } catch (error) {
      console.error("Error submitting comic:", error);
      alert("Error submitting comic. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center text-white">
        <div className="mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
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
          <p className="text-gray-600">
            This upload link is not valid or has expired.
          </p>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 md:p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg md:text-xl font-bold mb-4">
            Welcome to your comic template! Please follow the guidelines below
            so we has everything he needs to make your comic look great! If you
            have any questions just reply to my email and I'll get back to you
          </h1>
          <div className="bg-white/10 rounded-lg p-3 md:p-4 mb-4">
            <h2 className="text-base md:text-lg font-bold mb-3">Guidelines</h2>
            <ol className="space-y-2 text-xs md:text-sm">
              <li>
                <span className="font-semibold">1.</span> Look through the
                template to{" "}
                <span className="font-semibold">
                  familiarise yourself with the format
                </span>{" "}
                and plan what images and text go where. Think about the shape of
                the image box and the shape of the photo you want (landscape
                shape with a landscape image).
              </li>
              <li>
                <span className="font-semibold">2.</span>{" "}
                <span className="font-semibold">Choose your images</span> (avoid
                dark and low resolution ones) and save them to a folder on your
                PC or phone with an easy to recognise name. It's easier for us
                to work with good quality images so use them if you can.
              </li>
              <li>
                <span className="font-semibold">3.</span> To{" "}
                <span className="font-semibold">upload images</span>, tap or
                right click on the image box, choose the folder the image is in
                and select it. Then resize or crop it as you see fit.
              </li>
              <li>
                <span className="font-semibold">4.</span> To write{" "}
                <span className="font-semibold">your captions</span>, just tap
                or click on the box and type it out. You can leave the boxes
                blank if you don't want to write anything.
              </li>
              <li>
                <span className="font-semibold">5.</span> You can{" "}
                <span className="font-semibold">add your special date</span> to
                the cover by clicking on the date box saying 1 Sep in the top
                right hand corner and selecting the day and month.
              </li>
              <li>
                <span className="font-semibold">6.</span>{" "}
                <span className="font-semibold">
                  Only use images that are yours
                </span>{" "}
                or that you have permission to use. Photos are fine, but{" "}
                <span className="font-semibold">
                  we're not allowed to print images that belong to Disney for
                  example.
                </span>
              </li>
              <li>
                <span className="font-semibold">7.</span> To{" "}
                <span className="font-semibold">submit your comic</span>, just
                tick the box at the end of the comic when you've uploaded all
                your images. This will lock your comic temporarily so{" "}
                <span className="font-semibold">we</span> can work from that
                version. Don\'t worry though,{" "}
                <span className="font-semibold">we</span> can always unlock it
                if you need to change anything!
              </li>
            </ol>
          </div>

          <button
            onClick={() => setShowWelcome(false)}
            className="bg-yellow-400 text-black px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base hover:bg-yellow-300 transition-colors"
          >
            Start uploading!
          </button>
        </div>
      </div>
    );
  }

  const currentPageData = pages[currentPage];

  return (
    <div className="h-screen w-screen bg-gray-200 flex items-center justify-center overflow-hidden relative">
      <div className="w-full h-full flex flex-col items-center justify-center">
        {/* Navigation */}
        <div className="flex items-center justify-center mb-4 md:mb-6 relative">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 1}
            className="fixed left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-red-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          <button
            onClick={() =>
              setCurrentPage(Math.min(pages.length - 1, currentPage + 1))
            }
            disabled={currentPage === pages.length - 1}
            className="fixed right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-red-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        </div>

        {/* Comic Pages */}
        <div className="flex justify-center space-x-2 md:space-x-8 px-16 md:px-0">
          <ComicPageRenderer
            page={currentPageData}
            pageIndex={currentPage}
            pages={pages}
            onImageClick={handleImageClick}
            onTextChange={handleTextChange}
            onDateChange={handleDateChange}
            layout={currentPageData.layout}
          />
        </div>

        {/* Submit Button */}
        {currentPage === pages.length - 1 && (
          <div className="flex justify-center mt-6">
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
              <span>{submitting ? "Submitting..." : "Submit Comic"}</span>
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
  onDateChange: (
    pageIndex: number,
    panelId: string,
    day: string,
    month: string
  ) => void;
  isLeftPage?: boolean;
  isRightPage?: boolean;
  layout?: string;
}

function ComicPageRenderer({
  page,
  pageIndex,
  onImageClick,
  onTextChange,
  onDateChange,
}: ComicPageRendererProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State for calendar date picker
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  return (
    <div className="relative w-[768px] h-[calc(100vh-100px)] mx-auto">
      <div className="h-full p-2 md:p-4 relative">
        {pageIndex === 1 && (
          <div
            className="flex gap-6 justify-between"
            style={{ width: "768px", height: "85vh", maxHeight: "900px" }}
          >
            {/* LEFT BOX */}
            <div className="relative flex-1 bg-white border-8 border-black shadow-2xl rounded p-4 flex flex-col pt-20">
              {/* Date box */}
              <div
                className="absolute top-4 right-4 bg-yellow-400 text-black p-2 rounded text-center font-bold cursor-pointer hover:bg-yellow-300 z-10"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <div className="text-xl">
                  {page.panels
                    .find((p) => p.id === "date")
                    ?.content?.split("\n")[0] || "3"}
                </div>
                <div className="text-sm">
                  {page.panels
                    .find((p) => p.id === "date")
                    ?.content?.split("\n")[1] || "Mar"}
                </div>
              </div>

              {/* Calendar Date Picker Modal */}
              {showDatePicker && (
                <div className="absolute top-20 right-4 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-xl z-20 w-80">
                  {/* Month/Year Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => {
                        if (currentMonth === 0) {
                          setCurrentMonth(11);
                          setCurrentYear(currentYear - 1);
                        } else {
                          setCurrentMonth(currentMonth - 1);
                        }
                      }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="font-bold text-lg">
                      {
                        [
                          "January",
                          "February",
                          "March",
                          "April",
                          "May",
                          "June",
                          "July",
                          "August",
                          "September",
                          "October",
                          "November",
                          "December",
                        ][currentMonth]
                      }{" "}
                      {currentYear}
                    </div>
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => {
                        if (currentMonth === 11) {
                          setCurrentMonth(0);
                          setCurrentYear(currentYear + 1);
                        } else {
                          setCurrentMonth(currentMonth + 1);
                        }
                      }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Day Labels */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-semibold text-gray-600 p-1"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const firstDay = new Date(
                        currentYear,
                        currentMonth,
                        1
                      ).getDay();
                      const daysInMonth = new Date(
                        currentYear,
                        currentMonth + 1,
                        0
                      ).getDate();
                      const days = [];

                      // Empty cells for days before month starts
                      for (let i = 0; i < firstDay; i++) {
                        days.push(
                          <div key={`empty-${i}`} className="p-2"></div>
                        );
                      }

                      // Calendar days
                      for (let day = 1; day <= daysInMonth; day++) {
                        const isSelected =
                          selectedDate.getDate() === day &&
                          selectedDate.getMonth() === currentMonth &&
                          selectedDate.getFullYear() === currentYear;
                        days.push(
                          <button
                            key={day}
                            className={`p-2 text-center rounded hover:bg-blue-100 transition-colors ${
                              isSelected
                                ? "bg-blue-500 text-white font-bold"
                                : "text-gray-700"
                            }`}
                            onClick={() => {
                              const newDate = new Date(
                                currentYear,
                                currentMonth,
                                day
                              );
                              setSelectedDate(newDate);
                              const monthNames = [
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec",
                              ];
                              onDateChange(
                                pageIndex,
                                "date",
                                day.toString(),
                                monthNames[currentMonth]
                              );
                              setShowDatePicker(false);
                            }}
                          >
                            {day}
                          </button>
                        );
                      }

                      return days;
                    })()}
                  </div>

                  {/* Today Button */}
                  <button
                    className="mt-4 bg-gray-200 hover:bg-gray-300 text-black px-3 py-2 rounded text-sm w-full font-medium"
                    onClick={() => {
                      const today = new Date();
                      setSelectedDate(today);
                      setCurrentMonth(today.getMonth());
                      setCurrentYear(today.getFullYear());
                      const monthNames = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ];
                      onDateChange(
                        pageIndex,
                        "date",
                        today.getDate().toString(),
                        monthNames[today.getMonth()]
                      );
                      setShowDatePicker(false);
                    }}
                  >
                    Today
                  </button>
                </div>
              )}

              {/* title */}
              <input
                type="text"
                placeholder="Add a title"
                className="w-3/4 bg-yellow-400 text-black p-2 rounded text-center mb-4 border-0 focus:ring-2 focus:ring-yellow-500"
                onChange={(e) =>
                  onTextChange(pageIndex, "title", e.target.value)
                }
              />

              <div className="flex-1 w-full max-w-xl bg-white p-3 border-8 border-black shadow-2xl mb-6 overflow-hidden">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center relative cursor-pointer">
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => onImageClick(pageIndex, "coverImage")}
                  />
                  {page.panels.find((p) => p.id === "coverImage")?.content ? (
                    <img
                      src={
                        page.panels.find((p) => p.id === "coverImage")?.content
                      }
                      alt="Uploaded"
                      className="w-full h-full object-cover comic-image"
                    />
                  ) : (
                    <div className="text-gray-500 text-center">
                      <Upload className="w-16 h-16 mx-auto mb-2" />
                      <p>Click to add image</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Caption */}
              <input
                type="text"
                placeholder="Add a caption"
                className="w-full bg-yellow-400 text-black p-2 rounded text-center border-0 focus:ring-2 focus:ring-yellow-500"
                onChange={(e) =>
                  onTextChange(pageIndex, "coverCaption", e.target.value)
                }
              />
            </div>

            {/* ✅ RIGHT BOX — message input */}
            <div className="flex-1  border-8 border-black text-white shadow-2xl rounded p-4 flex flex-col">
              <textarea
                placeholder="Message here"
                value={
                  page.panels.find((p) => p.id === "messageText")?.content || ""
                }
                className="w-full h-full bg-blue-600 flex items-center justify-center p-8 text-white"
                onChange={(e) =>
                  onTextChange(pageIndex, "messageText", e.target.value)
                }
              />
            </div>
          </div>
        )}

        {pageIndex === 2 && (
          <div className="h-full flex flex-row gap-3">
            {/* Image 1 with caption bottom-left */}
            <div className="relative flex-[2] bg-white p-3 border-8 border-black shadow-2xl cursor-pointer transition-colors overflow-hidden">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 cursor-pointer z-10"
                  onClick={() => onImageClick(pageIndex, "image1")}
                />
                {page.panels.find((p) => p.id === "image1")?.content ? (
                  <img
                    src={page.panels.find((p) => p.id === "image1")?.content}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl font-thin text-gray-600">
                    <Upload className="w-16 h-16" />
                  </div>
                )}
                {/* Caption box bottom-left */}
                <input
                  type="text"
                  placeholder="Add a caption here"
                  value={
                    page.panels.find((p) => p.id === "caption1")?.content || ""
                  }
                  className="absolute bottom-2 left-2 bg-yellow-400 border-2 border-black px-3 py-1 text-sm font-bold z-20"
                  onChange={(e) =>
                    onTextChange(pageIndex, "caption1", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Image 2 - Full width */}
            <div className="relative flex-[2] bg-white p-3 border-8 border-black shadow-2xl cursor-pointer transition-colors overflow-hidden">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => onImageClick(pageIndex, "image2")}
                />
                {page.panels.find((p) => p.id === "image2")?.content ? (
                  <img
                    src={page.panels.find((p) => p.id === "image2")?.content}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl font-thin text-gray-600">
                    <Upload className="w-16 h-16" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {pageIndex === 3 && (
          <div className="h-full bg-white p-3 border-8 border-black shadow-2xl overflow-hidden">
            <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
              <div
                className="absolute inset-0 cursor-pointer z-10"
                onClick={() => onImageClick(pageIndex, "image3")}
              />
              {page.panels.find((p) => p.id === "image3")?.content ? (
                <img
                  src={page.panels.find((p) => p.id === "image3")?.content}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-6xl font-thin text-gray-600">
                  <Upload className="w-16 h-16" />
                </div>
              )}
              {/* Caption box bottom-right */}
              <input
                type="text"
                placeholder="Add a caption here"
                value={
                  page.panels.find((p) => p.id === "caption3")?.content || ""
                }
                className="absolute bottom-2 right-2 bg-yellow-400 border-2 border-black px-3 py-1 text-sm font-bold z-20"
                onChange={(e) =>
                  onTextChange(pageIndex, "caption3", e.target.value)
                }
              />
            </div>
          </div>
        )}

        {pageIndex === 4 && (
          <div className="h-full flex flex-col gap-3">
            {/* Top row: 2 vertical images */}
            <div className="flex gap-3 flex-[2]">
              {/* Image 4 */}
              <div className="flex-1 bg-white p-3 border-8 border-black shadow-2xl overflow-hidden rounded-lg">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center relative overflow-hidden rounded-md">
                  <div
                    className="absolute inset-0 cursor-pointer z-10"
                    onClick={() => onImageClick(pageIndex, "image4")}
                  />
                  {page.panels.find((p) => p.id === "image4")?.content ? (
                    <img
                      src={page.panels.find((p) => p.id === "image4")?.content}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <Upload className="w-16 h-16" />
                    </div>
                  )}
                </div>
              </div>

              {/* Image 5 */}
              <div className="flex-1 bg-white p-3 border-8 border-black shadow-2xl overflow-hidden rounded-lg">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center relative overflow-hidden rounded-md">
                  <div
                    className="absolute inset-0 cursor-pointer z-10"
                    onClick={() => onImageClick(pageIndex, "image5")}
                  />
                  {page.panels.find((p) => p.id === "image5")?.content ? (
                    <img
                      src={page.panels.find((p) => p.id === "image5")?.content}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <Upload className="w-16 h-16" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom: 1 horizontal image with caption */}
            <div className="relative flex-[2] bg-white p-3 border-8 border-black shadow-2xl overflow-hidden rounded-lg">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center relative overflow-hidden rounded-md">
                <div
                  className="absolute inset-0 cursor-pointer z-10"
                  onClick={() => onImageClick(pageIndex, "image6")}
                />
                {page.panels.find((p) => p.id === "image6")?.content ? (
                  <img
                    src={page.panels.find((p) => p.id === "image6")?.content}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <Upload className="w-16 h-16" />
                  </div>
                )}
                {/* Caption box bottom-right */}
                <input
                  type="text"
                  placeholder="Add a caption here"
                  value={
                    page.panels.find((p) => p.id === "caption6")?.content || ""
                  }
                  className="absolute bottom-2 right-2 bg-yellow-400 border-2 border-black px-3 py-1 text-sm font-bold z-20"
                  onChange={(e) =>
                    onTextChange(pageIndex, "caption6", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {pageIndex === 5 && (
          <div className="h-full flex flex-row gap-3">
            {/* Image 7 with caption bottom-left */}
            <div className="relative flex-[2] bg-white p-3 border-8 border-black shadow-2xl overflow-hidden">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 cursor-pointer z-10"
                  onClick={() => onImageClick(pageIndex, "image7")}
                />
                {page.panels.find((p) => p.id === "image7")?.content ? (
                  <img
                    src={page.panels.find((p) => p.id === "image7")?.content}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <Upload className="w-16 h-16" />
                  </div>
                )}
                {/* Caption box bottom-left */}
                <input
                  type="text"
                  placeholder="Add a caption here"
                  value={
                    page.panels.find((p) => p.id === "caption7")?.content || ""
                  }
                  className="absolute bottom-2 left-2 bg-yellow-400 border-2 border-black px-3 py-1 text-sm font-bold z-20"
                  onChange={(e) =>
                    onTextChange(pageIndex, "caption7", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Image 8 - Full width */}
            <div className="relative flex-[2] bg-white p-3 border-8 border-black shadow-2xl overflow-hidden">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => onImageClick(pageIndex, "image8")}
                />
                {page.panels.find((p) => p.id === "image8")?.content ? (
                  <img
                    src={page.panels.find((p) => p.id === "image8")?.content}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <Upload className="w-16 h-16" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {pageIndex === 6 && (
          <div className="h-full relative bg-white border-8 border-black shadow-2xl p-3 overflow-hidden">
            <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
              <div
                className="absolute inset-0 cursor-pointer z-10"
                onClick={() => onImageClick(pageIndex, "image9")}
              />
              {page.panels.find((p) => p.id === "image9")?.content ? (
                <img
                  src={page.panels.find((p) => p.id === "image9")?.content}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400">
                  <Upload className="w-16 h-16" />
                </div>
              )}
              {/* Caption box bottom-right */}
              <input
                type="text"
                placeholder="Add a caption here"
                value={
                  page.panels.find((p) => p.id === "caption9")?.content || ""
                }
                className="absolute bottom-2 right-2 bg-yellow-400 border-2 border-black px-3 py-1 text-sm font-bold z-20"
                onChange={(e) =>
                  onTextChange(pageIndex, "caption9", e.target.value)
                }
              />
            </div>
          </div>
        )}

        {pageIndex === 7 && (
          <div className="h-full flex flex-row gap-3">
            {/* Image 10 with caption bottom-left */}
            <div className="relative flex-[2] bg-white p-3 border-8 border-black shadow-2xl overflow-hidden">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 cursor-pointer z-10"
                  onClick={() => onImageClick(pageIndex, "image10")}
                />
                {page.panels.find((p) => p.id === "image10")?.content ? (
                  <img
                    src={page.panels.find((p) => p.id === "image10")?.content}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <Upload className="w-16 h-16" />
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Add a caption here"
                  value={
                    page.panels.find((p) => p.id === "caption10")?.content || ""
                  }
                  className="absolute bottom-2 left-2 bg-yellow-400 border-2 border-black px-3 py-1 text-sm font-bold z-20"
                  onChange={(e) =>
                    onTextChange(pageIndex, "caption10", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Image 11 - Full width */}
            <div className="relative flex-[2] bg-white p-3 border-8 border-black shadow-2xl overflow-hidden">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => onImageClick(pageIndex, "image11")}
                />
                {page.panels.find((p) => p.id === "image11")?.content ? (
                  <img
                    src={page.panels.find((p) => p.id === "image11")?.content}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <Upload className="w-16 h-16" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {pageIndex === 8 && (
          <div className="h-full flex flex-col gap-3">
            {/* Image 12 with caption bottom-left */}
            <div className="relative flex-[2] bg-white p-3 border-8 border-black shadow-2xl overflow-hidden">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 cursor-pointer z-10"
                  onClick={() => onImageClick(pageIndex, "image12")}
                />
                {page.panels.find((p) => p.id === "image12")?.content ? (
                  <img
                    src={page.panels.find((p) => p.id === "image12")?.content}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <Upload className="w-16 h-16" />
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Add a caption here"
                  value={
                    page.panels.find((p) => p.id === "caption12")?.content || ""
                  }
                  className="absolute bottom-2 left-2 bg-yellow-400 border-2 border-black px-3 py-1 text-sm font-bold z-20"
                  onChange={(e) =>
                    onTextChange(pageIndex, "caption12", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Bottom row: 2 images side by side */}
            <div className="flex gap-3 flex-[2]">
              <div className="flex-1 bg-white p-3 border-8 border-black shadow-2xl overflow-hidden">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => onImageClick(pageIndex, "image13")}
                  />
                  {page.panels.find((p) => p.id === "image13")?.content ? (
                    <img
                      src={page.panels.find((p) => p.id === "image13")?.content}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <Upload className="w-16 h-16" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 bg-white p-3 border-8 border-black shadow-2xl overflow-hidden">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => onImageClick(pageIndex, "image14")}
                  />
                  {page.panels.find((p) => p.id === "image14")?.content ? (
                    <img
                      src={page.panels.find((p) => p.id === "image14")?.content}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <Upload className="w-16 h-16" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {pageIndex === 9 && (
          <div className="h-full relative bg-white border-8 border-black shadow-2xl p-3 overflow-hidden">
            <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
              <div
                className="absolute inset-0 cursor-pointer z-10"
                onClick={() => onImageClick(pageIndex, "image15")}
              />
              {page.panels.find((p) => p.id === "image15")?.content ? (
                <img
                  src={page.panels.find((p) => p.id === "image15")?.content}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400">
                  <Upload className="w-16 h-16" />
                </div>
              )}
              <input
                type="text"
                placeholder="Add a caption here"
                value={
                  page.panels.find((p) => p.id === "caption15")?.content || ""
                }
                className="absolute bottom-2 left-2 bg-yellow-400 border-2 border-black px-3 py-1 text-sm font-bold z-20"
                onChange={(e) =>
                  onTextChange(pageIndex, "caption15", e.target.value)
                }
              />
            </div>
          </div>
        )}

        {pageIndex === 10 && (
          <div className="h-full flex flex-row gap-3">
            {/* Image 16 with caption bottom-left */}
            <div className="relative flex-[2] bg-white p-3 border-8 border-black shadow-2xl overflow-hidden">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 cursor-pointer z-10"
                  onClick={() => onImageClick(pageIndex, "image16")}
                />
                {page.panels.find((p) => p.id === "image16")?.content ? (
                  <img
                    src={page.panels.find((p) => p.id === "image16")?.content}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <Upload className="w-16 h-16" />
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Add a caption here"
                  value={
                    page.panels.find((p) => p.id === "caption16")?.content || ""
                  }
                  className="absolute bottom-2 left-2 bg-yellow-400 border-2 border-black px-3 py-1 text-sm font-bold z-20"
                  onChange={(e) =>
                    onTextChange(pageIndex, "caption16", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Image 17 - Full width */}
            <div className="relative flex-[2] bg-white p-3 border-8 border-black shadow-2xl overflow-hidden">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => onImageClick(pageIndex, "image17")}
                />
                {page.panels.find((p) => p.id === "image17")?.content ? (
                  <img
                    src={page.panels.find((p) => p.id === "image17")?.content}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <Upload className="w-16 h-16" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {pageIndex === 11 && (
          <div className="h-full relative bg-white border-8 border-black shadow-2xl p-3 overflow-hidden">
            <div className="w-full h-full bg-gray-300 flex items-center justify-center relative">
              <div
                className="absolute inset-0 cursor-pointer z-10"
                onClick={() => onImageClick(pageIndex, "image18")}
              />
              {page.panels.find((p) => p.id === "image18")?.content ? (
                <img
                  src={page.panels.find((p) => p.id === "image18")?.content}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400">
                  <Upload className="w-16 h-16" />
                </div>
              )}
              <input
                type="text"
                placeholder="Add a caption here"
                value={
                  page.panels.find((p) => p.id === "caption18")?.content || ""
                }
                className="absolute bottom-2 left-2 bg-yellow-400 border-2 border-black px-3 py-1 text-sm font-bold z-20"
                onChange={(e) =>
                  onTextChange(pageIndex, "caption18", e.target.value)
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
