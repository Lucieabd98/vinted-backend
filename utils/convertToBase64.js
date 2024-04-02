// Pour convertir l'image
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
}; // format visible par Cloudinary

module.exports = convertToBase64;
