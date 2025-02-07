import imageCompression from 'browser-image-compression';

export async function compressImage(file) {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Image compression error:', error);
    return file;
  }
}
