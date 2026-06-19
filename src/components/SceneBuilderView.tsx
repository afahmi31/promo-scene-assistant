import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon, 
  Play, 
  Pause, 
  Download,
  AlertTriangle,
  Info,
  ChevronRight,
  Eye,
  FileCode,
  Music,
  Share2,
  Lock,
  ArrowRight
} from "lucide-react";
import { Campaign, Scene, SceneOutput, Asset, Settings as SettingsType } from "../types";

const MIN_SCENE_DURATION_SECONDS = 4;

interface SceneBuilderViewProps {
  campaign: Campaign;
  settings: SettingsType;
  scenes: Scene[];
  sceneOutputs: SceneOutput[];
  assets: Asset[];
  onGenerateSceneOutput: (sceneId: string) => Promise<SceneOutput>;
  onRegenerateBackgroundSuggestion: (sceneId: string) => Promise<any>;
  onGenerateImageAsset: (sceneId: string, prompt: string, aspectRatio: string) => Promise<string>;
  onGenerateVoiceAsset: (sceneId: string, narration: string, voiceName: string, voicePrompt?: string) => Promise<string>;
  onSaveSceneChanges: (sceneId: string, updatedScene: Partial<Scene>, updatedOutput?: Partial<SceneOutput>) => void;
  onAddNewScene: () => void;
  onDeleteScene: (sceneId: string) => void;
  onApproveScene: (sceneId: string) => void;
}

export default function SceneBuilderView({
  campaign,
  settings,
  scenes,
  sceneOutputs,
  assets,
  onGenerateSceneOutput,
  onRegenerateBackgroundSuggestion,
  onGenerateImageAsset,
  onGenerateVoiceAsset,
  onSaveSceneChanges,
  onAddNewScene,
  onDeleteScene,
  onApproveScene
}: SceneBuilderViewProps) {
  const sortedScenes = [...scenes].sort((a, b) => a.order - b.order);
  const [activeSceneId, setActiveSceneId] = useState<string>(sortedScenes[0]?.id || "");
  const activeScene = scenes.find((s) => s.id === activeSceneId) || sortedScenes[0];

  // Selected scene output
  const activeOutput = sceneOutputs.find((o) => o.sceneId === activeScene?.id);

  // Loading States
  const [isGeneratingOutput, setIsGeneratingOutput] = useState(false);
  const [isRegeneratingBg, setIsRegeneratingBg] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

  // Success / Error Feedbacks
  const [imageError, setImageError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [outputFeedback, setOutputFeedback] = useState<string | null>(null);

  // Clipboard feedbacks
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Voice player element state
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Local state copy for Form fields in Center board (syncing with active scene click)
  const [sceneTitle, setSceneTitle] = useState("");
  const [sceneGoal, setSceneGoal] = useState("");
  const [sceneFocus, setSceneFocus] = useState("");
  const [sceneDuration, setSceneDuration] = useState(MIN_SCENE_DURATION_SECONDS);
  const [modelPresence, setModelPresence] = useState("");
  const [productPresence, setProductPresence] = useState("");
  const [subjectPresence, setSubjectPresence] = useState("");
  const [bgMode, setBgMode] = useState<Scene["backgroundMode"]>("AI Suggested");
  const [bgStyle, setBgStyle] = useState("");
  const [bgPromptRef, setBgPromptRef] = useState("");
  const [cameraFraming, setCameraFraming] = useState("");
  const [mood, setMood] = useState("");
  const [lighting, setLighting] = useState("");
  const [styleLockTags, setStyleLockTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  const [narrationDirection, setNarrationDirection] = useState("");
  const [overlayDirection, setOverlayDirection] = useState("");
  const [editDirection, setEditDirection] = useState("");

  // Edit in Prompt Textarea
  const [localImagePrompt, setLocalImagePrompt] = useState("");
  const [localNarration, setLocalNarration] = useState("");

  // Trigger Local Sync when activeScene shifts
  useEffect(() => {
    if (activeScene) {
      setSceneTitle(activeScene.title);
      setSceneGoal(activeScene.goal);
      setSceneFocus(activeScene.focusMessage);
      setSceneDuration(Math.max(MIN_SCENE_DURATION_SECONDS, activeScene.duration || MIN_SCENE_DURATION_SECONDS));
      setModelPresence(activeScene.modelPresence);
      setProductPresence(activeScene.productPresence);
      setSubjectPresence(activeScene.subjectPresence);
      setBgMode(activeScene.backgroundMode);
      setBgStyle(activeScene.background);
      setBgPromptRef(activeScene.backgroundPrompt);
      setCameraFraming(activeScene.cameraFraming);
      setMood(activeScene.mood);
      setLighting(activeScene.lightingStyle);
      setStyleLockTags(activeScene.styleLock || []);
      setNarrationDirection(activeScene.narrationDirection || "");
      setOverlayDirection(activeScene.textHighlightDirection || "");
      setEditDirection(activeScene.editingDirection || "");

      setImageError(null);
      setVoiceError(null);
      setOutputFeedback(null);
    }
  }, [activeSceneId, activeScene]);

  // Sync prompts content separately when activeOutput shifts
  useEffect(() => {
    if (activeOutput) {
      setLocalImagePrompt(activeOutput.imagePrompt);
      setLocalNarration(activeOutput.narration);
    } else {
      setLocalImagePrompt("");
      setLocalNarration("");
    }
  }, [activeSceneId, activeOutput]);

  if (!activeScene) {
    return (
      <div className="bg-white p-8 border border-slate-200 rounded-xl text-center">
        <p className="text-slate-500 font-medium">Belum ada scene terdaftar. Buat campaign baru untuk memulai.</p>
      </div>
    );
  }

  // Calculate narration words
  const narrationWords = localNarration ? localNarration.split(/\s+/).filter(Boolean).length : 0;
  // Indonesian average words speaking speed: ~2.5 words/second
  const maxSafeWords = Math.floor(sceneDuration * 2.5);
  const wordCountTooLong = narrationWords > maxSafeWords;

  const getVoiceToneDirection = (tone: string) => {
    switch (tone) {
      case "Friendly":
        return "warm, friendly, conversational, natural, lightly upbeat";
      case "Review style":
        return "confident, natural reviewer style, clear, trustworthy, moderately energetic";
      case "Fun":
        return "playful, lively, upbeat, expressive but still controlled";
      case "Soft selling":
        return "gentle, calm, persuasive, smooth, non-aggressive";
      case "Edukatif":
        return "clear, informative, articulate, steady, easy to understand";
      case "Urgent":
        return "energetic, persuasive, fast-paced but still clean and intelligible";
      case "Formal":
        return "polished, composed, professional, controlled";
      default:
        return "clear, natural, consistent, professional";
    }
  };

  const buildVoiceGenerationPrompt = (narration: string) => {
    const cleanedNarration = (narration || "").trim();
    const quotedNarration = cleanedNarration ? `"${cleanedNarration}"` : "\"Narration script pending\"";

    return [
      "Generate Indonesian voiceover for a short promotional video.",
      "Use the exact same speaker identity, timbre, accent, age impression, mic distance, recording cleanliness, and speaking style across every scene in this campaign.",
      "Do not switch speaker character, gender impression, vocal texture, or delivery style between scenes.",
      `Delivery style: ${getVoiceToneDirection(campaign.narrationTone)}.`,
      `Target duration: about ${sceneDuration} seconds.`,
      "Read the script naturally in Indonesian.",
      "Keep pronunciation clean and easy to understand.",
      "Do not sing. Do not shout. Do not whisper. Do not add extra words.",
      "Do not paraphrase or rewrite the script.",
      `Scene context: ${sceneTitle || activeScene.title}.`,
      `Script: ${quotedNarration}`
    ].join(" ");
  };

  const voiceGenerationPrompt = buildVoiceGenerationPrompt(localNarration || activeOutput?.narration || "");

  // Handle Save Trigger
  const handleSaveScene = () => {
    const updatedScene: Partial<Scene> = {
      title: sceneTitle,
      goal: sceneGoal,
      focusMessage: sceneFocus,
      duration: Math.max(MIN_SCENE_DURATION_SECONDS, sceneDuration || MIN_SCENE_DURATION_SECONDS),
      modelPresence,
      productPresence,
      subjectPresence,
      backgroundMode: bgMode,
      background: bgStyle,
      backgroundPrompt: bgPromptRef,
      cameraFraming,
      mood,
      lightingStyle: lighting,
      styleLock: styleLockTags,
      narrationDirection,
      textHighlightDirection: overlayDirection,
      editingDirection: editDirection
    };

    const updatedOutput: Partial<SceneOutput> | undefined = activeOutput ? {
      imagePrompt: localImagePrompt,
      narration: localNarration
    } : undefined;

    onSaveSceneChanges(activeScene.id, updatedScene, updatedOutput);
    setOutputFeedback("Scene successfully saved locally!");
    setTimeout(() => setOutputFeedback(null), 3000);
  };

  // 1. Generate core prompts (calls Google Gemini API)
  const handleGeneratePromptsPack = async () => {
    setIsGeneratingOutput(true);
    setImageError(null);
    setVoiceError(null);
    try {
      // First save active form changes to make sure inputs are updated
      handleSaveScene();

      const output = await onGenerateSceneOutput(activeScene.id);
      setLocalImagePrompt(output.imagePrompt);
      setLocalNarration(output.narration);
      setOutputFeedback("AI prompts successfully generated with Gemini!");
    } catch (err: any) {
      console.error(err);
      setImageError("Gagal memanggil Gemini API: " + (err.message || err));
    } finally {
      setIsGeneratingOutput(false);
    }
  };

  // 2. Quick Background suggestion
  const handleRegenerateBgSuggestion = async () => {
    setIsRegeneratingBg(true);
    try {
      const sug = await onRegenerateBackgroundSuggestion(activeScene.id);
      if (sug) {
        setBgStyle(sug.background);
        setBgPromptRef(sug.backgroundPrompt);
        setMood(sug.mood);
        setLighting(sug.lightingStyle);
        setOutputFeedback("Background suggestions updated!");
        setTimeout(() => setOutputFeedback(null), 3500);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRegeneratingBg(false);
    }
  };

  // 3. Generate Image using Gemini standard models
  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setImageError(null);
    const targetPrompt = localImagePrompt || (activeOutput?.imagePrompt);
    if (!targetPrompt) {
      setImageError("Peringatan: Silakan buat prompt gambar dahulu memakai tombol 'Generate Scene Outputs'.");
      setIsGeneratingImage(false);
      return;
    }

    try {
      await onGenerateImageAsset(activeScene.id, targetPrompt, campaign.aspectRatio);
      setOutputFeedback("Gambar berhasil diproses dengan model visual!");
    } catch (err: any) {
      console.error(err);
      setImageError(err.message || "Gagal melakukan generate gambar pada node. Pastikan API key mencukupi.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 4. Generate Voice Speech synthesizers
  const handleGenerateVoice = async () => {
    setIsGeneratingVoice(true);
    setVoiceError(null);
    const targetNarr = localNarration || (activeOutput?.narration);
    if (!targetNarr) {
      setVoiceError("Peringatan: Tidak ada naskah narasi. Tulis atau generate narasi teks terlebih dahulu.");
      setIsGeneratingVoice(false);
      return;
    }

    try {
      await onGenerateVoiceAsset(activeScene.id, targetNarr, "Kore", voiceGenerationPrompt); // Kore is default voice selection
      setOutputFeedback("Suara voiceover berhasil digenerate!");
    } catch (err: any) {
      console.error(err);
      setVoiceError(err.message || "Gagal melakukan generate voiceover speech.");
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  // Interactive style tags controls
  const handleAddStyleLockTag = () => {
    if (newTagInput.trim() && !styleLockTags.includes(newTagInput.trim())) {
      setStyleLockTags([...styleLockTags, newTagInput.trim()]);
      setNewTagInput("");
    }
  };

  const handleRemoveStyleLockTag = (tag: string) => {
    setStyleLockTags(styleLockTags.filter(t => t !== tag));
  };

  // Audio Play controls for generated voiceover
  const playVoiceAsset = (url: string) => {
    if (playingAudioUrl === url && audioElement) {
      audioElement.pause();
      setPlayingAudioUrl(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const newAudio = new Audio(url);
      newAudio.play();
      newAudio.onended = () => {
        setPlayingAudioUrl(null);
      };
      setAudioElement(newAudio);
      setPlayingAudioUrl(url);
    }
  };

  const copyToClipboard = (text: string, titleCode: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(titleCode);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Find existing generated assets for current scene
  const sceneImageAsset = assets.find(a => a.sceneId === activeScene.id && a.type === "generated_image");
  const sceneVoiceAsset = assets.find(a => a.sceneId === activeScene.id && a.type === "generated_voice");

  return (
    <div id="scene-builder-workspace" className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in pb-16 relative">
      
      {/* 1. LEFT SIDEBAR: Scene mini cards carousel */}
      <div className="xl:col-span-2 space-y-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Scenes ({sortedScenes.length})
            </h3>
            <button
              onClick={onAddNewScene}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors cursor-pointer"
              title="Add New Scene"
            >
              <Plus size={14} className="stroke-[3]" />
            </button>
          </div>

          <div className="flex flex-row xl:flex-col gap-2 overflow-x-auto xl:overflow-x-visible pb-2 xl:pb-0 select-none">
            {sortedScenes.map((scene, index) => {
              const isActive = scene.id === activeSceneId;
              const hasImg = assets.some(a => a.sceneId === scene.id && a.type === "generated_image");
              const hasVoice = assets.some(a => a.sceneId === scene.id && a.type === "generated_voice");

              return (
                <div
                  key={scene.id}
                  onClick={() => {
                    if (audioElement) {
                      audioElement.pause();
                      setPlayingAudioUrl(null);
                    }
                    setActiveSceneId(scene.id);
                  }}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all shrink-0 w-36 xl:w-full space-y-1.5 ${
                    isActive
                      ? "border-blue-600 bg-blue-50/35 ring-1 ring-blue-500/10 shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono text-slate-400">
                      SCENE #{index + 1}
                    </span>
                    <div className="flex gap-1">
                      {hasImg && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Image asset created" />}
                      {hasVoice && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title="Voice asset created" />}
                    </div>
                  </div>

                  <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {scene.title || "Scene title"}
                  </h5>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-semibold px-1 py-0.2 rounded font-mono border border-slate-200/50">
                      {scene.duration}s
                    </span>

                    {/* Status approved icon check */}
                    {scene.status === "Approved" ? (
                      <span className="text-emerald-500 font-bold text-[9px] uppercase tracking-wide flex items-center gap-0.5 font-mono">
                        <Check size={10} className="stroke-[3]" /> APPROVED
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium text-[9px] font-mono">
                        LOCKED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (confirm("Apakah anda yakin ingin menghapus scene terpilih? Tindakan ini tidak dapat dibatalkan.")) {
                onDeleteScene(activeScene.id);
                // Fallback focus point
                const leftList = sortedScenes.filter(s => s.id !== activeScene.id);
                if (leftList.length > 0) setActiveSceneId(leftList[0].id);
              }
            }}
            disabled={sortedScenes.length <= 1}
            className="w-full inline-flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 disabled:opacity-20 text-red-600 font-bold p-2 text-xs rounded transition-colors disabled:hover:bg-red-50 cursor-pointer"
          >
            <Trash2 size={13} />
            Delete Scene
          </button>
        </div>
      </div>

      {/* 2. CENTER BOARD: CONFIGURATION */}
      <div className="xl:col-span-5 space-y-6">
        
        {/* Basic Fields */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-2">
            Scene Settings #{sortedScenes.findIndex(s => s.id === activeScene.id) + 1}
          </h3>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Scene Title (Indonesian) *</label>
              <input
                type="text"
                value={sceneTitle}
                onChange={(e) => setSceneTitle(e.target.value)}
                placeholder="e.g., Tunjukkan keunggulan serum secara dekat"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Scene Goal</label>
                <input
                  type="text"
                  value={sceneGoal}
                  onChange={(e) => setSceneGoal(e.target.value)}
                  placeholder="e.g., Menarik penonton di 4 detik awal"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Duration (sec)</label>
                <input
                  type="number"
                  min={MIN_SCENE_DURATION_SECONDS}
                  max={12}
                  value={sceneDuration}
                  onChange={(e) => setSceneDuration(Math.max(MIN_SCENE_DURATION_SECONDS, Number(e.target.value) || MIN_SCENE_DURATION_SECONDS))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-center"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Overlay Focus Message</label>
              <input
                type="text"
                value={sceneFocus}
                onChange={(e) => setSceneFocus(e.target.value)}
                placeholder="e.g., Formula UltraGlow Cepat Meresap!"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium font-sans text-blue-600 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Visual Settings Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              Visual Environment Settings
            </h3>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono border border-indigo-100 uppercase select-none">
              {campaign.visualPreset}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">Model Presence</label>
              <select
                value={modelPresence}
                onChange={(e) => setModelPresence(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 p-1.5 rounded text-xs cursor-pointer"
              >
                {["Hidden", "Full Body", "Half Body", "Close-up", "Hand only", "Pointing", "Explaining", "Holding Product", "Lifestyle Subject"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">Product Presence</label>
              <select
                value={productPresence}
                onChange={(e) => setProductPresence(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 p-1.5 rounded text-xs cursor-pointer"
              >
                {["Hidden", "Visible", "Hero Focus", "Close-up", "Hand Holding Product", "Product on Table", "Product Beside Model", "Background"].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">Subject Type</label>
              <select
                value={subjectPresence}
                onChange={(e) => setSubjectPresence(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 p-1.5 rounded text-xs cursor-pointer"
              >
                {["None", "Uploaded model reference", "Generic human presenter", "Hand only", "Customer lifestyle scene", "Product only", "Family scene"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Background controls */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">Active Background Concept</label>
              <button
                type="button"
                onClick={handleRegenerateBgSuggestion}
                disabled={isRegeneratingBg}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all disabled:opacity-30 cursor-pointer"
              >
                <RefreshCw size={10} className={isRegeneratingBg ? "animate-spin" : ""} />
                Gemini Re-suggest bg
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400">Background mode</span>
                <select
                  value={bgMode}
                  onChange={(e) => setBgMode(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-250 p-1.5 rounded text-xs cursor-pointer"
                >
                  <option value="AI Suggested">AI Suggested theme</option>
                  <option value="Use Campaign Background Reference">Use Campaign Background Reference</option>
                  <option value="Upload Scene Background">Scene background upload</option>
                  <option value="Custom Text Background">Custom Text background</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400">Environment/Scenery Option</span>
                <input
                  type="text"
                  value={bgStyle}
                  onChange={(e) => setBgStyle(e.target.value)}
                  placeholder="e.g. Modern cozy lifestyle bathroom"
                  className="w-full bg-slate-50 border border-slate-250 p-1.5 rounded text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400">Generated background details Prompt (English)</span>
              <textarea
                value={bgPromptRef}
                onChange={(e) => setBgPromptRef(e.target.value)}
                rows={2}
                placeholder="Environment detailed prompt descriptions for image assets rendering..."
                className="w-full bg-slate-50 border border-slate-250 p-2 rounded text-xs font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Camera, Mood, Lighting parameters */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400">Camera Framing</span>
              <select
                value={cameraFraming}
                onChange={(e) => setCameraFraming(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 p-1.5 rounded text-xs cursor-pointer"
              >
                {["Close-up", "Medium shot", "Wide shot", "Full body", "Product close-up", "Macro detail"].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400">Mood Vibe</span>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 p-1.5 rounded text-xs cursor-pointer"
              >
                {["Friendly", "Fun", "Professional", "Reassuring", "Energetic", "Premium", "Cinematic"].map(md => (
                  <option key={md} value={md}>{md}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400">Lighting style</span>
              <select
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 p-1.5 rounded text-xs cursor-pointer"
              >
                {["Bright soft lighting", "Clean studio lighting", "Warm daylight", "Premium cinematic lighting", "Natural bathroom glows", "Neon edge glow"].map(lg => (
                  <option key={lg} value={lg}>{lg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Style locks - Tags */}
          <div className="space-y-2 pt-2">
            <span className="text-[10.5px] font-bold text-slate-500 block">Style Lock Filters (Prevents AI distortion)</span>
            <div className="flex flex-wrap gap-1.5">
              {styleLockTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-slate-200">
                  {tag}
                  <button type="button" onClick={() => handleRemoveStyleLockTag(tag)} className="text-slate-400 hover:text-slate-600 font-bold font-sans">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddStyleLockTag())}
                placeholder="Add custom visual locks (e.g., 'no cartoon', 'real proportions')"
                className="flex-1 bg-slate-50 border border-slate-250 p-1 px-2 rounded text-xs"
              />
              <button
                type="button"
                onClick={handleAddStyleLockTag}
                className="bg-slate-150 hover:bg-slate-200 border border-slate-250 text-slate-700 text-xs font-bold px-3 py-1 rounded cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Content configuration (direct instruction textareas) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-2">
            Content Directive Rules
          </h3>

          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">Narration direction (Indonesian)</label>
              <textarea
                value={narrationDirection}
                onChange={(e) => setNarrationDirection(e.target.value)}
                rows={2}
                placeholder="e.g., Sebutkan keunggulan minyak pelumas tahan panas ini dengan semangat..."
                className="w-full bg-slate-50 border border-slate-250 p-2.5 rounded text-xs font-sans leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">Screen overlays overlay text instructions</label>
              <textarea
                value={overlayDirection}
                onChange={(e) => setOverlayDirection(e.target.value)}
                rows={2}
                placeholder="e.g., Tampilkan stiker bertuliskan 'Full Synthetic' berkedip di pojok kanan bawah..."
                className="w-full bg-slate-50 border border-slate-250 p-2.5 rounded text-xs font-sans leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">Cuts & Transitions directives</label>
              <textarea
                value={editDirection}
                onChange={(e) => setEditDirection(e.target.value)}
                rows={2}
                placeholder="e.g., Slow pan closer to the product label in 4k resolution..."
                className="w-full bg-slate-50 border border-slate-250 p-2.5 rounded text-xs font-sans leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT PANEL: AI GENERATED OUTPUT */}
      <div className="xl:col-span-5 space-y-6">
        
        {/* Core Generator Header Box */}
        <div className="bg-blue-600 text-white p-5 rounded-xl space-y-3 shadow-md shadow-blue-200">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-300" />
                Prompt Engine Outputs
              </h3>
              <p className="text-blue-100 text-[11px] max-w-[280px]">
                Generate structured, production-ready visual asset parameters.
              </p>
            </div>

            <button
              onClick={handleGeneratePromptsPack}
              disabled={isGeneratingOutput}
              className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-slate-900 font-extrabold px-3.5 py-1.5 rounded-lg border border-transparent shadow shadow-yellow-600 text-xs transition-all cursor-pointer"
            >
              <RefreshCw size={13} className={isGeneratingOutput ? "animate-spin" : ""} />
              {activeOutput ? "Regenerate" : "Generate"}
            </button>
          </div>

          {activeOutput ? (
            <div className="bg-blue-700/50 p-2.5 rounded border border-blue-500/50 text-[10.5px] font-medium flex items-center gap-1.5">
              <Check size={12} className="text-yellow-300 stroke-[3]" />
              Prompts pack successfully created. Refine or generate media assets below!
            </div>
          ) : (
            <div className="bg-yellow-500/20 p-2.5 rounded border border-yellow-400/30 text-[10.5px] font-semibold text-yellow-100 flex items-center gap-1.5">
              <Info size={12} className="text-yellow-300" />
              Tingkatkan akurasi storyboard dengan membuat parameter dasar visual prompt.
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                Visual Scene Asset
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Render standard images of products and scenes</p>
            </div>

            {/* Generate Image action */}
            {settings.enableImageGeneration && activeOutput && (
              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || isGeneratingOutput}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 border border-blue-200 hover:bg-blue-50/50 p-1.5 rounded transition-colors disabled:opacity-30 cursor-pointer"
              >
                <ImageIcon size={14} />
                {sceneImageAsset ? "Re-render" : "Generate Asset"}
              </button>
            )}
          </div>

          {/* Error Banner for Image Generation */}
          {imageError && (
            <div className="bg-amber-50 text-amber-800 text-[11px] p-3 rounded-lg border border-amber-200/60 leading-relaxed font-sans space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                <span>Media Generation setup constraint</span>
              </div>
              <p>{imageError}</p>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 border-t border-slate-200/50 pt-1.5">
                <Lock size={10} /> Active: falling back to high-contrast schematic mock renders
              </div>
            </div>
          )}

          {/* Editable Prompt Section */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400">Generated Image Prompt (English)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(localImagePrompt || activeOutput?.imagePrompt || "", "img_p")}
                className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
              >
                {copiedSection === "img_p" ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                {copiedSection === "img_p" ? "Copied" : "Copy Prompt"}
              </button>
            </div>
            <textarea
              value={localImagePrompt}
              onChange={(e) => setLocalImagePrompt(e.target.value)}
              rows={3}
              placeholder="Visual rendering prompt will display here after generating prompts pack..."
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-xs font-mono leading-relaxed"
            />
          </div>

          {settings.enableImageGeneration && (
            <div className="border border-slate-200/65 rounded-xl aspect-[16/9] w-full bg-slate-50 overflow-hidden relative flex flex-col items-center justify-center text-center p-6 sm:px-12 select-none group">
              {isGeneratingImage ? (
                <div className="space-y-3">
                  <div className="relative">
                    <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <ImageIcon size={16} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Rendering scene elements...</p>
                </div>
              ) : sceneImageAsset ? (
                <React.Fragment>
                  <img 
                    src={sceneImageAsset.fileData || sceneImageAsset.fileUrl || ""} 
                    alt="Scene Render" 
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="absolute bottom-2 left-2 bg-slate-900/70 backdrop-blur-xs text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-white/10 uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 leading-none">
                    <Eye size={10} /> Model active
                  </div>
                </React.Fragment>
              ) : (
                <div className="space-y-2">
                  <ImageIcon size={28} className="text-slate-300 mx-auto" />
                  <h5 className="text-xs font-bold text-slate-700">No Image Asset Generated</h5>
                  <p className="text-[10.5px] text-slate-400 leading-normal max-w-[240px] mx-auto font-sans">
                    Generate image prompt pack then click the 'Generate Asset' button to render visual preview.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Generated Voiceover Speech syntheziser Block */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                Indonesian Voiceover (Audio)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Generate speaking voice narrator</p>
            </div>

            {/* Voice synth prompt action */}
            {settings.enableVoiceGeneration && activeOutput && (
              <button
                onClick={handleGenerateVoice}
                disabled={isGeneratingVoice || isGeneratingOutput}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 border border-slate-200 hover:bg-indigo-50/50 p-1.5 rounded transition-colors disabled:opacity-30 cursor-pointer"
              >
                <Music size={14} />
                {sceneVoiceAsset ? "Re-voice" : "Generate Voice"}
              </button>
            )}
          </div>

          {voiceError && (
            <div className="bg-amber-50 text-amber-800 text-[11px] p-3 rounded-lg border border-amber-200/60 leading-relaxed font-sans space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                <span>Speech Synth setup constraint</span>
              </div>
              <p>{voiceError}</p>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 border-t border-slate-200/50 pt-1.5">
                <Lock size={10} /> Falling back to default speak rendering controls
              </div>
            </div>
          )}

          {/* Editable Narration Text area */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-400">Narration Script (Indonesian)</span>
              
              <div className="flex gap-3">
                <span className={`font-semibold ${wordCountTooLong ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                  {narrationWords} words / max {maxSafeWords} safe ({Math.ceil(narrationWords / 2.5)}s est)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(localNarration || activeOutput?.narration || "", "narr")}
                  className="font-bold text-slate-400 hover:text-slate-600 inline-flex items-center gap-0.5 cursor-pointer"
                >
                  {copiedSection === "narr" ? <Check size={11} className="text-emerald-600 animate-pulse" /> : <Copy size={11} />}
                  {copiedSection === "narr" ? "Copied" : "Copy Script"}
                </button>
              </div>
            </div>
            
            <textarea
              value={localNarration}
              onChange={(e) => setLocalNarration(e.target.value)}
              rows={3}
              placeholder="Indonesian spoken script narration dialog..."
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-xs font-sans leading-relaxed"
            />

            {wordCountTooLong && (
              <div className="bg-amber-50 rounded p-2 text-[10px] text-amber-700 font-medium flex items-start gap-1 leading-normal border border-amber-100">
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                <span>Naskah narasi terlalu panjang untuk durasi scene ({sceneDuration}s). Persingkat teks agar pelafalan terdengar santai dan natural.</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-400">Voice Generation Prompt (Copy for External TTS)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(voiceGenerationPrompt, "voice_prompt")}
                className="font-bold text-slate-400 hover:text-slate-600 inline-flex items-center gap-0.5 cursor-pointer"
              >
                {copiedSection === "voice_prompt" ? <Check size={11} className="text-emerald-600 animate-pulse" /> : <Copy size={11} />}
                {copiedSection === "voice_prompt" ? "Copied" : "Copy Prompt"}
              </button>
            </div>
            <textarea
              value={voiceGenerationPrompt}
              readOnly
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-xs font-mono leading-relaxed text-slate-600"
            />
          </div>

          {settings.enableVoiceGeneration && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {isGeneratingVoice ? (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <RefreshCw size={14} className="text-indigo-600 animate-spin" />
                  </div>
                ) : sceneVoiceAsset ? (
                  <button
                    onClick={() => playVoiceAsset(sceneVoiceAsset.fileData || sceneVoiceAsset.fileUrl || "")}
                    className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-sm shadow-indigo-100"
                  >
                    {playingAudioUrl === (sceneVoiceAsset.fileData || sceneVoiceAsset.fileUrl || "") ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <Play size={14} className="text-slate-400" />
                  </div>
                )}
                
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Indonesian Narrator Audio</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {sceneVoiceAsset ? "Voice ready to play" : "Pending asset creation"}
                  </span>
                </div>
              </div>

              {sceneVoiceAsset && (
                <a 
                  href={sceneVoiceAsset.fileData || "#"} 
                  download={`VO_Scene_${sortedScenes.findIndex(s => s.id === activeScene.id) + 1}.mp3`}
                  className="p-2 hover:bg-slate-200 rounded text-slate-500 transition-colors cursor-pointer"
                >
                  <Download size={14} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Overlay Badges and Video prompt reference locks */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            Motion & Overlays Details
          </h4>

          <div className="space-y-3 font-sans">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400">Motion Video Promo Prompt (English)</span>
              <div className="flex bg-slate-50 hover:bg-slate-50 border border-slate-200 p-2.5 rounded text-xs font-mono items-start justify-between gap-1.5 leading-relaxed">
                <span className="flex-1">{activeOutput?.videoPrompt || "Generate prompts pack output first..."}</span>
                {activeOutput?.videoPrompt && (
                  <button
                    onClick={() => copyToClipboard(activeOutput.videoPrompt, "vid_p")}
                    className="text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                    title="Copy Motion Prompt"
                  >
                    {copiedSection === "vid_p" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                )}
              </div>
            </div>

            {/* Structured highlight Overlays badges */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400">Indonesian Highlight Badges Overlay text</span>
              <div className="flex flex-wrap gap-1.5">
                {activeOutput?.textHighlights && activeOutput.textHighlights.length > 0 ? (
                  activeOutput.textHighlights.map((hl) => (
                    <span key={hl} className="bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 px-2 py-0.5 rounded text-xs font-mono">
                      {hl}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs italic">Pending prompt outputs generation</span>
                )}
              </div>
            </div>

            {/* Custom editing transition tips */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400">Indonesian Video Cut details & Editing directives</span>
              <ul className="space-y-1 lists-none">
                {activeOutput?.editingRecommendation && activeOutput.editingRecommendation.length > 0 ? (
                  activeOutput.editingRecommendation.map((rec, rIdx) => (
                    <li key={rIdx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed bg-slate-50 p-1.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      {rec}
                    </li>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs italic">Pending recommendation details...</span>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 4. STICKY BOTTOM CONTROL BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-45 bg-white border-t border-slate-200 p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 px-8 shrink-0">
        <div className="flex items-center gap-3">
          {outputFeedback ? (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-1 font-semibold flex items-center gap-1.5">
              <Check size={15} className="stroke-[3]" />
              {outputFeedback}
            </div>
          ) : (
            <div className="text-slate-400 text-xs font-medium font-sans">
              All modifications are saved in draft model states.
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveScene}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg border border-transparent transition-all cursor-pointer"
          >
            Save Scene Draft
          </button>

          <button
            onClick={() => {
              handleSaveScene();
              onApproveScene(activeScene.id);
              // Shift focus item naturally if not last
              const activeIndex = sortedScenes.findIndex(s => s.id === activeScene.id);
              if (activeIndex < sortedScenes.length - 1) {
                setActiveSceneId(sortedScenes[activeIndex + 1].id);
              }
            }}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-lg border border-transparent shadow shadow-blue-200 transition-all cursor-pointer"
          >
            <Check size={14} className="stroke-[3]" />
            Approve & Lock Scene
          </button>
        </div>
      </div>
    </div>
  );
}
