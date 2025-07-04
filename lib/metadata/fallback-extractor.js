// Fallback metadata extractor using piexifjs for client-side processing
export const extractBasicMetadata = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Basic file information
        const basicInfo = {
          filename: file.name,
          size: file.size,
          type: file.type,
          lastModified: new Date(file.lastModified).toISOString(),
        };

        // Try to extract image dimensions
        const img = new Image();
        img.onload = () => {
          basicInfo.width = img.width;
          basicInfo.height = img.height;
          basicInfo.aspectRatio = (img.width / img.height).toFixed(2);
          resolve(basicInfo);
        };
        img.onerror = () => {
          resolve(basicInfo);
        };
        img.src = e.target.result;
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};