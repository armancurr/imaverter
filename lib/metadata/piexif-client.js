// Client-side metadata utilities using piexifjs
export const loadPiexif = async () => {
  if (typeof window !== 'undefined') {
    const piexif = await import('piexifjs');
    return piexif.default || piexif;
  }
  return null;
};

export const extractMetadataClient = async (file) => {
  try {
    const piexif = await loadPiexif();
    if (!piexif) throw new Error('Piexif not available on server');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const exifObj = piexif.load(e.target.result);
          resolve(exifObj);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    throw new Error(`Failed to extract metadata: ${error.message}`);
  }
};

export const stripMetadataClient = async (file) => {
  try {
    const piexif = await loadPiexif();
    if (!piexif) throw new Error('Piexif not available on server');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const removed = piexif.remove(e.target.result);
          resolve(removed);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    throw new Error(`Failed to strip metadata: ${error.message}`);
  }
};