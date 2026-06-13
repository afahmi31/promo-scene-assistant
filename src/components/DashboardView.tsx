import React, { useState } from "react";
import { 
  Folder, 
  FileText, 
  Video, 
  CheckCircle, 
  Plus, 
  Play, 
  Trash2, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Smartphone,
  Eye,
  Settings
} from "lucide-react";
import { Campaign, Scene } from "../types";

interface DashboardViewProps {
  campaigns: Campaign[];
  scenes: Scene[];
  onNavigateToNewCampaign: () => void;
  onNavigateToSceneBuilder: (campaignId: string) => void;
  onDuplicateCampaign: (campaignId: string) => void;
  onDeleteCampaign: (campaignId: string) => void;
}

export default function DashboardView({
  campaigns,
  scenes,
  onNavigateToNewCampaign,
  onNavigateToSceneBuilder,
  onDuplicateCampaign,
  onDeleteCampaign
}: DashboardViewProps) {
  const [statusFilter, setStatusFilter] = useState<"All" | "Draft" | "Scene Planned" | "In Progress" | "Completed">("All");

  // Calculate statistics
  const totalCampaigns = campaigns.length;
  const draftCampaigns = campaigns.filter(c => c.status === "Draft").length;
  const completedCampaigns = campaigns.filter(c => c.status === "Completed").length;
  const totalScenesCreated = scenes.length;

  const filteredCampaigns = campaigns.filter(c => {
    if (statusFilter === "All") return true;
    return c.status === statusFilter;
  });

  return (
    <div id="dashboard-view" className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 id="dashboard-title" className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Campaigns
          </h1>
          <p className="text-slate-500 mt-1 max-w-xl text-sm">
            Manage your AI promotional prompt campaigns.
          </p>
        </div>
        <button
          id="btn-create-campaign-top"
          onClick={onNavigateToNewCampaign}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg border border-transparent shadow shadow-blue-200 transition-all cursor-pointer text-sm"
        >
          <Plus size={18} />
          Create New Campaign
        </button>
      </div>

      {/* Stats Cards Section */}
      <div id="stats-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Folder size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Total Campaigns</span>
            <h3 className="text-2xl font-bold text-slate-800 leading-none mt-1">{totalCampaigns}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Draft Campaigns</span>
            <h3 className="text-2xl font-bold text-slate-800 leading-none mt-1">{draftCampaigns}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Completed</span>
            <h3 className="text-2xl font-bold text-slate-800 leading-none mt-1">{completedCampaigns}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Video size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Scenes Created</span>
            <h3 className="text-2xl font-bold text-slate-800 leading-none mt-1">{totalScenesCreated}</h3>
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar & Grid View options */}
      <div className="border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div id="status-tabs-container" className="flex gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200/60">
          {(["All", "Draft", "Scene Planned", "In Progress", "Completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                (statusFilter === status)
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {status === "All" ? "All Status" : status}
            </button>
          ))}
        </div>

        <div className="text-slate-400 text-xs font-mono font-medium">
          Showing {filteredCampaigns.length} model sequences
        </div>
      </div>

      {/* Campaigns list Grid */}
      <div id="campaigns-grid border" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 'Start New Campaign' Empty box card */}
        <div 
          onClick={onNavigateToNewCampaign}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-white p-8 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer group transition-all h-[340px]"
        >
          <div className="p-4 bg-white border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 rounded-full text-slate-400 group-hover:text-blue-600 shadow-sm transition-all mb-4">
            <Plus size={32} className="stroke-[2.5]" />
          </div>
          <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Start New Campaign</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-[210px]">
            Create a new AI prompt pack and generate assets.
          </p>
        </div>

        {filteredCampaigns.map((camp) => {
          // Get specific scenes list that belong to this campaign
          const campScenes = scenes.filter(s => s.campaignId === camp.id);
          
          return (
            <div 
              key={camp.id}
              className="bg-white border border-slate-200 hover:border-slate-350 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col h-[340px] group relative"
            >
              {/* Campaign status indicator line */}
              <div className={`h-1.5 w-full ${
                camp.status === "Completed" ? "bg-emerald-500" :
                camp.status === "In Progress" ? "bg-amber-500" :
                camp.status === "Scene Planned" ? "bg-blue-500" :
                "bg-slate-400"
              }`} />

              <div className="p-5 flex-1 flex flex-col justify-between">
                {/* Image Reference and Platform */}
                <div className="flex justify-between items-start">
                  <div className="h-16 w-16 border border-slate-200 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    {camp.productImage ? (
                      <img 
                        src={camp.productImage} 
                        alt={camp.productName} 
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-400 font-mono">IMAGE</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {/* Platform destination tag */}
                    <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200/50 uppercase">
                      {camp.platform}
                    </span>
                    {/* Status badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      camp.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      camp.status === "In Progress" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      camp.status === "Scene Planned" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}>
                      {camp.status}
                    </span>
                  </div>
                </div>

                {/* Campaign Title & Product metadata */}
                <div className="mt-4 flex-1">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-tight">
                    {camp.title}
                  </h4>
                  <p className="text-sm font-semibold text-slate-500 line-clamp-1 mt-0.5">
                    {camp.productName}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {camp.productDescription || "No description provided."}
                  </p>
                </div>

                {/* Counter Stats icons bar */}
                <div className="border-t border-slate-100/80 pt-3 flex items-center justify-between text-slate-500 text-xs mt-3">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1 font-medium font-mono text-[11px]" title="Scene count">
                      <Video size={13} className="text-slate-400" />
                      {campScenes.length}
                    </span>
                    <span className="flex items-center gap-1 font-medium font-mono text-[11px]" title="Image Assets">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                      {camp.totalGeneratedImages || 0}
                    </span>
                    <span className="flex items-center gap-1 font-medium font-mono text-[11px]" title="Voice Assets">
                      <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
                      {camp.totalGeneratedVoices || 0}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(camp.createdAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short"
                    })}
                  </span>
                </div>
              </div>

              {/* Actions footer panel */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex items-center justify-between gap-2 shrink-0">
                <div className="flex gap-1">
                  <button
                    onClick={() => onDuplicateCampaign(camp.id)}
                    className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded transition-all cursor-pointer"
                    title="Duplicate Campaign"
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    onClick={() => onDeleteCampaign(camp.id)}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-all cursor-pointer"
                    title="Delete Campaign"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <button
                  onClick={() => onNavigateToSceneBuilder(camp.id)}
                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded px-3 py-1.5 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
                >
                  {camp.status === "Draft" ? "Edit Plan" : "Continue"}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
