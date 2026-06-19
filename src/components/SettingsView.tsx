import React, { useState } from "react";
import { Settings, Save, Check, RefreshCw } from "lucide-react";
import { Settings as SettingsType, DEFAULT_SETTINGS } from "../types";

interface SettingsViewProps {
  currentSettings: SettingsType;
  onSaveSettings: (settings: SettingsType) => void;
}

export default function SettingsView({
  currentSettings,
  onSaveSettings
}: SettingsViewProps) {
  const [model, setModel] = useState(currentSettings.geminiModelName || DEFAULT_SETTINGS.geminiModelName);
  const [aspect, setAspect] = useState(currentSettings.defaultAspectRatio || DEFAULT_SETTINGS.defaultAspectRatio);
  const [preset, setPreset] = useState(currentSettings.defaultVisualPreset || DEFAULT_SETTINGS.defaultVisualPreset);
  const [lang, setLang] = useState(currentSettings.defaultLanguage || DEFAULT_SETTINGS.defaultLanguage);
  const [neg, setNeg] = useState(currentSettings.defaultNegativePrompt || DEFAULT_SETTINGS.defaultNegativePrompt);
  const [imgProv, setImgProv] = useState(currentSettings.imageGenerationProvider || DEFAULT_SETTINGS.imageGenerationProvider);
  const [voiceProv, setVoiceProv] = useState(currentSettings.voiceGenerationProvider || DEFAULT_SETTINGS.voiceGenerationProvider);
  const [voiceName, setVoiceName] = useState(currentSettings.defaultIndonesianVoiceName || DEFAULT_SETTINGS.defaultIndonesianVoiceName);
  const [format, setFormat] = useState(currentSettings.defaultDownloadFormat || DEFAULT_SETTINGS.defaultDownloadFormat);
  const [enableImageGeneration, setEnableImageGeneration] = useState(
    currentSettings.enableImageGeneration ?? DEFAULT_SETTINGS.enableImageGeneration
  );
  const [enableVoiceGeneration, setEnableVoiceGeneration] = useState(
    currentSettings.enableVoiceGeneration ?? DEFAULT_SETTINGS.enableVoiceGeneration
  );

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = () => {
    const updated: SettingsType = {
      geminiModelName: model,
      defaultAspectRatio: aspect,
      defaultVisualPreset: preset,
      defaultLanguage: lang,
      defaultNegativePrompt: neg,
      imageGenerationProvider: imgProv,
      voiceGenerationProvider: voiceProv,
      defaultIndonesianVoiceName: voiceName,
      defaultDownloadFormat: format,
      enableImageGeneration,
      enableVoiceGeneration
    };
    onSaveSettings(updated);
    setFeedback("Sistem Settings berhasil disimpan!");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleReset = () => {
    setModel(DEFAULT_SETTINGS.geminiModelName);
    setAspect(DEFAULT_SETTINGS.defaultAspectRatio);
    setPreset(DEFAULT_SETTINGS.defaultVisualPreset);
    setLang(DEFAULT_SETTINGS.defaultLanguage);
    setNeg(DEFAULT_SETTINGS.defaultNegativePrompt);
    setImgProv(DEFAULT_SETTINGS.imageGenerationProvider);
    setVoiceProv(DEFAULT_SETTINGS.voiceGenerationProvider);
    setVoiceName(DEFAULT_SETTINGS.defaultIndonesianVoiceName);
    setFormat(DEFAULT_SETTINGS.defaultDownloadFormat);
    setEnableImageGeneration(DEFAULT_SETTINGS.enableImageGeneration);
    setEnableVoiceGeneration(DEFAULT_SETTINGS.enableVoiceGeneration);

    setFeedback("Settings dikembalikan ke nilai awal.");
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div id="settings-view" className="max-w-3xl space-y-8 animate-fade-in pb-16">

      {/* Settings Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            WarnaFit Assistant Settings
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Configure system endpoints, prompt defaults, and Indonesian transcription limits.
          </p>
        </div>

        {feedback && (
          <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-250 p-2 rounded-lg font-bold flex items-center gap-1">
            <Check size={14} className="stroke-[3]" /> {feedback}
          </div>
        )}
      </div>

      <div className="space-y-6">

        {/* Core AI API Services parameters */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-2">
            AI Prompt Engine
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Google Gemini Core Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
            >
              <option value="gemini-3.5-flash">gemini-3.5-flash (Fast & recommended)</option>
              <option value="gemini-3.5-pro">gemini-3.5-pro (High intelligence)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Default Global Negative Prompt (Image models)</label>
            <textarea
              value={neg}
              onChange={(e) => setNeg(e.target.value)}
              rows={3}
              placeholder="no watermark, no extra text, ..."
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded text-xs font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* Workspace defaults options */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-2">
            New Campaign Defaults
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Video Aspect Ratio</label>
              <select
                value={aspect}
                onChange={(e) => setAspect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold cursor-pointer"
              >
                <option value="9:16">9:16 (TikTok, Shorts, Reels vertical)</option>
                <option value="3:4">3:4 (Shopee, Tokopedia marketplace)</option>
                <option value="1:1">1:1 (Square social feed)</option>
                <option value="4:3">4:3 (Traditional landscape format)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Visual style preset template</label>
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold cursor-pointer"
              >
                <option value="Marketplace Clean">Marketplace Clean</option>
                <option value="Product Premium">Product Premium</option>
                <option value="Home Lifestyle">Home Lifestyle</option>
                <option value="Product Detail">Product Detail</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Language</label>
              <input
                type="text"
                value={lang}
                disabled
                className="w-full bg-slate-150 text-slate-500 border border-slate-200 rounded-lg p-2 text-xs font-medium font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Default export / Download format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold cursor-pointer"
              >
                <option value="PNG Images / MP3 Audio">PNG Images / MP3 Audio</option>
                <option value="ZIP Multi-Track Archive">ZIP Multi-Track Archive</option>
                <option value="Plain JSON Object text">Plain JSON Object text</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Trigger button action */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-bold transition-all shadow shadow-blue-200 cursor-pointer"
        >
          <Save size={14} />
          Save Settings
        </button>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 bg-slate-150 hover:bg-slate-200 border border-slate-250 text-slate-700 rounded-lg px-3 py-2 text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw size={13} />
          Reset to default
        </button>
      </div>
    </div>
  );
}
