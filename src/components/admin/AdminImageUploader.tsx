import React, { useState, useRef } from 'react';
import { uploadImageToStorage, deleteImageFromStorage, StorageFolder } from '../../utils/storageService';
import {
  Upload,
  X,
  Camera,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface AdminImageUploaderProps {
  currentImageUrl?: string;
  currentStoragePath?: string;
  folder: StorageFolder;
  onImageUploaded: (url: string, path: string) => void;
  onImageRemoved?: () => void;
  label?: string;
  aspectHint?: string;
}

export const AdminImageUploader: React.FC<AdminImageUploaderProps> = ({
  currentImageUrl,
  currentStoragePath,
  folder,
  onImageUploaded,
  onImageRemoved,
  label = 'Article Cover Image',
  aspectHint = 'Recommended: 16:9 banner or clear equipment photo',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMessage(null);
    setUploading(true);
    setProgress(15);

    try {
      const result = await uploadImageToStorage(file, folder, (pct) => {
        setProgress(pct);
      });

      // Clean up previous bucket file safely in background if replaced
      if (currentStoragePath && currentStoragePath !== result.storagePath) {
        deleteImageFromStorage(currentStoragePath).catch(() => {});
      }

      onImageUploaded(result.downloadUrl, result.storagePath);
      setSuccessMessage(
        result.isStorageBucketUrl
          ? 'Image uploaded to Cloud Storage bucket!'
          : `Image optimized (~${result.sizeKb || 35} KB) and attached!`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError('Please enter a valid image URL');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('Image URL must start with http:// or https://');
      return;
    }

    setError(null);
    onImageUploaded(trimmed, `external/${folder}/${Date.now()}`);
    setUrlInput('');
    setSuccessMessage('Image URL applied successfully!');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleRemove = async () => {
    if (currentStoragePath) {
      try {
        await deleteImageFromStorage(currentStoragePath);
      } catch (e) {}
    }
    if (onImageRemoved) onImageRemoved();
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200">{label}</label>
        <span className="text-[10px] text-slate-400 font-mono">{aspectHint}</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />

      {currentImageUrl ? (
        <div className="relative rounded-xl border border-slate-700 bg-slate-900/60 p-2 overflow-hidden group">
          <div className="h-52 w-full flex items-center justify-center bg-slate-950/80 rounded-lg overflow-hidden">
            <img
              src={currentImageUrl}
              alt="Cover preview"
              className="max-h-full max-w-full w-auto h-auto object-contain"
            />
          </div>

          {/* Action overlay */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-medium rounded-lg border border-slate-700 shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Replace with new file"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Replace</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="px-2.5 py-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-medium rounded-lg shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Image attached
            </span>
            <span className="truncate max-w-[220px] text-slate-500 font-mono text-[10px]">
              {currentStoragePath || 'Image attached'}
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          {/* Method tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                setError(null);
              }}
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'text-amber-400 border-b-2 border-amber-500 bg-slate-900/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image File</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('url');
                setError(null);
              }}
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer ${
                activeTab === 'url'
                  ? 'text-amber-400 border-b-2 border-amber-500 bg-slate-900/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Paste Image URL</span>
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'upload' ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all cursor-pointer ${
                  uploading
                    ? 'border-amber-500/50 bg-amber-500/5 cursor-wait'
                    : 'border-slate-700 hover:border-amber-500 bg-slate-950/40 hover:bg-slate-900/80'
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                    <span className="text-xs font-medium text-slate-300">
                      Processing & attaching image ({progress}%)...
                    </span>
                    <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 mb-2 group-hover:text-amber-400 transition-colors">
                      <Upload className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      Click to choose image from your computer or phone
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Supports JPG, PNG, WebP (auto-optimized for instant loading)
                    </span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3 py-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... or any direct image link"
                    className="flex-1 text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyUrl();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyUrl()}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply URL</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Paste any web link or hosted photo for this article.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/40 px-3 py-1.5 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};
