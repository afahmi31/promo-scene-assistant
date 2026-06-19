import React, { useState, useEffect } from "react";
import { 
  Folder, 
  PlusCircle, 
  FolderLock, 
  Layers, 
  Settings as SettingsIcon,
  Sparkles,
  RefreshCw,
  Award,
  Video,
  FileCode,
  Music,
  Download,
  Smartphone,
  Eye,
  Settings,
  Flame,
  User,
  LogOut,
  AppWindow,
  Lock,
  Compass
} from "lucide-react";
import { Campaign, Scene, SceneOutput, Asset, Settings as SettingsType, DEFAULT_SETTINGS } from "./types";
import DashboardView from "./components/DashboardView";
import NewCampaignView from "./components/NewCampaignView";
import SceneBuilderView from "./components/SceneBuilderView";
import CampaignAssetsView from "./components/CampaignAssetsView";
import PromptTemplatesView from "./components/PromptTemplatesView";
import SettingsView from "./components/SettingsView";
import { buildPersistentMediaRef, deletePersistentMedia, hydrateEntityMedia, sanitizeEntityMedia } from "./lib/persistentMedia";

const MIN_SCENE_DURATION_SECONDS = 2;
const MAX_TOTAL_VIDEO_DURATION_SECONDS = 10;

export default function App() {
  const CAMPAIGN_MEDIA_FIELDS: Array<keyof Campaign> = ["productImage", "modelReferenceImage", "referenceAssets"];
  const SCENE_MEDIA_FIELDS: Array<keyof Scene> = ["sceneBackgroundImage"];
  const ASSET_MEDIA_FIELDS: Array<keyof Asset> = ["fileData"];

  // Navigation State
  const [activeView, setActiveView] = useState<"dashboard" | "new_campaign" | "scene_builder" | "assets" | "templates" | "settings">("dashboard");
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  // Core Collections States
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [sceneOutputs, setSceneOutputs] = useState<SceneOutput[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);

  // Template prefill bridge state
  const [templatePrefill, setTemplatePrefill] = useState<Partial<Campaign> | undefined>(undefined);
  const [campaignSetupScenesPrefill, setCampaignSetupScenesPrefill] = useState<Scene[] | undefined>(undefined);

  const hydrateCampaigns = (items: Campaign[]) => {
    return Promise.all(items.map((campaign) => hydrateEntityMedia(campaign, CAMPAIGN_MEDIA_FIELDS)));
  };

  const hydrateScenes = (items: Scene[]) => {
    return Promise.all(items.map((scene) => hydrateEntityMedia(scene, SCENE_MEDIA_FIELDS)));
  };

  const hydrateAssets = (items: Asset[]) => {
    return Promise.all(items.map((asset) => hydrateEntityMedia(asset, ASSET_MEDIA_FIELDS)));
  };

  const persistCampaigns = async (items: Campaign[]) => {
    const sanitized = await Promise.all(
      items.map((campaign) => sanitizeEntityMedia(campaign, "campaign", campaign.id, CAMPAIGN_MEDIA_FIELDS))
    );
    localStorage.setItem("warna_fit_campaigns", JSON.stringify(sanitized));
  };

  const persistScenes = async (items: Scene[]) => {
    const sanitized = await Promise.all(
      items.map((scene) => sanitizeEntityMedia(scene, "scene", scene.id, SCENE_MEDIA_FIELDS))
    );
    localStorage.setItem("warna_fit_scenes", JSON.stringify(sanitized));
  };

  const persistAssets = async (items: Asset[]) => {
    const sanitized = await Promise.all(
      items.map((asset) => sanitizeEntityMedia(asset, "asset", asset.id, ASSET_MEDIA_FIELDS))
    );
    localStorage.setItem("warna_fit_assets", JSON.stringify(sanitized));
  };

  const cleanupCampaignMedia = async (campaignId: string) => {
    await Promise.all(
      CAMPAIGN_MEDIA_FIELDS.map((fieldName) =>
        deletePersistentMedia(buildPersistentMediaRef("campaign", campaignId, fieldName))
      )
    );
  };

  const cleanupSceneMedia = async (sceneId: string) => {
    await Promise.all(
      SCENE_MEDIA_FIELDS.map((fieldName) =>
        deletePersistentMedia(buildPersistentMediaRef("scene", sceneId, fieldName))
      )
    );
  };

  const cleanupAssetMedia = async (assetId: string) => {
    await Promise.all(
      ASSET_MEDIA_FIELDS.map((fieldName) =>
        deletePersistentMedia(buildPersistentMediaRef("asset", assetId, fieldName))
      )
    );
  };

  // 1. Initial State Loading from LocalStorage with Pre-Seeded Sample Campaign
  useEffect(() => {
    let isMounted = true;

    const initializeState = async () => {
      // a. Settings
      const storedSettings = localStorage.getItem("warna_fit_settings");
      if (storedSettings) {
        try { setSettings(JSON.parse(storedSettings)); } catch(e){}
      } else {
        localStorage.setItem("warna_fit_settings", JSON.stringify(DEFAULT_SETTINGS));
      }

      // b. Campaigns
      const storedCampaigns = localStorage.getItem("warna_fit_campaigns");
      let initialCampaigns: Campaign[] = [];
      if (storedCampaigns) {
        try { initialCampaigns = JSON.parse(storedCampaigns); } catch(e){}
      }

      // c. Scenes
      const storedScenes = localStorage.getItem("warna_fit_scenes");
      let initialScenes: Scene[] = [];
      if (storedScenes) {
        try { initialScenes = JSON.parse(storedScenes); } catch(e){}
      }

      // d. Scene Outputs
      const storedOutputs = localStorage.getItem("warna_fit_scene_outputs");
      let initialOutputs: SceneOutput[] = [];
      if (storedOutputs) {
        try { initialOutputs = JSON.parse(storedOutputs); } catch(e){}
      }

      // e. Pre-Seed Database if completely empty
      if (initialCampaigns.length === 0) {
        const seedCampId = "camp_maxspeed_seed";
      
      const seedCampaign: Campaign = {
        id: seedCampId,
        title: "MaxSpeed Synth Oil Promo",
        productName: "MaxSpeed Synth Motor Oil",
        productCategory: "Automotive / Oil",
        productDescription: "Oli pelumas motor premium sintetis ester tingkat tinggi dengan performa SAE 10W-40 untuk ketahanan panas luar biasa pada RPM ekstrim harian.",
        productImage: null,
        benefits: "Suara getaran kasar mesin langsung reda seketika\nMelindungi komponen dari gesekan putaran piston tinggi\nSuhu mesin tetap dingin meskipun terjebak kemacetan",
        keyPoints: "Full Synthetic Ester, SAE 10W-40, API SN, JASO MA2, Botol Merah Premium",
        targetAudience: "Pengendara Motor Sport & Harian",
        problemSolved: "Mesin cepat panas, transmisi kasar, suara mesin berisik",
        specialNotes: "Tonjolkan botol kemasan merah MaxSpeed berkilau secara mewah.",
        platform: "Instagram Reels",
        totalDuration: MAX_TOTAL_VIDEO_DURATION_SECONDS,
        sceneCount: 4,
        aspectRatio: "9:16",
        visualPreset: "Product Premium",
        useBackgroundReference: false,
        referenceAssets: [],
        narrationTone: "Review style",
        language: "Indonesian",
        useModelReference: false,
        modelReferenceImage: null,
        modelType: "Product Only / No Model",
        modelUsage: "None",
        modelReferenceNotes: "",
        ctaType: "Klik link di bio",
        totalAssets: 0,
        totalGeneratedImages: 0,
        totalGeneratedVoices: 0,
        status: "In Progress",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const seedScenes: Scene[] = [
        {
          id: "scene_seed_1",
          campaignId: seedCampId,
          order: 1,
          title: "Hook - Masalah Mesin Kasar",
          type: "problem_intro",
          goal: "Tarik atensi pengendara motor harian",
          description: "Tampilan close-up dramatis getaran piston bergesekan dengan cipratan sisa oli hitam kotor.",
          duration: MIN_SCENE_DURATION_SECONDS,
          focusMessage: "Mesin Motor Terasa Kasar dan Berisik?",
          modelPresence: "Hidden",
          productPresence: "Hidden",
          subjectPresence: "Product only",
          backgroundMode: "AI Suggested",
          background: "Garage / automotive setup",
          backgroundPrompt: "A professional cool neon lit garage workshop bay bokeh studio setup backdrop, highly realistic 3d style.",
          sceneBackgroundImage: null,
          backgroundNotes: "",
          cameraFraming: "Macro detail",
          mood: "Premium",
          lightingStyle: "Premium cinematic lighting",
          styleLock: ["Clean marketplace promo", "no watermarks"],
          narrationDirection: "Sebutkan masalah suara mesin berisik dan kasar dengan nada sedikit khawatir.",
          textHighlightDirection: "Gunakan teks label besar 'BISING & KASAR?'.",
          editingDirection: "Quick close-up zooming.",
          ctaDirection: "",
          status: "Not Generated",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "scene_seed_2",
          campaignId: seedCampId,
          order: 2,
          title: "Solusi - MaxSpeed Botol Merah",
          type: "product_intro",
          goal: "Tampilkan brand MaxSpeed secara mewah",
          description: "Botol pelumas merah MaxSpeed berkilau diletakkan di tengah meja display melingkar berputar bersinar mewah cinematic.",
          duration: 3,
          focusMessage: "Ini Solusinya: MaxSpeed Premium Synth!",
          modelPresence: "Hidden",
          productPresence: "Hero Focus",
          subjectPresence: "Product only",
          backgroundMode: "AI Suggested",
          background: "Clean marketplace studio",
          backgroundPrompt: "Deep black premium studio background with red laser light lines on the floor edge, product showcase setup.",
          sceneBackgroundImage: null,
          backgroundNotes: "",
          cameraFraming: "Medium shot",
          mood: "Premium",
          lightingStyle: "Premium cinematic lighting",
          styleLock: ["Clean marketplace promo"],
          narrationDirection: "Ucapkan perkenalan pelumas MaxSpeed sintetis ester modern secara tegas mantap.",
          textHighlightDirection: "Overlay tulisan 'ESTER FORMULA' bersinar.",
          editingDirection: "Slow rotation path camera pan.",
          ctaDirection: "",
          status: "Not Generated",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "scene_seed_3",
          campaignId: seedCampId,
          order: 3,
          title: "Benefit - Mesin Halus Optimal",
          type: "benefit_highlight",
          goal: "Jelaskan kemudahan transmisi halus",
          description: "Potongan animasi close-up gir logam dalam mesin yang licin terlumasi cairan oli merah bening mewah, berputar sangat presisi hampa gesekan.",
          duration: 3,
          focusMessage: "Getaran Mereda, Tarikan Enteng Seketika!",
          modelPresence: "Hidden",
          productPresence: "Background",
          subjectPresence: "Product only",
          backgroundMode: "AI Suggested",
          background: "Modern industrial laboratory",
          backgroundPrompt: "A sleek scientific motor testing equipment laboratory backdrop with soft blue backlight glow.",
          sceneBackgroundImage: null,
          backgroundNotes: "",
          cameraFraming: "Close-up",
          mood: "Reassuring",
          lightingStyle: "Clean studio lighting",
          styleLock: ["Clean marketplace promo"],
          narrationDirection: "Sebutkan bagaimana tarikan motor terasa langsung enteng dan getaran mereda optimal.",
          textHighlightDirection: "Overlay stiker angka 'Reduces Up to 80% Vibrations'.",
          editingDirection: "Smooth tracking slide tracking.",
          ctaDirection: "",
          status: "Not Generated",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "scene_seed_4",
          campaignId: seedCampId,
          order: 4,
          title: "CTA - Klik Link Biolink Belanja",
          type: "call_to_action",
          goal: "Persuasi pembelian produk sekarang",
          description: "Botol merah MaxSpeed didampingi kotak kemasan eksklusif dengan kelap-kelip cahaya studio bersinar, penunjuk arah tangan kecil mengarah ke biolink.",
          duration: 2,
          focusMessage: "Miliki Mesin Halus! Beli Sekarang!",
          modelPresence: "Hidden",
          productPresence: "Hero Focus",
          subjectPresence: "Product only",
          backgroundMode: "AI Suggested",
          background: "Clean marketplace studio",
          backgroundPrompt: "Minimal white studio spotlight focus on floor center.",
          sceneBackgroundImage: null,
          backgroundNotes: "",
          cameraFraming: "Medium shot",
          mood: "Energetic",
          lightingStyle: "Bright soft lighting",
          styleLock: ["Clean marketplace promo"],
          narrationDirection: "Ajak penonton membeli segera oli MaxSpeed terbaru dengan menekan biolink.",
          textHighlightDirection: "Banner besar berkelip 'KLIK LINK DI BIO SEKARANG'.",
          editingDirection: "Slow push forward focal lens.",
          ctaDirection: "Beli kemasan asli bergaransi hanya melalui biolink resmi akun kami.",
          status: "Not Generated",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const seedOutputs: SceneOutput[] = [
        {
          id: "out_seed_1",
          campaignId: seedCampId,
          sceneId: "scene_seed_1",
          imagePrompt: "A macro detail cinematic of engine steel gears clashing inside, dirty black motor fluid splashing, dramatic lighting, high contrast shadows, highly detailed 3d render, no text, no watermark",
          videoPrompt: "A dynamic panning shot starting close on mechanical gear parts, slow heavy motion rotation showing iron components.",
          narration: "Motor kamu suaranya bising banget? Terasa kasar dan cepat panas pas diajak berkendara harian?",
          textHighlights: ["MESIN BISING?", "GETARAN KASAR"],
          editingRecommendation: ["Transisi pembuka cepat", "Gunakan sound effect besi bergesor"],
          negativePrompt: "no watermark, no random letters, no unreadable text, no extra objects",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "out_seed_2",
          campaignId: seedCampId,
          sceneId: "scene_seed_2",
          imagePrompt: "A premium red motor oil bottle sitting centered on a premium rotating display pedestal, glossy plastic bottle reflecting crimson studio lasers, pristine product focus catalog product photo, clean environment, no text, no watermark",
          videoPrompt: "A slow rotating camera around a luxury product bottle, sleek reflective lighting tracking across the red label surface.",
          narration: "Tenang, ini ia MaxSpeed Premium Synth! Oli pelumas berkelas tinggi yang didesain khusus buat mesin tangguh harian kamu.",
          textHighlights: ["MAXSPEED SYNTH", "ESTER FORMULA"],
          editingRecommendation: ["Gerakan memutar estetik", "Filter warna premium contrast merah"],
          negativePrompt: "no watermark, no random letters, distorted label",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "out_seed_3",
          campaignId: seedCampId,
          sceneId: "scene_seed_3",
          imagePrompt: "A highly scientific rendering of rotating steel metallic cylinder pistons seamlessly spinning, coated with transparent red liquid oil thin lubricant layer, friction-shield glow details, high precision, 4k render, no text, no watermark",
          videoPrompt: "Industrial mechanical movement fluid simulation of clean red engine lubricant spreading between rolling bearing gears.",
          narration: "Dengan formula sintetis ester premium, getaran berisik langsung berkurang ekstrem dan tarikan terasa langsung rancing enteng seketika!",
          textHighlights: ["TARIKAN ENTENG", "REDUCES VIBRATIONS"],
          editingRecommendation: ["Transisi memudar keperakan", "Sound effect desis pelumas halus"],
          negativePrompt: "no watermark, no random letters, broken gear teeth",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "out_seed_4",
          campaignId: seedCampId,
          sceneId: "scene_seed_4",
          imagePrompt: "A product lifestyle shot showcasing the premium red MaxSpeed oil cylinder container positioned next to a black sleek racing helmet on a neat polished table workspace, glowing neon studio ring background, exquisite catalog presentation, no text, no watermark",
          videoPrompt: "Smooth push in dolly shot towards the product setup, focus shifting slowly from background elements to the red bottle labeling.",
          narration: "Yuk, miliki tarikan mesin halus bergaransi awet! Masuk dan klik link di bio profil kami buat belanja sekarang juga!",
          textHighlights: ["MESIN AWET!", "KLIK LINK DI BIO"],
          editingRecommendation: ["Slow push-in zoom", "Gunakan overlay panah kecil berkedip"],
          negativePrompt: "no watermark, no random letters, distorted bottle shape",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

        initialCampaigns = [seedCampaign];
        initialScenes = seedScenes;
        initialOutputs = seedOutputs;

        localStorage.setItem("warna_fit_scene_outputs", JSON.stringify(initialOutputs));
      }

      const [hydratedCampaigns, hydratedScenes] = await Promise.all([
        hydrateCampaigns(initialCampaigns),
        hydrateScenes(initialScenes)
      ]);

      // f. Assets
      const storedAssets = localStorage.getItem("warna_fit_assets");
      let initialAssets: Asset[] = [];
      if (storedAssets) {
        try { initialAssets = JSON.parse(storedAssets); } catch(e){}
      }

      const hydratedAssets = await hydrateAssets(initialAssets);
      if (!isMounted) return;

      setCampaigns(hydratedCampaigns);
      setScenes(hydratedScenes);
      setSceneOutputs(initialOutputs);
      setAssets(hydratedAssets);

      try {
        await Promise.all([
          persistCampaigns(hydratedCampaigns),
          persistScenes(hydratedScenes),
          persistAssets(hydratedAssets)
        ]);
      } catch (error) {
        console.error("Failed to migrate media payloads into IndexedDB.", error);
      }
    };

    void initializeState();

    return () => {
      isMounted = false;
    };
  }, []);

  // Persists collections to localStorage on mutations
  const updateStoredCampaigns = (updated: Campaign[]) => {
    setCampaigns(updated);
    persistCampaigns(updated).catch((error) => {
      console.error("Failed to persist campaigns.", error);
    });
  };

  const updateStoredScenes = (updated: Scene[]) => {
    setScenes(updated);
    persistScenes(updated).catch((error) => {
      console.error("Failed to persist scenes.", error);
    });
  };

  const updateStoredOutputs = (updated: SceneOutput[]) => {
    setSceneOutputs(updated);
    localStorage.setItem("warna_fit_scene_outputs", JSON.stringify(updated));
  };

  const updateStoredAssets = (updated: Asset[]) => {
    setAssets(updated);
    persistAssets(updated).catch((error) => {
      console.error("Failed to persist assets.", error);
    });
  };

  const updateStoredSettings = (updated: SettingsType) => {
    setSettings(updated);
    localStorage.setItem("warna_fit_settings", JSON.stringify(updated));
  };

  // 2. BACKEND API PROXIES HANDLERS CALLS
  
  // a. /api/generate-scene-plan
  const handleGenerateAIScenePlan = async (partialCamp: Partial<Campaign>): Promise<Scene[]> => {
    const response = await fetch("/api/generate-scene-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productBrief: {
          productName: partialCamp.productName,
          productCategory: partialCamp.productCategory,
          productDescription: partialCamp.productDescription,
          benefits: partialCamp.benefits,
          keyPoints: partialCamp.keyPoints,
          targetAudience: partialCamp.targetAudience,
          problemSolved: partialCamp.problemSolved,
          specialNotes: partialCamp.specialNotes
        },
        videoSetup: {
          platform: partialCamp.platform,
          totalDuration: partialCamp.totalDuration,
          sceneCount: partialCamp.sceneCount,
          aspectRatio: partialCamp.aspectRatio,
          visualPreset: partialCamp.visualPreset,
          useBackgroundReference: partialCamp.useBackgroundReference,
          referenceAssets: partialCamp.referenceAssets,
          narrationTone: partialCamp.narrationTone,
          language: partialCamp.language,
          useModelReference: partialCamp.useModelReference,
          modelType: partialCamp.modelType,
          modelUsage: partialCamp.modelUsage,
          modelReferenceNotes: partialCamp.modelReferenceNotes,
          ctaType: partialCamp.ctaType
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to generate AI scene plan via Gemini backend");
    }

    const data = await response.json();
    return data.scenes || [];
  };

  // b. /api/generate-scene-output (detailed prompts parameters generation)
  const handleGenerateAISceneOutput = async (sceneId: string): Promise<SceneOutput> => {
    const sceneObj = scenes.find(s => s.id === sceneId);
    if (!sceneObj) throw new Error("Scene not found");

    const campaignObj = campaigns.find(c => c.id === sceneObj.campaignId);
    if (!campaignObj) throw new Error("Linked campaign not found");

    const response = await fetch("/api/generate-scene-output", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaign: campaignObj,
        scene: sceneObj
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to generate detailed parameters.");
    }

    const data = await response.json();

    const newOutput: SceneOutput = {
      id: "out_" + Date.now(),
      campaignId: campaignObj.id,
      sceneId: sceneObj.id,
      imagePrompt: data.imagePrompt || "Refined visual photo scene rendering prompt",
      videoPrompt: data.videoPrompt || "Smooth camera dolly tracking motion scene",
      narration: data.narration || "Voice narration text in clean Indonesian.",
      textHighlights: data.textHighlights || [],
      editingRecommendation: data.editingRecommendation || [],
      negativePrompt: data.negativePrompt || settings.defaultNegativePrompt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Filter out existing and prepend new, to preserve single active output
    const updatedOutputs = sceneOutputs.filter(o => o.sceneId !== sceneId);
    updateStoredOutputs([...updatedOutputs, newOutput]);

    // Update scene status toggle inside scenes list
    const updatedScenesList = scenes.map(s => {
      if (s.id === sceneId) {
        return { ...s, status: "Generated" as any, updatedAt: new Date().toISOString() };
      }
      return s;
    });
    updateStoredScenes(updatedScenesList);

    return newOutput;
  };

  // c. /api/generate-background-suggestion (quick suggest background style parameters)
  const handleRegenerateBackgroundSuggestion = async (sceneId: string): Promise<any> => {
    const sceneObj = scenes.find(s => s.id === sceneId);
    if (!sceneObj) throw new Error("Scene not found");

    const campaignObj = campaigns.find(c => c.id === sceneObj.campaignId);
    if (!campaignObj) throw new Error("Linked campaign not found");

    const response = await fetch("/api/generate-background-suggestion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaign: campaignObj, scene: sceneObj })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate suggestions");
    }

    const data = await response.json();

    // Locally sync active scene variables list
    const updatedScenes = scenes.map(s => {
      if (s.id === sceneId) {
        return {
          ...s,
          background: data.background || s.background,
          backgroundPrompt: data.backgroundPrompt || s.backgroundPrompt,
          mood: data.mood || s.mood,
          lightingStyle: data.lightingStyle || s.lightingStyle,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });
    updateStoredScenes(updatedScenes);

    return data;
  };

  // d. /api/generate-image (real image generation utilizing Gemini backend config)
  const handleGenerateImageAsset = async (sceneId: string, prompt: string, aspectRatio: string): Promise<string> => {
    const sceneObj = scenes.find(s => s.id === sceneId);
    if (!sceneObj) throw new Error("Scene not found");

    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, aspectRatio, sceneInfo: sceneObj })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Gagal melakukan generate gambar.");
    }

    const data = await response.json();
    const cleanUrl = data.imageUrl;

    // Create persistent Asset entry
    const newAsset: Asset = {
      id: "asset_img_" + Date.now(),
      campaignId: sceneObj.campaignId,
      sceneId: sceneObj.id,
      name: `Promo_Image_Scene_${sceneObj.order}.png`,
      type: "generated_image",
      sourceType: "generated",
      fileUrl: null,
      fileData: cleanUrl,
      mimeType: "image/png",
      promptSource: prompt,
      narrationSource: null,
      metadata: {
        aspectRatio: aspectRatio,
        sceneTitle: sceneObj.title
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Filter out existing generated image for this active scene
    const withoutImg = assets.filter(a => !(a.sceneId === sceneId && a.type === "generated_image"));
    updateStoredAssets([...withoutImg, newAsset]);

    // Increment image counter inside active Campaign
    const updatedCampList = campaigns.map(c => {
      if (c.id === sceneObj.campaignId) {
        const preImgCount = withoutImg.filter(a => a.campaignId === c.id && a.type === "generated_image").length + 1;
        return {
          ...c,
          totalGeneratedImages: preImgCount,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    updateStoredCampaigns(updatedCampList);

    return cleanUrl;
  };

  // e. /api/generate-voice (synthesis tts voice call)
  const handleGenerateVoiceAsset = async (sceneId: string, narration: string, voiceName: string, voicePrompt?: string): Promise<string> => {
    const sceneObj = scenes.find(s => s.id === sceneId);
    if (!sceneObj) throw new Error("Scene not found");

      const response = await fetch("/api/generate-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ narration, voiceName, voicePrompt })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Gagal memproses speech voiceover.");
    }

    const data = await response.json();
    const cleanUrl = data.audioUrl;

    // Create persistent Asset entry for voices
    const newAsset: Asset = {
      id: "asset_voice_" + Date.now(),
      campaignId: sceneObj.campaignId,
      sceneId: sceneObj.id,
      name: `VO_Scene_${sceneObj.order}.mp3`,
      type: "generated_voice",
      sourceType: "generated",
      fileUrl: null,
      fileData: cleanUrl,
      mimeType: "audio/mp3",
      promptSource: null,
      narrationSource: narration,
      metadata: {
        durationSeconds: sceneObj.duration,
        sceneTitle: sceneObj.title
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Filter out existing voice for this active scene
    const withoutVoice = assets.filter(a => !(a.sceneId === sceneId && a.type === "generated_voice"));
    updateStoredAssets([...withoutVoice, newAsset]);

    // Increment voice counter inside linked Campaign
    const updatedCampList = campaigns.map(c => {
      if (c.id === sceneObj.campaignId) {
        const preVoiceCount = withoutVoice.filter(a => a.campaignId === c.id && a.type === "generated_voice").length + 1;
        return {
          ...c,
          totalGeneratedVoices: preVoiceCount,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    updateStoredCampaigns(updatedCampList);

    return cleanUrl;
  };

  // 3. MUTATIONS AND STATE MODIFICATIONS

  // Save changes done manually in the Scene Builder editor center column
  const handleSaveSceneChanges = (sceneId: string, updatedScene: Partial<Scene>, updatedOutput?: Partial<SceneOutput>) => {
    const updatedList = scenes.map((s) => {
      if (s.id === sceneId) {
        return {
          ...s,
          ...updatedScene,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });
    updateStoredScenes(updatedList);

    if (updatedOutput && activeOutputOf(sceneId)) {
      const updatedOutList = sceneOutputs.map((o) => {
        if (o.sceneId === sceneId) {
          return {
            ...o,
            ...updatedOutput,
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      });
      updateStoredOutputs(updatedOutList);
    }
  };

  const activeOutputOf = (sceneId: string) => {
    return sceneOutputs.some(o => o.sceneId === sceneId);
  };

  // Save Campaign Plan from step 3 (Scene Planner)
  const handleSaveCampaignPlan = (newCampaign: Campaign, tempScenes: Scene[]) => {
    // Add campaign to global lists
    const indexCamp = campaigns.findIndex(c => c.id === newCampaign.id);
    let updatedCampaigns = [...campaigns];
    if (indexCamp >= 0) {
      updatedCampaigns[indexCamp] = newCampaign;
    } else {
      updatedCampaigns = [...campaigns, newCampaign];
    }
    updateStoredCampaigns(updatedCampaigns);

    // Save scenes
    const filteredScenes = scenes.filter(s => s.campaignId !== newCampaign.id);
    updateStoredScenes([...filteredScenes, ...tempScenes]);

    // Navigate to Scene Builder with active campaign focus
    setActiveCampaignId(newCampaign.id);
    setActiveView("scene_builder");
  };

  // Add new scene inside Active Builder
  const handleAddNewSceneInBuilder = () => {
    if (!activeCampaignId) return;
    const campaignScenesCount = scenes.filter(s => s.campaignId === activeCampaignId).length;

    const newScene: Scene = {
      id: "scene_" + Date.now(),
      campaignId: activeCampaignId,
      order: campaignScenesCount + 1,
      title: `Scene Tambahan ${campaignScenesCount + 1}`,
      type: "benefit_highlight",
      goal: "Demonstrasikan detail produk lainnya",
      description: "Close-up detail produk premium berputar di tengah meja studio minimalis.",
      duration: MIN_SCENE_DURATION_SECONDS,
      focusMessage: "Kualitas Premium Terbaik!",
      modelPresence: "Product Only",
      productPresence: "Hero Focus",
      subjectPresence: "Product only",
      backgroundMode: "AI Suggested",
      background: "Clean marketplace studio",
      backgroundPrompt: "A neutral white soft lit photoshoot studio spotlight backdrop environment.",
      sceneBackgroundImage: null,
      backgroundNotes: "",
      cameraFraming: "Product close-up",
      mood: "Premium",
      lightingStyle: "Clean studio lighting",
      styleLock: ["Clean marketplace promo"],
      narrationDirection: "Ucapkan keunggulan lainnya secara jelas berenergi.",
      textHighlightDirection: "Overlay label stiker penunjuk.",
      editingDirection: "Slow push zoom.",
      ctaDirection: "",
      status: "Not Generated",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    updateStoredScenes([...scenes, newScene]);

    // Update campaign counter
    const updatedCamps = campaigns.map(c => {
      if (c.id === activeCampaignId) {
        return {
          ...c,
          sceneCount: campaignScenesCount + 1,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    updateStoredCampaigns(updatedCamps);
  };

  const handleDeleteSceneInBuilder = (sceneId: string) => {
    const sceneObj = scenes.find(s => s.id === sceneId);
    if (!sceneObj) return;

    const filtered = scenes.filter(s => s.id !== sceneId).map((s, idx) => {
      if (s.campaignId === sceneObj.campaignId) {
        return { ...s, order: idx + 1 };
      }
      return s;
    });
    updateStoredScenes(filtered);

    // Filter out outputs and assets linked to that scene specifically
    const filteredOutputs = sceneOutputs.filter(o => o.sceneId !== sceneId);
    updateStoredOutputs(filteredOutputs);

    const filteredAssets = assets.filter(a => a.sceneId !== sceneId);
    updateStoredAssets(filteredAssets);
    void cleanupSceneMedia(sceneId);
    void Promise.all(assets.filter(a => a.sceneId === sceneId).map((asset) => cleanupAssetMedia(asset.id)));

    // Update campaign counts
    const updatedCamps = campaigns.map(c => {
      if (c.id === sceneObj.campaignId) {
        const newScenesList = filtered.filter(s => s.campaignId === c.id);
        const imagesLeft = filteredAssets.filter(a => a.campaignId === c.id && a.type === "generated_image").length;
        const voicesLeft = filteredAssets.filter(a => a.campaignId === c.id && a.type === "generated_voice").length;

        return {
          ...c,
          sceneCount: newScenesList.length,
          totalGeneratedImages: imagesLeft,
          totalGeneratedVoices: voicesLeft,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    updateStoredCampaigns(updatedCamps);
  };

  const handleApproveSceneInBuilder = (sceneId: string) => {
    // 1. Set scene status to Approved
    const updatedScenes = scenes.map(s => {
      if (s.id === sceneId) {
        return { ...s, status: "Approved" as any, updatedAt: new Date().toISOString() };
      }
      return s;
    });
    updateStoredScenes(updatedScenes);

    // 2. Export beautiful Markdown of approved scene and save as an export Asset!
    const sceneObj = scenes.find(s => s.id === sceneId);
    const outputObj = sceneOutputs.find(o => o.sceneId === sceneId);
    if (sceneObj) {
      const campObj = campaigns.find(c => c.id === sceneObj.campaignId);
      const markdown = `
# Storyboard Scene Plan - Approved Pack
## Campaign: ${campObj?.title || ""}
---
### Scene #${sceneObj.order}: ${sceneObj.title}
* **Goal / Objective**: ${sceneObj.goal}
* **Focus Point Message**: ${sceneObj.focusMessage}
* **Proposed Duration**: ${sceneObj.duration} seconds
* **Camera Shot & Framing**: ${sceneObj.cameraFraming} (${sceneObj.lightingStyle})

### AI Generative Parameters
* **Target Aspect ratio**: ${campObj?.aspectRatio || "9:16"}
* **Visual style preset lock**: ${campObj?.visualPreset || "Product Premium"}
* **Scene image custom prompt (English)**: 
> \`\`\`
> ${outputObj?.imagePrompt || ""}
> \`\`\`
* **Motion video flow prompt (English)**:
> \`\`\`
> ${outputObj?.videoPrompt || ""}
> \`\`\`

### Voice Speaking Script (Indonesian)
* **Narrative Voice**:
> "${outputObj?.narration || ""}"

### Screen Overlay Text Highlights
${outputObj?.textHighlights.map(h => `- **${h}**`).join("\n") || "None proposed."}

### Editing Cuts & Transition Guidelines
${outputObj?.editingRecommendation.map(r => `* ${r}`).join("\n") || "None proposed."}
`;

      const newAsset: Asset = {
        id: "asset_md_" + Date.now() + "_" + sceneObj.order,
        campaignId: sceneObj.campaignId,
        sceneId: sceneObj.id,
        name: `Approved_Promo_Scene_${sceneObj.order}_Storyboard.md`,
        type: "export_markdown",
        sourceType: "exported",
        fileUrl: null,
        fileData: `data:text/markdown;base64,${btoa(encodeURIComponent(markdown).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))}`,
        mimeType: "text/markdown",
        promptSource: markdown,
        narrationSource: null,
        metadata: {
          sceneTitle: sceneObj.title
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const withoutExp = assets.filter(a => !(a.sceneId === sceneId && a.type === "export_markdown"));
      updateStoredAssets([...withoutExp, newAsset]);

      // Check if ALL scenes of the campaign are approved. If so, toggles campaign status to Completed!
      const campScenes = updatedScenes.filter(s => s.campaignId === sceneObj.campaignId);
      const allApproved = campScenes.every(s => s.status === "Approved");

      const updatedCamps = campaigns.map(c => {
        if (c.id === sceneObj.campaignId) {
          return {
            ...c,
            status: allApproved ? ("Completed" as const) : ("In Progress" as const),
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      });
      updateStoredCampaigns(updatedCamps);
    }
  };

  const handleDuplicateCampaign = (campaignId: string) => {
    const orig = campaigns.find(c => c.id === campaignId);
    if (!orig) return;

    const newCampId = "camp_dup_" + Date.now();
    const duplicatedCampaign: Campaign = {
      ...JSON.parse(JSON.stringify(orig)),
      id: newCampId,
      title: `${orig.title} (Copy)`,
      status: "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Duplicate scenes
    const origScenes = scenes.filter(s => s.campaignId === campaignId);
    const duplicatedScenes = origScenes.map((s, idx) => ({
      ...JSON.parse(JSON.stringify(s)),
      id: "scene_dup_" + Date.now() + "_" + idx,
      campaignId: newCampId,
      status: "Not Generated"
    }));

    // Duplicate outputs
    const origOutputs = sceneOutputs.filter(o => o.campaignId === campaignId);
    const duplicatedOutputs = origOutputs.map((o, idx) => {
      // Find linked duplicated scene ID
      const sceneIndex = origScenes.findIndex(s => s.id === o.sceneId);
      const linkedDupScene = duplicatedScenes[sceneIndex];
      return {
        ...JSON.parse(JSON.stringify(o)),
        id: "out_dup_" + Date.now() + "_" + idx,
        campaignId: newCampId,
        sceneId: linkedDupScene ? linkedDupScene.id : ""
      };
    }).filter(o => o.sceneId);

    updateStoredCampaigns([...campaigns, duplicatedCampaign]);
    updateStoredScenes([...scenes, ...duplicatedScenes]);
    updateStoredOutputs([...sceneOutputs, ...duplicatedOutputs]);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (confirm("Apakah anda yakin ingin menghapus campaign ini secara permanen beserta semua scenes dan asset?")) {
      const removedScenes = scenes.filter(s => s.campaignId === campaignId);
      const removedAssets = assets.filter(a => a.campaignId === campaignId);

      const filteredCamps = campaigns.filter(c => c.id !== campaignId);
      updateStoredCampaigns(filteredCamps);

      const filteredScenes = scenes.filter(s => s.campaignId !== campaignId);
      updateStoredScenes(filteredScenes);

      const filteredOutputs = sceneOutputs.filter(o => o.campaignId !== campaignId);
      updateStoredOutputs(filteredOutputs);

      const filteredAssets = assets.filter(a => a.campaignId !== campaignId);
      updateStoredAssets(filteredAssets);
      void cleanupCampaignMedia(campaignId);
      void Promise.all(removedScenes.map((scene) => cleanupSceneMedia(scene.id)));
      void Promise.all(removedAssets.map((asset) => cleanupAssetMedia(asset.id)));

      if (activeCampaignId === campaignId) {
        setActiveCampaignId(null);
        setActiveView("dashboard");
      }
    }
  };

  // Template select trigger
  const handleSelectTemplate = (template: Partial<Campaign>) => {
    setTemplatePrefill(template);
    setCampaignSetupScenesPrefill(undefined);
    setActiveView("new_campaign");
  };

  const handleResumeCampaignSetup = (campaignId: string) => {
    const targetCampaign = campaigns.find((campaign) => campaign.id === campaignId);
    if (!targetCampaign) return;

    const relatedScenes = scenes
      .filter((scene) => scene.campaignId === campaignId)
      .sort((left, right) => left.order - right.order);

    setTemplatePrefill(targetCampaign);
    setCampaignSetupScenesPrefill(relatedScenes);
    setActiveView("new_campaign");
  };

  // Global settings action save
  const handleSaveSettings = (updated: SettingsType) => {
    updateStoredSettings(updated);
  };

  // Find active campaign in Scene Builder
  const builderCampaign = campaigns.find(c => c.id === activeCampaignId) || campaigns[0];

  return (
    <div id="full-stack-viewport" className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      
      {/* LEFT NAVIGATION DRAWER RAIL */}
      <aside className="w-64 bg-slate-900 text-slate-400 shrink-0 flex flex-col justify-between border-r border-slate-800 shadow-lg select-none">
        <div className="space-y-6">
          {/* WarnaFit Custom Branding Header */}
          <div className="m-5 flex items-center gap-3 border-b border-slate-850 pb-4">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow shadow-blue-500">
              <Flame size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-white font-extrabold text-base tracking-tight leading-none uppercase">WarnaFit</h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mt-1 block">Scene Assistant</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-1">
            {[
              { id: "dashboard", label: "My Campaigns", icon: Folder },
              { id: "new_campaign", label: "Create Promo", icon: PlusCircle },
              { id: "assets", label: "Campaign Assets", icon: FolderLock },
              { id: "templates", label: "Visual Formulas", icon: Compass },
              { id: "settings", label: "System Settings", icon: SettingsIcon }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id || (item.id === "new_campaign" && activeView === "new_campaign");
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "new_campaign") {
                      setTemplatePrefill(undefined);
                    }
                    setActiveView(item.id as any);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "hover:bg-slate-850 hover:text-slate-200"
                  }`}
                >
                  <Icon size={17} className={isActive ? "text-white" : "text-slate-500"} />
                  {item.label}
                </button>
              );
            })}

            {/* Quick Link block to active Scene Builder if selected */}
            {builderCampaign && (
              <button
                onClick={() => {
                  setActiveCampaignId(builderCampaign.id);
                  setActiveView("scene_builder");
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeView === "scene_builder"
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "hover:bg-slate-850 hover:text-slate-200"
                }`}
              >
                <Video size={17} className={activeView === "scene_builder" ? "text-white" : "text-slate-500"} />
                Active Scene Builder
              </button>
            )}
          </nav>
        </div>

        {/* User Account footer details inside Sidebar column */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/40 text-slate-500 text-xs flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            <User size={14} className="text-slate-400" />
          </div>
          <div className="truncate leading-none">
            <span className="text-slate-300 font-bold block truncate">krishnaasmara0@gmail.com</span>
            <span className="text-[10px] text-slate-600 block mt-1 uppercase tracking-widest font-mono">Creator Mode</span>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        
        {/* Top Header Rail Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Promo Scene Engine v3.5 • Ready
            </span>
          </div>

          <div className="text-slate-400 text-xs font-mono">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </div>
        </header>

        {/* Scrollable primary body workspace */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {activeView === "dashboard" && (
            <DashboardView
              campaigns={campaigns}
              scenes={scenes}
              onNavigateToNewCampaign={() => {
                setTemplatePrefill(undefined);
                setCampaignSetupScenesPrefill(undefined);
                setActiveView("new_campaign");
              }}
              onResumeCampaignSetup={handleResumeCampaignSetup}
              onNavigateToSceneBuilder={(campaignId) => {
                setActiveCampaignId(campaignId);
                setActiveView("scene_builder");
              }}
              onDuplicateCampaign={handleDuplicateCampaign}
              onDeleteCampaign={handleDeleteCampaign}
            />
          )}

          {activeView === "new_campaign" && (
            <NewCampaignView
              initialTemplate={templatePrefill}
              initialScenes={campaignSetupScenesPrefill}
              onBackToDashboard={() => setActiveView("dashboard")}
              onGenerateScenePlan={handleGenerateAIScenePlan}
              onSaveCampaignPlan={handleSaveCampaignPlan}
            />
          )}

          {activeView === "scene_builder" && builderCampaign && (
            <SceneBuilderView
              campaign={builderCampaign}
              settings={settings}
              scenes={scenes.filter(s => s.campaignId === builderCampaign.id)}
              sceneOutputs={sceneOutputs.filter(o => o.campaignId === builderCampaign.id)}
              assets={assets.filter(a => a.campaignId === builderCampaign.id)}
              onGenerateSceneOutput={handleGenerateAISceneOutput}
              onRegenerateBackgroundSuggestion={handleRegenerateBackgroundSuggestion}
              onGenerateImageAsset={handleGenerateImageAsset}
              onGenerateVoiceAsset={handleGenerateVoiceAsset}
              onSaveSceneChanges={handleSaveSceneChanges}
              onAddNewScene={handleAddNewSceneInBuilder}
              onDeleteScene={handleDeleteSceneInBuilder}
              onApproveScene={handleApproveSceneInBuilder}
            />
          )}

          {activeView === "assets" && (
            <CampaignAssetsView
              campaigns={campaigns}
              assets={assets}
              onDeleteAsset={(assetId) => {
                const refreshed = assets.filter(a => a.id !== assetId);
                updateStoredAssets(refreshed);
                void cleanupAssetMedia(assetId);
              }}
            />
          )}

          {activeView === "templates" && (
            <PromptTemplatesView
              onSelectTemplate={handleSelectTemplate}
            />
          )}

          {activeView === "settings" && (
            <SettingsView
              currentSettings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </div>
      </main>
    </div>
  );
}
