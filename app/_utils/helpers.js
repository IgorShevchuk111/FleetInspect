export const convertBase64ToFile = (base64String, filename) => {
  const base64Data = base64String.split(',')[1];
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset++) {
    byteArrays.push(byteCharacters.charCodeAt(offset));
  }
  const byteArray = new Uint8Array(byteArrays);
  return new File([byteArray], filename, { type: 'image/png' });
};
