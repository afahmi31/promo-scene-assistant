import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini Client
const aiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (aiKey) {
  ai = new GoogleGenAI({
    apiKey: aiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to check for API Key
function checkGeminiClient() {
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables. Please set it in the Settings secrets panel.");
  }
}

// 1. generateScenePlan
app.post("/api/generate-scene-plan", async (req, res) => {
  try {
    checkGeminiClient();
    const { productBrief, videoSetup } = req.body;

    const systemPrompt = `You are an expert Indonesian AI promotional video director. 
You will generate a structured storyboard scene plan for product promotion.
The output MUST be a strict, valid JSON object matching the JSON schema below.
Language: Use Indonesian for: title, goal, description, and focusMessage.
Visual details and prompts can be in English for model/image rendering tools (like Midjourney, Stable Diffusion/Imagen).
Do not propose avatar voice libraries, prebuilt characters, or voice avatars. The system is product-focused.
If useModelReference is true, use the uploaded model as active presenter/subject.
If useModelReference is false, make scenes strictly product-first and close-up.
If useBackgroundReference is true, direct scenes to follow the requested background.
Reference fidelity is more important than aesthetic improvement.
If the uploaded model reference is an avatar, Bitmoji, cartoon, illustration, sticker, vector, flat 2D character, or any non-photoreal style, preserve that original medium and visual style exactly.
Never reinterpret a referenced 2D avatar as 3D, semi-3D, realistic, cinematic-human, or painterly.
Total scenes count MUST exactly match: ${videoSetup.sceneCount}.
Estimated total duration: ${videoSetup.totalDuration} seconds. Divide duration logically across the scenes (each scene usually 2s to 6s depending on scene complexity and goal).`;

    const prompt = `Based on below Product information and Video Setup, suggest ${videoSetup.sceneCount} scenes.
Product Brief:
- Name: ${productBrief.productName}
- Category: ${productBrief.productCategory}
- Description: ${productBrief.productDescription}
- Benefits for Narration: ${productBrief.benefits}
- Highlights for Overlay: ${productBrief.keyPoints}
- Problem Solved: ${productBrief.problemSolved}
- Target Audience: ${productBrief.targetAudience || "General"}
- Special Notes: ${productBrief.specialNotes || "None"}

Video Setup:
- Platform: ${videoSetup.platform}
- Duration limit: ${videoSetup.totalDuration}s
- Aspect Ratio: ${videoSetup.aspectRatio}
- Visual Preset Mode: ${videoSetup.visualPreset} (Marketplace Clean, Product Premium, Home Lifestyle, Product Detail, Character / Presenter Promo)
- Use Model Ref: ${videoSetup.useModelReference}
- Model Type: ${videoSetup.modelType || "None"}
- Model Usage: ${videoSetup.modelUsage || "None"}
- Model Info: ${videoSetup.modelReferenceNotes || "None"}
- Use Background Ref: ${videoSetup.useBackgroundReference}
- Background Info: ${videoSetup.backgroundReferenceNotes || "None"}
- Narration Tone: ${videoSetup.narrationTone}
- CTA Type: ${videoSetup.ctaType}

Return a valid JSON object matching exactly this structure:
{
  "scenes": [
    {
      "order": 1,
      "title": "Scene short title in Indonesian (e.g. Opening / Hook, Tunjukkan Masalah)",
      "type": "opening_hook OR problem_intro OR product_intro OR benefit_highlight OR call_to_action",
      "goal": "Indonesian short string describing goal (e.g. Tarik perhatian audiens)",
      "description": "Indonesian detailed description of what happens visually",
      "duration": 3,
      "focusMessage": "Focus point in Indonesian",
      "modelPresence": "Full Body OR Half Body OR Close-up OR Hand only OR Holding Product OR Pointing OR Explaining OR Lifestyle Subject OR Product Only OR Hidden",
      "productPresence": "Hidden OR Background OR Visible OR Hero Focus OR Close-up OR Hand Holding Product OR Product on Table OR Product Beside Model",
      "subjectPresence": "None OR Uploaded model reference OR Generic human presenter OR Hand only OR Customer lifestyle scene OR Family scene OR Product only",
      "backgroundMode": "AI Suggested",
      "background": "Cozy modern living room OR Clean marketplace studio OR Modern industrial laboratory OR Garage / automotive setup OR Kitchen OR Office desk OR Minimal white studio",
      "backgroundPrompt": "A highly detailed English stable-diffusion-ready image prompt representing the scenic background environment, aligned with preset: ${videoSetup.visualPreset}",
      "backgroundNotes": "Any specific instructions",
      "cameraFraming": "Close-up OR Medium shot OR Wide shot OR Full body OR Product close-up",
      "mood": "Friendly OR Fun OR Professional OR Reassuring OR Energetic OR Premium",
      "lightingStyle": "Bright soft lighting OR Clean studio lighting OR Warm daylight OR Premium cinematic lighting",
      "styleLock": ["Clean marketplace promo", "No text in image", "No watermark", "Preserve reference identity", "No style conversion"],
      "narrationDirection": "Guideline for Indonesian speech in this scene",
      "textHighlightDirection": "Overlay text instruction (should match some key highlights provided)",
      "editingDirection": "Editing/framing instruction",
      "ctaDirection": "CTA guideline if order is last",
      "status": "Not Generated"
    }
  ]
}

DO NOT wrap your JSON in HTML markdown blocks like \`\`\`json. Return STRICT, parses-as-straight JSON string only.`;

    const response = await ai!.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Generate Scene Plan Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate scene plan" });
  }
});

// 2. generateSceneOutput
app.post("/api/generate-scene-output", async (req, res) => {
  try {
    checkGeminiClient();
    const { campaign, scene } = req.body;

    const systemPrompt = `You are an expert promotional media engineer. You translate a specific Scene Configuration into highly optimized AI generative outputs:
- imagePrompt: A detailed, clear English prompt for image generator models (e.g., Stable Diffusion / Imagen / Midjourney). Do not include text in the image.
- videoPrompt: An action-oriented motion prompt for video generation tools (e.g. Veo, Runway, Luma).
- narration: The exact spoken Indonesian voice script, short enough to be read naturally within the duration (${scene.duration} seconds). Indonesian average speaking rate is 2.5 words per second. Keep it under ${Math.floor(scene.duration * 2.5)} words!
- textHighlights: Short text overlays (caps, badges) in Indonesian to display on screen (e.g. "Full Synthetic", "10W-40").
- editingRecommendation: Bullet points of visual transitions, camera movements, or effects in Indonesian.
- negativePrompt: Negative parameters list.

Product Name: ${campaign.productName}
Platform Target: ${campaign.platform}
Style Category: ${campaign.visualPreset}
Model / Presenter Setup: ${campaign.useModelReference ? "Using uploaded visual reference image" : "Product only"}
Image Prompt Rules:
1. Always add "no text in image, no watermarks".
2. If custom model reference or product reference is available, describe details accurately based on guidelines.
3. Reference fidelity is more important than visual enhancement.
4. Never beautify, redesign, or reinterpret a referenced subject.
5. If the model reference is an avatar, Bitmoji, cartoon, 2D illustration, sticker, vector art, or flat graphic character, preserve the original style and medium exactly.
6. Never convert a referenced 2D avatar into 3D, semi-3D, photorealistic, painterly, cinematic-human, or another art style.
7. Keep the same identity markers, face shape, hairstyle, outfit, accessories, color palette, and character proportions whenever visible.
8. If uncertain, choose stricter consistency over creativity.`;

    const prompt = `Generate prompt outputs for:
Scene Details:
- Title: ${scene.title}
- Goal: ${scene.goal}
- Expected Duration: ${scene.duration} seconds (Narration Word Count limit: max ${Math.floor(scene.duration * 2.5)} words)
- Focus Message: ${scene.focusMessage}
- Model presence: ${scene.modelPresence}
- Product presence: ${scene.productPresence}
- Subject: ${scene.subjectPresence}
- Background Mode: ${scene.backgroundMode}
- Selected Background Style: ${scene.background}
- BG Prompt Guideline: ${scene.backgroundPrompt}
- Framing: ${scene.cameraFraming}
- Mood: ${scene.mood}
- Lighting: ${scene.lightingStyle}
- Style Locks: ${JSON.stringify(scene.styleLock)}
- Instructions for Voice/Narration: ${scene.narrationDirection}
- Instructions for Overlay: ${scene.textHighlightDirection}
- Instructions for Cuts: ${scene.editingDirection}

Product Info:
- Product Category: ${campaign.productCategory}
- Product Description: ${campaign.productDescription}
- User Benefits (Narrative): ${campaign.benefits}
- User Highlights: ${campaign.keyPoints}

Provide visual reference guidance in the imagePrompt:
${campaign.productImage ? `Include: "Use the uploaded product image as the product reference. Keep the product shape, color, proportions, label, packaging, and key visual details accurate. Do not redesign, recolor, or change the product."` : ""}
${campaign.useModelReference ? `Include: "Use the uploaded model reference image as the visual reference for the presenter/model/character. Keep the visible identity, face, hairstyle, outfit, body proportions, accessories, and key visual details consistent with the uploaded reference. Do not replace or change the model identity. Preserve the original visual medium and style exactly. If the reference is a 2D avatar, Bitmoji, cartoon, sticker, vector, cel-shaded, or flat illustration, keep it 2D in the same illustrative style. Do not convert it into 3D, semi-3D, photorealistic, painterly, or cinematic human style. Do not improve, redesign, modernize, or beautify the character."` : ""}
${campaign.modelType === "Hand Model Only" ? `Include: "Use the uploaded model reference only for hand/pose reference if visible. Focus on hands interacting with the product. Do not show full face."` : ""}
${campaign.useBackgroundReference ? `Include: "Use the uploaded background reference image as the visual environment reference. Keep the overall room layout, atmosphere, lighting direction, and background style consistent with the uploaded reference."` : ""}
${campaign.modelType === "Avatar / Character" ? `Include: "This model is a character/avatar reference. Preserve the exact character identity and original art style. Do not transform the character into another rendering medium."` : ""}
${campaign.modelReferenceNotes ? `Include these model consistency notes exactly where relevant: "${campaign.modelReferenceNotes}"` : ""}

Return a valid JSON object matching exactly this structure:
{
  "imagePrompt": "Detailed English prompt for high quality render, descriptive of scene, subject, framing, camera angle, and style lock elements.",
  "videoPrompt": "Detailed English video generation motion prompt showing dynamic movement.",
  "narration": "Exact dialogue/narration in Indonesian.",
  "textHighlights": ["Highlight 1", "Highlight 2"],
  "editingRecommendation": ["Bullet 1", "Bullet 2"],
  "negativePrompt": "no watermark, no random letters, no unreadable text, no distorted product, no changed product label, no changed character identity, no face redesign, no hairstyle change, no outfit change, no accessory change, no style conversion, no 3D conversion, no photorealistic reinterpretation, no semi-3D render, no painterly restyle, no extra fingers, no broken hands, no duplicated limbs, no speech bubble, no subtitle, no messy background, no excessive objects, no logo distortion"
}

DO NOT wrap your JSON in HTML markdown blocks. Return STRICT parses-as-straight JSON string only.`;

    const response = await ai!.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Generate Scene Output Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate scene output" });
  }
});

// 3. generateBackgroundSuggestion
app.post("/api/generate-background-suggestion", async (req, res) => {
  try {
    checkGeminiClient();
    const { campaign, scene } = req.body;

    const prompt = `Regenerate the background suggestions for this promo scene:
Product Category: ${campaign.productCategory}
Visual Preset Design: ${campaign.visualPreset}
Scene Type: ${scene.type} (${scene.title})

Return a JSON object containing:
- background: One of: "Cozy modern living room", "Clean marketplace studio", "Modern industrial laboratory", "Garage / automotive setup", "Kitchen", "Office desk", "Minimal white studio"
- backgroundPrompt: Detailed english image generator prompt describing the scenery perfectly mapped to the style preset.
- mood: Recommended visual mood (e.g., Friendly, Premium, Energetic)
- lightingStyle: Highly descriptive lighting atmosphere (e.g. "Warm daylight", "Clean studio lighting", "Premium cinematic lighting")

Return a valid JSON object matching exactly:
{
  "background": "...",
  "backgroundPrompt": "...",
  "mood": "...",
  "lightingStyle": "..."
}
Strict parser-ready JSON only. no markdown codeblock.`;

    const response = await ai!.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json(JSON.parse(response.text?.trim() || "{}"));
  } catch (error: any) {
    console.error("Background Suggestion Error:", error);
    res.status(500).json({ error: error.message || "Failed to suggest background" });
  }
});

// 4. generate-image
app.post("/api/generate-image", async (req, res) => {
  try {
    checkGeminiClient();
    const { prompt, aspectRatio, sceneInfo } = req.body;

    const imgKey = process.env.IMAGE_GENERATION_API_KEY;
    // We can also try generating via nano banana if Gemini API key exists, but standard image gen models might need paid flow
    // Let's implement real generation with gemini-2.5-flash-image if GEMINI_API_KEY is available and user wants, 
    // but gracefully let it error or fallback if not configured
    
    console.log("Generating image with prompt:", prompt);
    
    // We try gemini-2.5-flash-image as the default image generator:
    try {
      const response = await ai!.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: prompt,
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1",
          },
        },
      });

      // Find the first inlineData part
      let base64Data = "";
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Data = part.inlineData.data;
            break;
          }
        }
      }

      if (base64Data) {
        return res.json({
          imageUrl: `data:image/png;base64,${base64Data}`,
          isMock: false
        });
      }
    } catch (genError: any) {
      console.warn("Real image generation failed, checking if API lacks permission or model isn't active:", genError.message);
      // We will propagate a descriptive error indicating provider setup requirement
      return res.status(403).json({
        error: "Real image generation failed. To enable high-quality visual generation, please ensure your Gemini API account has access to the image generation model (gemini-2.5-flash-image or gemini-3.1-flash-image in Settings), or configure IMAGE_GENERATION_API_KEY as an environment variable in Settings > Secrets.",
        details: genError.message
      });
    }

    res.status(400).json({ error: "Could not generate image. No valid model response." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate image" });
  }
});

// 5. generate-voice
app.post("/api/generate-voice", async (req, res) => {
  try {
    checkGeminiClient();
    const { narration, voiceName, voicePrompt } = req.body;

    console.log("Generating voice with narration:", narration, "voice:", voiceName);

    try {
      const response = await ai!.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: voicePrompt || `Say cheerfully and professionally in clear Indonesian accent: ${narration}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || "Kore" }, // Puck, Charon, Kore, Fenrir, Zephyr
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({
          audioUrl: `data:audio/mp3;base64,${base64Audio}`,
          isMock: false
        });
      }
    } catch (genError: any) {
      console.warn("Real speech generation failed or model not available:", genError.message);
      return res.status(403).json({
        error: "Real voice generation failed. To enable speech synthesis, please verify your Gemini API key supports text-to-speech tasks (gemini-3.1-flash-tts-preview), or make sure to provide a VOICE_GENERATION_API_KEY wrapper in Settings > Secrets.",
        details: genError.message
      });
    }

    res.status(400).json({ error: "Could not generate speech response." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate voice" });
  }
});

// Serving the React Applet and listening
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start Server on Hardcoded Port 3000 (bind to 0.0.0.0)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Promo Scene Assistant running at http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server bootstrap:", err);
});
