import { GoogleGenAI } from "@google/genai";

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

const ai = new GoogleGenAI({});

export const geminiApiCall = async (videoUrl) => {
  if (!videoUrl) throw new Error("Video URL is required");

  const mimeType = getMimeType(videoUrl);

  const systemInstruction = `
    You are an expert video content analyzer. Determine the nature of the video:
    1. IF EDUCATIONAL: Provide comprehensive markdown notes with clear headings, bullet points, and a "Key Takeaways" section.
    2. IF NON-EDUCATIONAL: Provide a concise summary describing the mood, visual elements, and overall vibe.
".
  `;

  const chatResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        parts: [
          {
            fileData: {
              mimeType,
              fileUri: videoUrl, // ✅ pass Cloudinary URL directly
            },
          },
          {
            text: "Analyze this video according to your instructions.",
          },
        ],
      },
    ],
    config: { systemInstruction, temperature: 0.4 },
  });

  return chatResponse.text;
};
