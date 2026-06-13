export interface Campaign {
  id: string;
  title: string;
  productName: string;
  productCategory: string;
  productDescription: string;
  productImage: string | null; // base64 or source url
  benefits: string;
  keyPoints: string;
  targetAudience: string;
  problemSolved: string;
  specialNotes: string;

  platform: string;
  totalDuration: number;
  sceneCount: number;
  aspectRatio: string;
  visualPreset: string;

  useBackgroundReference: boolean;
  backgroundReferenceImage: string | null;
  backgroundReferenceNotes: string;

  narrationTone: string;
  language: string;

  useModelReference: boolean;
  modelReferenceImage: string | null;
  modelType: string;
  modelUsage: string;
  modelReferenceNotes: string;

  ctaType: string;

  totalAssets: number;
  totalGeneratedImages: number;
  totalGeneratedVoices: number;

  status: "Draft" | "Scene Planned" | "In Progress" | "Completed";
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  campaignId: string;
  order: number;
  title: string;
  type: string;
  goal: string;
  description: string;
  duration: number;
  focusMessage: string;

  modelPresence: string;
  productPresence: string;
  subjectPresence: string;

  backgroundMode: "AI Suggested" | "Use Campaign Background Reference" | "Upload Scene Background" | "Custom Text Background";
  background: string;
  backgroundPrompt: string;
  sceneBackgroundImage: string | null;
  backgroundNotes: string;

  cameraFraming: string;
  mood: string;
  lightingStyle: string;
  styleLock: string[];

  narrationDirection: string;
  textHighlightDirection: string;
  editingDirection: string;
  ctaDirection: string;

  status: "Not Generated" | "Generated" | "Edited" | "Approved";
  createdAt: string;
  updatedAt: string;
}

export interface SceneOutput {
  id: string;
  campaignId: string;
  sceneId: string;
  imagePrompt: string;
  videoPrompt: string;
  narration: string;
  textHighlights: string[];
  editingRecommendation: string[];
  negativePrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  campaignId: string;
  sceneId: string | null;
  name: string;
  type: "uploaded_product" | "uploaded_model" | "uploaded_campaign_background" | "uploaded_scene_background" | "generated_image" | "generated_voice" | "export_markdown" | "export_json";
  sourceType: "uploaded" | "generated" | "exported";
  fileUrl: string | null;
  fileData: string | null;
  mimeType: string;
  promptSource: string | null;
  narrationSource: string | null;
  metadata: {
    productReferenceUsed?: boolean;
    modelReferenceUsed?: boolean;
    campaignBackgroundUsed?: boolean;
    sceneBackgroundUsed?: boolean;
    aspectRatio?: string;
    durationSeconds?: number;
    sceneTitle?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  geminiModelName: string;
  defaultAspectRatio: string;
  defaultVisualPreset: string;
  defaultLanguage: string;
  defaultNegativePrompt: string;
  imageGenerationProvider: string;
  voiceGenerationProvider: string;
  defaultIndonesianVoiceName: string;
  defaultDownloadFormat: string;
  enableImageGeneration: boolean;
  enableVoiceGeneration: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  geminiModelName: "gemini-3.5-flash",
  defaultAspectRatio: "9:16",
  defaultVisualPreset: "Marketplace Clean",
  defaultLanguage: "Indonesian",
  defaultNegativePrompt: "no watermark, no random letters, no unreadable text, no distorted product, no changed product label, no changed character identity, no face redesign, no hairstyle change, no outfit change, no accessory change, no style conversion, no 3d conversion, no photorealistic reinterpretation, no semi-3d render, no painterly restyle, no extra fingers, no broken hands, no duplicated limbs, no speech bubble, no subtitle, no messy background, no excessive objects, no logo distortion",
  imageGenerationProvider: "Gemini Image API (gemini-2.5-flash-image)",
  voiceGenerationProvider: "Gemini Text-to-Speech (gemini-3.1-flash-tts-preview)",
  defaultIndonesianVoiceName: "Gadis", // we can map 'Gadis' to Gemini's Puck/Zephyr/Kore, e.g. Puck/Kore is female-like, Zephyr/Fenrir is male-like
  defaultDownloadFormat: "PNG Images / MP3 Audio",
  enableImageGeneration: true,
  enableVoiceGeneration: true
};
