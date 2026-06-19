import React, { useState } from "react";
import { 
  FolderOpen, 
  FileCode, 
  Download, 
  Trash2, 
  Copy, 
  Check
} from "lucide-react";
import { Campaign, Asset } from "../types";

interface CampaignAssetsViewProps {
  campaigns: Campaign[];
  assets: Asset[];
  onDeleteAsset: (assetId: string) => void;
}

export default function CampaignAssetsView({
  campaigns,
  assets,
  onDeleteAsset
}: CampaignAssetsViewProps) {
  // Select active campaign filter defaults to first campaign
  const [selectedCampId, setSelectedCampId] = useState<string>(campaigns[0]?.id || "All");
  const [assetTypeFilter, setAssetTypeFilter] = useState<"All" | "uploaded" | "export">("All");

  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  const filteredAssets = assets.filter((asset) => {
    // Campaign filter
    if (selectedCampId !== "All" && asset.campaignId !== selectedCampId) {
      return false;
    }
    if (!(asset.type.startsWith("uploaded_") || asset.type.startsWith("export_"))) {
      return false;
    }
    // Asset Type Segment filter
    if (assetTypeFilter === "uploaded" && !asset.type.startsWith("uploaded_")) return false;
    if (assetTypeFilter === "export" && !asset.type.startsWith("export_")) return false;

    return true;
  });

  const handleCopyText = (text: string, assetId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMap((prev) => ({ ...prev, [assetId]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [assetId]: false }));
    }, 2000);
  };

  return (
    <div id="campaign-assets-section" className="space-y-6 animate-fade-in pb-16">
      
      {/* Upper header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Campaign Asset Manager
          </h1>
          <p className="text-slate-500 mt-1 max-w-xl text-sm">
            View uploaded references and export packs created from approved prompt scenes.
          </p>
        </div>

        {/* Dropdown chooser */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 font-mono">Campaign:</label>
          <select
            value={selectedCampId}
            onChange={(e) => setSelectedCampId(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold cursor-pointer"
          >
            <option value="All">All Campaigns ({campaigns.length})</option>
            {campaigns.map((camp) => (
              <option key={camp.id} value={camp.id}>{camp.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Segment filter buttons tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200/60 w-fit">
        {[
          { id: "All", title: "All Assets" },
          { id: "uploaded", title: "Uploaded References" },
          { id: "export", title: "Export Packs" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAssetTypeFilter(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              assetTypeFilter === tab.id
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Grid inventory visualization list */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white p-12 border border-slate-200 rounded-xl text-center space-y-3">
          <FolderOpen size={44} className="text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No assets discovered</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Uploaded references dan export pack untuk campaign ini akan tampil di sini setelah disimpan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => {
            const hasDataLink = !!asset.fileData;
            const itemUrl = asset.fileData || asset.fileUrl || "";

            return (
              <div
                key={asset.id}
                className="bg-white border border-slate-200/80 hover:border-slate-350 rounded-xl overflow-hidden shadow-xs relative flex flex-col justify-between h-[280px]"
              >
                {/* Visual Preview Segment */}
                <div className="bg-slate-50 border-b border-slate-100 aspect-[16/9] overflow-hidden relative flex flex-col items-center justify-center p-4">
                  
                  {/* Rendering standard types */}
                  {asset.type.includes("image") ? (
                    <img
                      src={itemUrl}
                      alt={asset.name}
                      className="absolute inset-0 w-full h-full object-cover bg-white"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center space-y-2">
                      <FileCode size={32} className="text-blue-500 mx-auto" />
                      <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase font-mono block">MARKDOWN STORYBOARD</span>
                    </div>
                  )}

                  {/* Asset type Tag badge label on corner */}
                  <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-white/10 uppercase select-none">
                    {asset.type.replace("uploaded_", "").replace("generated_", "").replace("export_", "")}
                  </span>
                </div>

                {/* Info and action panel */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                      {asset.name}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 mt-1 font-mono">
                      <span>Ref: {asset.metadata.sceneTitle || "Campaign Wide"}</span>
                      {asset.metadata.aspectRatio && (
                        <>
                          <span>•</span>
                          <span>{asset.metadata.aspectRatio}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action row footer */}
                  <div className="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between">
                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      className="text-red-600 hover:text-red-750 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Delete asset"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="flex gap-1.5">
                      {asset.promptSource && (
                        <button
                          onClick={() => handleCopyText(asset.promptSource || "", asset.id)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-150 rounded px-2.5 py-1 transition-colors cursor-pointer"
                          title="Copy input Prompt"
                        >
                          {copiedMap[asset.id] ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                          {copiedMap[asset.id] ? "Saved" : "Copy Prompt"}
                        </button>
                      )}

                      <a
                        href={itemUrl}
                        download={asset.name}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 rounded px-2.5 py-1 transition-colors cursor-pointer"
                      >
                        <Download size={11} />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
