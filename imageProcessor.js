const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

async function processImage(url, mimeType = "image/jpeg") {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    const prompt = `
      Describe this image in 2-3 sentences max and perform OCR to extract any text present.
      Return the data in the following JSON format:
      {
        "description": "Short description of the image (2-3 sentences max)",
        "ocr": "Extracted text or null if none found"
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: Buffer.from(buffer).toString("base64"),
          mimeType: mimeType,
        },
      },
    ]);

    const jsonResponse = JSON.parse(result.response.text());
    return jsonResponse;
  } catch (error) {
    if (error.message?.includes("safety") || error.message?.includes("blocked")) {
      return null;
    }
    throw error;
  }
}

module.exports = { processImage };
