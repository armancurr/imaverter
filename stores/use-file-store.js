import { create } from "zustand";

const useFileStore = create((set) => ({
  file: null,
  preview: null,
  dragActive: false,
  uploadedFrom: null,
  
  // Multi-file support for convert feature
  convertFiles: [],
  convertPreviews: [],

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

  // Multi-file convert methods
  addConvertFile: (file) => {
    set((state) => {
      const MAX_CONVERT_FILES = 3;
      if (state.convertFiles.length >= MAX_CONVERT_FILES) {
        return state; // Don't add if at max
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        set((currentState) => ({
          convertPreviews: [...currentState.convertPreviews, e.target.result],
        }));
      };
      reader.readAsDataURL(file);

      return {
        convertFiles: [...state.convertFiles, file],
      };
    });
  },

  removeConvertFile: (index) => {
    set((state) => ({
      convertFiles: state.convertFiles.filter((_, i) => i !== index),
      convertPreviews: state.convertPreviews.filter((_, i) => i !== index),
    }));
  },

  clearConvertFiles: () =>
    set({
      convertFiles: [],
      convertPreviews: [],
    }),

  handleMultipleConvertFiles: (files, maxSizeInMB = 10) => {
    const validFiles = [];
    const errors = [];
    const MAX_CONVERT_FILES = 3;

    // Get current state
    const currentCount = useFileStore.getState().convertFiles.length;
    const availableSlots = MAX_CONVERT_FILES - currentCount;

    Array.from(files).slice(0, availableSlots).forEach((file, index) => {
      if (file.size > maxSizeInMB * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds ${maxSizeInMB}MB`);
        return;
      }

      // Check if file type is image
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Invalid file type`);
        return;
      }

      validFiles.push(file);
    });

    // Add valid files
    validFiles.forEach((file) => {
      useFileStore.getState().addConvertFile(file);
    });

    if (files.length > availableSlots) {
      errors.push(`Only ${availableSlots} more files can be added (maximum 3 total)`);
    }

    return {
      success: validFiles.length > 0,
      error: errors.length > 0 ? errors.join(', ') : null,
      addedCount: validFiles.length,
    };
  },

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

  // For convert feature - handle single file by adding it to convertFiles
  handleConvertFileSelection: (selectedFile, maxSizeInMB = 10) => {
    if (!selectedFile) {
      return { success: false, error: null };
    }

    if (selectedFile.size > maxSizeInMB * 1024 * 1024) {
      return {
        success: false,
        error: `File size exceeds ${maxSizeInMB}MB.`,
      };
    }

    if (!selectedFile.type.startsWith('image/')) {
      return {
        success: false,
        error: "Please select an image file",
      };
    }

    const currentState = useFileStore.getState();
    const MAX_CONVERT_FILES = 3;
    
    if (currentState.convertFiles.length >= MAX_CONVERT_FILES) {
      return {
        success: false,
        error: `Maximum ${MAX_CONVERT_FILES} images allowed`,
      };
    }

    // Add to convertFiles array
    currentState.addConvertFile(selectedFile);

    return { success: true, error: null };
  },
}));

export default useFileStore;
