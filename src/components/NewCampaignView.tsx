import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Upload,
  Trash2,
  Plus,
  Copy,
  ChevronUp,
  ChevronDown,
  Check,
  HelpCircle,
  Video,
  FileText,
  MousePointer,
  Settings,
  X
} from "lucide-react";
import { Campaign, Scene } from "../types";

interface NewCampaignViewProps {
  onBackToDashboard: () => void;
  onGenerateScenePlan: (campaignData: Partial<Campaign>) => Promise<Scene[]>;
  onSaveCampaignPlan: (campaign: Campaign, scenes: Scene[]) => void;
  initialTemplate?: Partial<Campaign>;
  initialScenes?: Scene[];
}

export default function NewCampaignView({
  onBackToDashboard,
  onGenerateScenePlan,
  onSaveCampaignPlan,
  initialTemplate,
  initialScenes
}: NewCampaignViewProps) {
  const existingCampaign = initialTemplate?.id ? (initialTemplate as Campaign) : null;
  const existingScenes = (initialScenes || []).map((scene) => ({ ...scene }));
  const hasExistingScenePlan = existingScenes.length > 0;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields State - Step 1: Product Brief
  const [campaignTitle, setCampaignTitle] = useState(initialTemplate?.title || "");
  const [productName, setProductName] = useState(initialTemplate?.productName || "");
  const [productCategory, setProductCategory] = useState(initialTemplate?.productCategory || "Gadget");
  const [productDescription, setProductDescription] = useState(initialTemplate?.productDescription || "");
  const [productImage, setProductImage] = useState<string | null>(initialTemplate?.productImage || null);
  const [benefits, setBenefits] = useState(initialTemplate?.benefits || "");
  const [keyPoints, setKeyPoints] = useState(initialTemplate?.keyPoints || "");
  const [targetAudience, setTargetAudience] = useState(initialTemplate?.targetAudience || "");
  const [problemSolved, setProblemSolved] = useState(initialTemplate?.problemSolved || "");
  const [specialNotes, setSpecialNotes] = useState(initialTemplate?.specialNotes || "");

  // Form Fields State - Step 2: Video Setup
  const [platform, setPlatform] = useState(initialTemplate?.platform || "TikTok");
  const [totalDuration, setTotalDuration] = useState<number>(initialTemplate?.totalDuration || 15);
  const [aspectRatio, setAspectRatio] = useState(initialTemplate?.aspectRatio || "9:16");
  const [sceneCount, setSceneCount] = useState<number>(initialTemplate?.sceneCount || 4);
  const [visualPreset, setVisualPreset] = useState(initialTemplate?.visualPreset || "Marketplace Clean");

  // Model reference optional toggle
  const [useModelReference, setUseModelReference] = useState<boolean>(initialTemplate?.useModelReference || false);
  const [modelReferenceImage, setModelReferenceImage] = useState<string | null>(initialTemplate?.modelReferenceImage || null);
  const [modelType, setModelType] = useState(initialTemplate?.modelType || "Avatar / Character");
  const [modelUsage, setModelUsage] = useState(initialTemplate?.modelUsage || "Opening presenter");
  const [modelReferenceNotes, setModelReferenceNotes] = useState(initialTemplate?.modelReferenceNotes || "");

  // Background reference optional toggle
  const [useBackgroundReference, setUseBackgroundReference] = useState<boolean>(initialTemplate?.useBackgroundReference || false);
  const [backgroundReferenceImage, setBackgroundReferenceImage] = useState<string | null>(initialTemplate?.backgroundReferenceImage || null);
  const [backgroundReferenceNotes, setBackgroundReferenceNotes] = useState(initialTemplate?.backgroundReferenceNotes || "");

  // Additional options
  const [narrationTone, setNarrationTone] = useState<string>(initialTemplate?.narrationTone || "Friendly");
  const [language, setLanguage] = useState<string>(initialTemplate?.language || "Indonesian");
  const [ctaType, setCtaType] = useState<string>(initialTemplate?.ctaType || "Cek keranjang");

  // Step 3 state (The resulting generated scene plan)
  const [generatedCampaign, setGeneratedCampaign] = useState<Campaign | null>(existingCampaign);
  const [tempScenes, setTempScenes] = useState<Scene[]>(existingScenes);

  // File Input Refs
  const productImageRef = useRef<HTMLInputElement>(null);
  const modelReferenceImageRef = useRef<HTMLInputElement>(null);
  const backgroundReferenceImageRef = useRef<HTMLInputElement>(null);

  // Handle Base64 Encoding
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, setter: (val: string | null) => void) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step Progression checks
  const handleNextStep = () => {
    if (step === 1) {
      if (!campaignTitle.trim() || !productName.trim() || !benefits.trim() || !keyPoints.trim()) {
        setErrorMessage("Silakan isi semua field wajib (*): Judul Kampanye, nama produk, manfaat produk, dan highlights.");
        return;
      }
      setErrorMessage(null);
      setStep(2);
    }
  };

  const buildCurrentCampaignDraft = (status: Campaign["status"] = "Scene Planned"): Campaign => {
    const nowIso = new Date().toISOString();

    return {
      id: existingCampaign?.id || "camp_" + Date.now(),
      title: campaignTitle,
      productName,
      productCategory,
      productDescription,
      productImage,
      benefits,
      keyPoints,
      targetAudience,
      problemSolved,
      specialNotes,
      platform,
      totalDuration,
      sceneCount,
      aspectRatio,
      visualPreset,
      useBackgroundReference,
      backgroundReferenceImage,
      backgroundReferenceNotes,
      narrationTone,
      language,
      useModelReference,
      modelReferenceImage,
      modelType,
      modelUsage,
      modelReferenceNotes,
      ctaType,
      totalAssets: existingCampaign?.totalAssets || 0,
      totalGeneratedImages: existingCampaign?.totalGeneratedImages || 0,
      totalGeneratedVoices: existingCampaign?.totalGeneratedVoices || 0,
      status,
      createdAt: existingCampaign?.createdAt || nowIso,
      updatedAt: nowIso
    };
  };

  const handleReviewExistingScenePlan = () => {
    if (!hasExistingScenePlan) return;
    setErrorMessage(null);
    setGeneratedCampaign(buildCurrentCampaignDraft("Scene Planned"));
    setStep(3);
  };

  // Build temporary structured JSON trigger to backend
  const handleTriggerAIScenePlanGeneration = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingMessage("Membaca rincian produk...");

    const partialCamp: Partial<Campaign> = buildCurrentCampaignDraft("Scene Planned");

    try {
      setTimeout(() => setLoadingMessage("Mengirim data ke Google Gemini 3.5..."), 1200);
      setTimeout(() => setLoadingMessage("Mempersiapkan struktur scene storyboarding..."), 2800);
      setTimeout(() => setLoadingMessage("Menyesuaikan durasi video format " + platform + "..."), 4500);

      const computedScenes = await onGenerateScenePlan(partialCamp);
      const newCampaign: Campaign = buildCurrentCampaignDraft("Scene Planned");

      setGeneratedCampaign(newCampaign);
      // Map scenes order fields correctly
      setTempScenes(computedScenes.map((s, idx) => ({
        ...s,
        id: "scene_" + newCampaign.id + "_" + Date.now() + "_" + idx,
        campaignId: newCampaign.id,
        order: idx + 1,
        createdAt: s.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));

      setStep(3);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to contact Google Gemini API. Please make sure the Gemini API Key is configured in Settings.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reordering controls
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...tempScenes];
    const prev = items[index - 1];
    items[index - 1] = { ...items[index], order: index };
    items[index] = { ...prev, order: index + 1 };
    setTempScenes(items);
  };

  const handleMoveDown = (index: number) => {
    if (index === tempScenes.length - 1) return;
    const items = [...tempScenes];
    const next = items[index + 1];
    items[index + 1] = { ...items[index], order: index + 2 };
    items[index] = { ...next, order: index + 1 };
    setTempScenes(items);
  };

  // Scene edits in planner
  const handleSceneTitleChange = (index: number, val: string) => {
    const updated = [...tempScenes];
    updated[index].title = val;
    setTempScenes(updated);
  };

  const handleSceneDurationChange = (index: number, val: number) => {
    const updated = [...tempScenes];
    updated[index].duration = val;
    setTempScenes(updated);
  };

  const handleDeleteScene = (index: number) => {
    if (tempScenes.length <= 1) return;
    const updated = tempScenes.filter((_, idx) => idx !== index).map((s, idx) => ({
      ...s,
      order: idx + 1
    }));
    setTempScenes(updated);
  };

  const handleDuplicateScene = (index: number) => {
    const target = tempScenes[index];
    const duplicate: Scene = {
      ...JSON.parse(JSON.stringify(target)),
      id: "scene_dup_" + Date.now() + "_" + index,
      title: `${target.title} (Copy)`,
      order: tempScenes.length + 1,
      status: "Not Generated"
    };
    setTempScenes([...tempScenes, duplicate]);
  };

  const handleCreateEmptyScene = () => {
    const newEmpty: Scene = {
      id: "scene_empty_" + Date.now(),
      campaignId: generatedCampaign?.id || "",
      order: tempScenes.length + 1,
      title: "Scene Baru",
      type: "benefit_highlight",
      goal: "Tampilkan detail produk lainnya",
      description: "Tampilan produk yang menonjol diletakkan di latar depan.",
      duration: 3,
      focusMessage: "Fokus produk bersih",
      modelPresence: "Product Only",
      productPresence: "Visible",
      subjectPresence: "Product only",
      backgroundMode: "AI Suggested",
      background: "Clean marketplace studio",
      backgroundPrompt: "A clean modern photoshoot studio background for ecommerce catalog products with warm minimal daylight, 8k resolution.",
      sceneBackgroundImage: null,
      backgroundNotes: "",
      cameraFraming: "Product close-up",
      mood: "Friendly",
      lightingStyle: "Bright soft lighting",
      styleLock: ["Clean marketplace promo"],
      narrationDirection: "Jelaskan keunggulan tambahan produk secara ringkas.",
      textHighlightDirection: "Tambahkan teks label sorotan.",
      editingDirection: "Slow zoom-in.",
      ctaDirection: "",
      status: "Not Generated",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTempScenes([...tempScenes, newEmpty]);
  };

  // Final confirmation to continue block
  const handleProceedToSceneBuilder = () => {
    if (!generatedCampaign) return;
    // Calculate final duration
    const totalDurationCalculated = tempScenes.reduce((acc, s) => acc + s.duration, 0);
    const updatedCampaign: Campaign = {
      ...generatedCampaign,
      totalDuration: totalDurationCalculated,
      sceneCount: tempScenes.length
    };
    onSaveCampaignPlan(updatedCampaign, tempScenes);
  };

  return (
    <div id="new-campaign-container" className="space-y-8 animate-fade-in pb-16">

      {/* AIS Loader Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-6 border border-slate-100">
            <div className="relative inline-block">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Menghasilkan Scene Plan Terstruktur</h3>
              <p className="text-slate-500 text-xs font-mono tracking-wide mt-2">{loadingMessage}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-slate-400 text-[11px] leading-relaxed">
              Menganalisis keunggulan produk Anda dan menyusun alur scene video promo terbaik yang persuasif & berkonversi tinggi.
            </div>
          </div>
        </div>
      )}

      {/* Header and Step Indicators */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors cursor-pointer group mb-1"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Campaigns
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            {existingCampaign ? "Resume Campaign Setup" : "Create New Campaign"}
          </h1>
        </div>

        {/* Multi-step progress tracker */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
          <div className={`p-2 py-1 flex items-center gap-1.5 rounded-md text-xs font-semibold ${step === 1 ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>1</span>
            Product Brief
          </div>
          <div className="w-4 h-px bg-slate-300" />
          <div className={`p-2 py-1 flex items-center gap-1.5 rounded-md text-xs font-semibold ${step === 2 ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>2</span>
            Video Setup
          </div>
          <div className="w-4 h-px bg-slate-300" />
          <div className={`p-2 py-1 flex items-center gap-1.5 rounded-md text-xs font-semibold ${step === 3 ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>3</span>
            Scene Planner
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200 flex items-start gap-2.5">
          <div className="font-bold shrink-0">Peringatan:</div>
          <div className="flex-1">{errorMessage}</div>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700 shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {existingCampaign && (
        <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl border border-blue-200 flex items-start gap-2.5">
          <div className="font-bold shrink-0">Resume:</div>
          <div className="flex-1">
            Campaign ini dibuka kembali dengan data lama. Anda bisa lanjut dari brief, video setup, atau gunakan scene plan yang sudah ada tanpa regenerate.
          </div>
        </div>
      )}

      {/* STEP 1: PRODUCT BRIEF */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                Main Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Campaign Name *</label>
                  <input
                    type="text"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    placeholder="e.g., Summer Oil Promo"
                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Product Name *</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., UltraGlow Serum"
                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Product Category *</label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer"
                >
                  {["Gadget", "Fashion", "Beauty / Cosmetics", "Automotive / Oil", "Food & Beverage", "Home / Kitchen", "Health", "Other"].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Product Description</label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Briefly describe what the product is, its primary function, texture, target usage, and features..."
                  rows={4}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg p-3.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all leading-relaxed font-normal"
                />
              </div>
            </div>

            {/* Marketing Details Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <Sparkles size={16} className="text-blue-500" />
                Marketing & Narration Details
              </h3>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Benefits (Used for Narration) *</label>
                  <span className="text-[10px] text-slate-400 font-semibold font-mono">1 benefit per line recommended</span>
                </div>
                <textarea
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="What value does this product bring to the user? Used extensively in speaking voice notes.&#13;e.g.,&#13;Mesin terasa lebih halus&#13;Cocok untuk pemakaian harian&#13;Membantu perlindungan mesin optimal"
                  rows={3}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg p-3.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Key Points / Highlights (Used for Overlays & Text Badges) *</label>
                  <span className="text-[10px] text-slate-400 font-semibold font-mono">Separated by comma or new line</span>
                </div>
                <textarea
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  placeholder="Short, punchy facts for text overlays and badges.&#13;e.g., Full Synthetic, SAE 10W-40, API SL, JASO MA2"
                  rows={2}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Audience (Optional)</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Pengendara Motor Harian"
                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Problem Solved (Optional)</label>
                  <input
                    type="text"
                    value={problemSolved}
                    onChange={(e) => setProblemSolved(e.target.value)}
                    placeholder="e.g., Suara bising mesin dan getaran kasar"
                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Special Notes / Directives (Optional)</label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g., Tonjolkan bagian botol merah berkilau, jangan sebut merek lain."
                  className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Product Image Reference Sidebar Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Product Assets</h3>
                <p className="text-xs text-slate-400 mt-1">Upload a clear, well-lit photo of your product to keep shapes, packaging labels, and colors persistent.</p>
              </div>

              <div
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-white"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, setProductImage)}
                onClick={() => productImageRef.current?.click()}
              >
                <input
                  type="file"
                  id="product-image-upload"
                  ref={productImageRef}
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setProductImage)}
                  className="hidden"
                />

                {productImage ? (
                  <div className="space-y-4 leading-none">
                    <img
                      src={productImage}
                      alt="Product Reference"
                      className="max-h-48 mx-auto rounded-lg border border-slate-200 shadow-2xs object-contain bg-white"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setProductImage(null); }}
                        className="text-xs text-red-600 font-bold hover:underline"
                      >
                        Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload size={32} className="text-slate-400 mx-auto" />
                    <div>
                      <span className="text-blue-600 font-bold text-sm">Click to upload image</span>
                      <p className="text-xs text-slate-400 mt-0.5">or drag and drop here</p>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded border border-slate-200/50">PNG, JPG up to 10MB</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: VIDEO SETUP */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main config columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <Video size={16} className="text-slate-400" />
                Video Format & Style
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Platform Destination</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm cursor-pointer"
                  >
                    {["TikTok", "Shopee Video", "Instagram Reels", "YouTube Shorts", "WhatsApp Status", "Custom"].map(plat => (
                      <option key={plat} value={plat}>{plat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Total Target Duration</label>
                  <select
                    value={totalDuration}
                    onChange={(e) => setTotalDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm cursor-pointer"
                  >
                    <option value={10}>10 Seconds (Very Fast Hook)</option>
                    <option value={15}>15 Seconds (Short & Punchy)</option>
                    <option value={20}>20 Seconds (Express Demo)</option>
                    <option value={30}>30 Seconds (Detail Review)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Aspect Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm cursor-pointer"
                  >
                    <option value="9:16">9:16 (TikTok, Shorts, Reels)</option>
                    <option value="3:4">3:4 (Marketplace Feed / Shopee Recommend)</option>
                    <option value="1:1">1:1 (Square Grid Post)</option>
                    <option value="4:3">4:3 (Traditional Landscape Video)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Scene Count (AI Generated)</label>
                  <select
                    value={sceneCount}
                    onChange={(e) => setSceneCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm cursor-pointer"
                  >
                    <option value={3}>3 Scenes (Hook - Advantage - Call-to-action)</option>
                    <option value={4}>4 Scenes (Standard Promo Flow)</option>
                    <option value={5}>5 Scenes (Comprehensive Showcase)</option>
                    <option value={6}>6 Scenes (Deep specs showcase)</option>
                  </select>
                </div>
              </div>

              {/* Visual Preset Selection - Cards */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">Global Visual Preset Style</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: "Marketplace Clean", title: "Marketplace Clean", desc: "Bright, minimal clutter, product focus, perfect for affiliate uploads cataloging.", color: "bg-teal-50 text-teal-700" },
                    { id: "Product Premium", title: "Product Premium", desc: "Deep shadows, polished cinema studio grade lighting for luxurious feel.", color: "bg-blue-50 text-blue-700" },
                    { id: "Home Lifestyle", title: "Home Lifestyle", desc: "Warm cozy daylit relatable living room / cozy backdrop environments.", color: "bg-amber-50 text-amber-700" },
                    { id: "Product Detail", title: "Product Detail", desc: "Close-up specs macro texture specifications focus highlight overlays.", color: "bg-indigo-50 text-indigo-700" },
                    { id: "Character / Presenter Promo", title: "Character Promo", desc: "Subject presenter centric layout where character is main focus point.", color: "bg-slate-100 text-slate-800" },
                  ].map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => setVisualPreset(preset.id)}
                      className={`border p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between h-36 ${visualPreset === preset.id
                        ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-500/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                    >
                      <div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${preset.color}`}>
                          {preset.title}
                        </span>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                          {preset.desc}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-auto ${visualPreset === preset.id ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                          }`}>
                          {visualPreset === preset.id && <Check size={10} className="stroke-[3]" />}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Reference Upload Section (Optional toggle block) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    Model Reference
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Optional. Provide physical face characters or pose presenter style anchors.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useModelReference}
                    onChange={(e) => setUseModelReference(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {useModelReference && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 animate-slide-down">
                  {/* Model Image Upload */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-700 block">Model Photo Reference *</label>
                    <div
                      className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-lg p-4 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-white flex flex-col justify-center items-center h-44"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, setModelReferenceImage)}
                      onClick={() => modelReferenceImageRef.current?.click()}
                    >
                      <input
                        type="file"
                        id="model-image-upload"
                        ref={modelReferenceImageRef}
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setModelReferenceImage)}
                        className="hidden"
                      />
                      {modelReferenceImage ? (
                        <div className="space-y-2">
                          <img
                            src={modelReferenceImage}
                            alt="Model Ref"
                            className="max-h-28 mx-auto rounded border border-slate-100 object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setModelReferenceImage(null); }}
                            className="text-[10px] text-red-600 hover:underline block mx-auto font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload size={24} className="text-slate-400 mx-auto" />
                          <span className="text-xs text-blue-600 font-bold block">Upload character photo</span>
                          <span className="text-[9px] text-slate-400 font-mono text-center leading-none">Avatar, presenter, or hand model</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Model settings fields */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Model Type</label>
                      <select
                        value={modelType}
                        onChange={(e) => setModelType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer"
                      >
                        {["Avatar / Character", "Real Person", "Hand Model Only", "Presenter", "Product Only / No Model"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Usage Mode</label>
                      <select
                        value={modelUsage}
                        onChange={(e) => setModelUsage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer"
                      >
                        {["Opening presenter", "Product holder", "Explainer", "CTA pointer", "Lifestyle subject", "Hand-only product demo"].map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 font-sans">Model Details instructions</label>
                      <input
                        type="text"
                        value={modelReferenceNotes}
                        onChange={(e) => setModelReferenceNotes(e.target.value)}
                        placeholder="e.g., Gunakan hijab abu-abu, kemeja putih kasual..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Background Reference Upload Section (Optional Toggle) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    Background Reference
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-sans">Optional. Suggest specific rooms, locations, studios, or workspace environments.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useBackgroundReference}
                    onChange={(e) => setUseBackgroundReference(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {useBackgroundReference && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 animate-slide-down">
                  {/* Background photo upload area */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-700 block">Environment Photo Reference *</label>
                    <div
                      className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-lg p-4 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-white flex flex-col justify-center items-center h-44"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, setBackgroundReferenceImage)}
                      onClick={() => backgroundReferenceImageRef.current?.click()}
                    >
                      <input
                        type="file"
                        id="background-image-upload"
                        ref={backgroundReferenceImageRef}
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setBackgroundReferenceImage)}
                        className="hidden"
                      />
                      {backgroundReferenceImage ? (
                        <div className="space-y-2">
                          <img
                            src={backgroundReferenceImage}
                            alt="Background Ref"
                            className="max-h-28 mx-auto rounded border border-slate-100 object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setBackgroundReferenceImage(null); }}
                            className="text-[10px] text-red-600 hover:underline block mx-auto font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload size={24} className="text-slate-400 mx-auto" />
                          <span className="text-xs text-blue-600 font-bold block">Upload background scene</span>
                          <span className="text-[9px] text-slate-400 font-mono text-center leading-none">Studio, garage, salon, kitchen lounge</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes on background usage */}
                  <div className="space-y-1.5 flex flex-col justify-center">
                    <label className="text-xs font-bold text-slate-700">Environment Instructions & Context</label>
                    <textarea
                      value={backgroundReferenceNotes}
                      onChange={(e) => setBackgroundReferenceNotes(e.target.value)}
                      placeholder="e.g., Garasi motor modern bersih, pencahayaan alami masuk dari jendela kaca besar..."
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs leading-relaxed font-sans"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Voice tone side parameters */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">
                Narration Tone & language
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Narration Tone style</label>
                <select
                  value={narrationTone}
                  onChange={(e) => setNarrationTone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium cursor-pointer"
                >
                  {["Friendly", "Review style", "Fun", "Soft selling", "Edukatif", "Urgent", "Formal"].map((tone) => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Language</label>
                <input
                  type="text"
                  value={language}
                  disabled
                  className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-lg p-2 text-xs font-medium font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Primary Action CTA *</label>
                <select
                  value={ctaType}
                  onChange={(e) => setCtaType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium cursor-pointer"
                >
                  {["Cek keranjang kuning", "Klik link di bio", "Klik produk sekarang", "Beli sekarang", "Simpan dulu produknya", "Custom CTA"].map((cta) => (
                    <option key={cta} value={cta}>{cta}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SCENE PLANNER (REORDER AND REVIEW) */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Refine Your Scene Plan</h2>
            <p className="text-sm text-slate-500 mt-1">
              Google Gemini has generated a structured storyboard scene plan for your campaign. Review details, adjust durations, reorder, or duplicate before building detailed outputs.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sidebar-border bg-slate-50 text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                  <th className="py-3 px-4 text-center w-12">Move</th>
                  <th className="py-3 px-4 text-center w-12">No</th>
                  <th className="py-3 px-4 w-60">Scene Details</th>
                  <th className="py-3 px-4">Goal / Visual Concept</th>
                  <th className="py-3 px-4 w-32">Duration</th>
                  <th className="py-3 px-4 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {tempScenes.map((scene, index) => (
                  <tr key={scene.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5 text-slate-300">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="hover:text-slate-600 disabled:opacity-30 disabled:hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === tempScenes.length - 1}
                          className="hover:text-slate-600 disabled:opacity-30 disabled:hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-700 font-mono">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mx-auto border border-slate-200/80">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-4 px-4 space-y-1">
                      <input
                        type="text"
                        value={scene.title}
                        onChange={(e) => handleSceneTitleChange(index, e.target.value)}
                        className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded px-1 w-full text-sm leading-none py-1 transition-all"
                      />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono bg-indigo-50 text-indigo-700 mt-1 inline-block">
                        {scene.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1 font-sans">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 inline-block">
                          {scene.goal}
                        </span>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">{scene.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={15}
                          value={scene.duration}
                          onChange={(e) => handleSceneDurationChange(index, Number(e.target.value))}
                          className="w-14 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-center text-xs font-bold leading-none font-mono"
                        />
                        <span className="text-xs text-slate-400 font-medium">sec</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleDuplicateScene(index)}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                          title="Duplicate scene"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteScene(index)}
                          disabled={tempScenes.length <= 1}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          title="Delete scene"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-100 shrink-0">
            <button
              onClick={handleCreateEmptyScene}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 border border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/10 p-2 py-1.5 rounded-md transition-all cursor-pointer"
            >
              <Plus size={14} className="stroke-[2.5]" />
              Add Scene
            </button>

            <span className="text-xs font-bold font-mono text-slate-400">
              Total Duration: <span className="text-slate-800 font-extrabold">{tempScenes.reduce((acc, s) => acc + s.duration, 0)}s</span>
            </span>
          </div>
        </div>
      )}

      {/* Form Action Controls (Discard, Back, Next) */}
      <div id="new-campaign-actions" className="flex items-center justify-between border-t border-slate-250 pt-5 shrink-0 bg-white/70 p-4 rounded-xl shadow-2xs">
        <button
          onClick={onBackToDashboard}
          className="text-slate-500 hover:text-slate-800 text-sm font-medium hover:underline transition-colors cursor-pointer"
        >
          Discard Draft
        </button>

        <div className="flex gap-2">
          {step > 1 && (
            <button
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}

          {step === 1 && (
            <button
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4.5 py-2 text-sm font-semibold shadow shadow-blue-200 transition-all cursor-pointer"
            >
              Next: Video Setup
              <ArrowRight size={16} />
            </button>
          )}

          {step === 2 && hasExistingScenePlan && (
            <button
              onClick={handleReviewExistingScenePlan}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg px-4.5 py-2.5 text-sm font-semibold transition-all cursor-pointer"
            >
              Review Existing Scene Plan
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleTriggerAIScenePlanGeneration}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4.5 py-2.5 text-sm font-semibold shadow-md shadow-blue-200 hover:shadow-lg transition-all cursor-pointer"
            >
              <Sparkles size={16} />
              {hasExistingScenePlan ? "Regenerate Scene Plan" : "Generate Scene Plan"}
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleProceedToSceneBuilder}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-750 text-white rounded-lg px-4.5 py-2.5 text-sm font-semibold shadow-md shadow-blue-300 transition-all cursor-pointer"
            >
              Proceed to Scene Builder
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
