const fs = require("fs");
const path = require("path");
const isValidPDF = require("../../utils/validatePDF");

describe("🔍 isValidPDF utility", () => {
  const validPDFPath = path.join(__dirname, "../test-files/valid.pdf");
  const invalidPDFPath = path.join(__dirname, "../test-files/fake.txt");

  beforeAll(() => {
    // Create a mock valid PDF file
    fs.writeFileSync(validPDFPath, "%PDF-1.4 Mock PDF content", "utf8");

    // Create a mock non-PDF file
    fs.writeFileSync(invalidPDFPath, "Just some text", "utf8");
  });

  afterAll(() => {
    fs.unlinkSync(validPDFPath);
    fs.unlinkSync(invalidPDFPath);
  });

  it("✅ should return true for valid PDF file", () => {
    expect(isValidPDF(validPDFPath)).toBe(true);
  });

  it("❌ should return false for non-PDF file", () => {
    expect(isValidPDF(invalidPDFPath)).toBe(false);
  });
});
