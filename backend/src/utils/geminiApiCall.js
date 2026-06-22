import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import os from "os";

function getMimeType(url) {
  const cleanUrl = url.split("?")[0];
  const extension = cleanUrl.split(".").pop().toLowerCase();
  const mimeMap = {
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    webm: "video/webm",
    mkv: "video/x-matroska",
  };
  return mimeMap[extension] || "video/mp4";
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiApiCall = async (videoUrl) => {
  if (!videoUrl) throw new Error("Video URL is required");

  const cleanUrl = videoUrl.split("?")[0];
  let extension = cleanUrl.split(".").pop().toLowerCase();
  if (extension === cleanUrl || !extension) {
    extension = "mp4";
  }
  const mimeType = getMimeType(videoUrl);

  // 1. Download the video to a temp file
  const response = await fetch(videoUrl);
  const buffer = await response.arrayBuffer();
  const tempPath = path.join(os.tmpdir(), `video_${Date.now()}.${extension}`);
  fs.writeFileSync(tempPath, Buffer.from(buffer));

  let file;
  try {
    // 2. Upload to Gemini File API
    const uploaded = await ai.files.upload({
      file: tempPath,
      config: { mimeType },
    });

    // 3. Wait until file is ACTIVE
    file = await ai.files.get({ name: uploaded.name });
    while (file.state === "PROCESSING") {
      await new Promise((r) => setTimeout(r, 3000));
      file = await ai.files.get({ name: uploaded.name });
    }

    if (file.state === "FAILED") {
      throw new Error("Gemini file processing failed");
    }

    const systemInstruction = `
      You are an expert video content analyzer. Determine the nature of the video:
      1. IF EDUCATIONAL: Provide comprehensive markdown notes with clear headings, bullet points, and a "Key Takeaways" section.
      2. IF NON-EDUCATIONAL: Provide a concise summary describing the mood, visual elements, and overall vibe.
    `;

    // 4. Generate content using the uploaded file URI
    const chatResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            {
              fileData: {
                mimeType,
                fileUri: file.uri,
              },
            },
            { text: "Analyze this video according to your instructions." },
          ],
        },
      ],
      config: { systemInstruction, temperature: 0.4 },
    });

    return chatResponse.text;
  } finally {
    // 5. Clean up local temp file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    // 6. Clean up remote file in Gemini to free up quota
    if (file && file.name) {
      try {
        await ai.files.delete({ name: file.name });
      } catch (err) {
        console.error("Failed to delete remote file from Gemini API:", err);
      }
    }
  }
};
