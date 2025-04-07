const fs = require("fs");

// Check if the file starts with the %PDF signature (magic number)
function isValidPDF(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    return buffer.slice(0, 4).toString() === "%PDF";
  } catch (err) {
    console.error("Error reading file for PDF validation:", err.message);
    return false;
  }
}

module.exports = isValidPDF;
