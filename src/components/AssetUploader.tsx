import React, { useState, ChangeEvent } from "react";
import { X, Upload, Trash2, Check } from "lucide-react";

interface AssetFile {
  file: File;
  preview: string; // object URL
  description: string;
}

interface AssetUploaderProps {
  campaignId: string; // required campaign ID for backend endpoint
  onUploadSuccess?: (uploaded: { id: number; url: string; description: string }[]) => void;
}

export default function AssetUploader({ campaignId, onUploadSuccess }: AssetUploaderProps) {
  const [files, setFiles] = useState<AssetFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles: AssetFile[] = [];
    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        description: "",
      });
    }
    setFiles((prev) => [...prev, ...newFiles]);
    // Reset input value to allow re-select same file
    e.target.value = "";
  };

  const handleDescriptionChange = (index: number, desc: string) => {
    setFiles((prev) => {
      const copy = [...prev];
      copy[index].description = desc;
      return copy;
    });
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => {
      const copy = [...prev];
      // Revoke object URL to free memory
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const uploadAll = async () => {
    if (!campaignId) {
      setError("Campaign ID is missing.");
      return;
    }
    setUploading(true);
    setError(null);
    const uploaded: { id: number; url: string; description: string }[] = [];
    try {
      for (const asset of files) {
        const form = new FormData();
        form.append("file", asset.file);
        form.append("description", asset.description);
        form.append("campaign_id", campaignId);
        const res = await fetch(`/api/campaigns/${campaignId}/assets`, {
          method: "POST",
          body: form,
          credentials: "include",
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Upload failed");
        }
        const data = await res.json();
        uploaded.push({
          id: data.asset.id,
          url: data.asset.url,
          description: data.asset.description,
        });
      }
      // Clear local list after successful upload
      setFiles([]);
      onUploadSuccess && onUploadSuccess(uploaded);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="cursor-pointer flex items-center gap-2 text-sm font-medium text-slate-700">
          <Upload size={20} className="text-slate-400" />
          <span>Upload Assets</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFilesChange}
          />
        </label>
        {files.length > 0 && (
          <button
            onClick={uploadAll}
            disabled={uploading}
            className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload All"}
          </button>
        )}
      </div>
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((item, idx) => (
          <div key={idx} className="border border-slate-200 rounded-lg p-3 flex flex-col space-y-2">
            {/* Preview */}
            {item.file.type.startsWith("image") ? (
              <img src={item.preview} alt="preview" className="max-h-32 object-cover rounded" />
            ) : (
              <div className="flex items-center space-x-2 text-slate-500">
                <FileCode size={24} />
                <span>{item.file.name}</span>
              </div>
            )}
            {/* Description input */}
            <input
              type="text"
              placeholder="Description (optional)"
              value={item.description}
              onChange={(e) => handleDescriptionChange(idx, e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleRemove(idx)}
                className="text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <Trash2 size={16} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
