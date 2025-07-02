import { create } from "zustand";

const useFileStore = create((set) => ({
  file: null,
  preview: null,
  dragActive: false,
  uploadedFrom: null,

  setFile: (file) => set({ file }),

  setPreview: (preview) => set({ preview }),

  setDragActive: (dragActive) => set({ dragActive }),

  setUploadedFrom: (tab) => set({ uploadedFrom: tab }),

  clearFile: () =>
    set({
      file: null,
      preview: null,
      dragActive: false,
      uploadedFrom: null,
    }),

  handleFileSelection: (selectedFile, maxSizeInMB = 10) => {
    if (!selectedFile) {
      set({ file: null, preview: null });
      return { success: false, error: null };
    }

    if (selectedFile.size > maxSizeInMB * 1024 * 1024) {
      return {
        success: false,
        error: `File size exceeds ${maxSizeInMB}MB.`,
      };
    }

    set({ file: selectedFile });

    const reader = new FileReader();
    reader.onload = (e) => {
      set({ preview: e.target.result });
    };
    reader.readAsDataURL(selectedFile);

    return { success: true, error: null };
  },
}));

export default useFileStore;
