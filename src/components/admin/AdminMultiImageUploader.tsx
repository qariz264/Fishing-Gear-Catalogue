import React, { useState, useRef } from 'react';
import { uploadImageToStorage, StorageFolder } from '../../utils/storageService';
import {
  Upload,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
  Image as ImageIcon,
  Star,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface AdminMultiImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  folder: StorageFolder;
  label?: string;
  aspectHint?: string;
  maxImages?: number;
}

export const AdminMultiImageUploader: React.FC<AdminMultiImageUploaderProps> = ({
  images,
  onChange,
  folder,
  label = 'Event / Article Photo Gallery',
  aspectHint = 'Upload multiple photos. The first image will be used as the primary cover.',
  maxImages = 12,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle uploading multiple files from disk
  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setError(`Maximum limit of ${maxImages} images reached.`);
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    setError(null);
    setUploading(true);
    setUploadProgress(10);
    setUploadStatus(`Uploading ${filesToUpload.length} image${filesToUpload.length > 1 ? 's' : ''}...`);

    const newUrls: string[] = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setUploadStatus(`Uploading photo ${i + 1} of ${filesToUpload.length}...`);
        const result = await uploadImageToStorage(file, folder, (pct) => {
          const overall = Math.round(((i + pct / 100) / filesToUpload.length) * 100);
          setUploadProgress(overall);
        });
        if (result?.downloadUrl) {
          newUrls.push(result.downloadUrl);
        }
      }

      onChange([...images, ...newUrls]);
      setUploadStatus(`Successfully added ${newUrls.length} image${newUrls.length > 1 ? 's' : ''}!`);
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: any) {
      console.error('Batch image upload error:', err);
      setError(err?.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add image by direct URL
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('data:image')) {
      setError('Please provide a valid web URL starting with https://');
      return;
    }

    if (images.length >= maxImages) {
      setError(`Maximum limit of ${maxImages} images reached.`);
      return;
    }

    setError(null);
    onChange([...images, cleanUrl]);
    setUrlInput('');
  };

  // Remove single image
  const handleRemove = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  // Set as primary cover (move to index 0)
  const handleSetAsCover = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const filtered = images.filter((_, idx) => idx !== index);
    onChange([item, ...filtered]);
  };

  // Move left
  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const copy = [...images];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  // Move right
  const handleMoveRight = (index: number) => {
    if (index >= images.length - 1) return;
    const copy = [...images];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>{label}</span>
            <span className="text-[11px] font-mono text-slate-500 font-normal">
              ({images.length}/{maxImages})
            </span>
          </label>
          <p className="text-[11px] text-slate-500 mt-0.5">{aspectHint}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
              activeTab === 'upload'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload Files
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
              activeTab === 'url'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {/* Error / Status notification */}
      {error && (
        <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {uploadStatus && (
        <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="flex-1">{uploadStatus}</span>
        </div>
      )}

      {/* Upload Zone / URL input */}
      {images.length < maxImages && (
        <>
          {activeTab === 'upload' ? (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-slate-800 hover:border-amber-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-950/50 hover:bg-slate-950 ${
                uploading ? 'opacity-70 pointer-events-none' : ''
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFiles}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    <span className="text-xs text-amber-300 font-medium">
                      Uploading photos ({uploadProgress}%)...
                    </span>
                    <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-amber-500 h-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        Click to select photo(s)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Supports multiple file selection (JPEG, PNG, WebP)
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste image link https://images.unsplash.com/..."
                className="flex-1 text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Image</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Gallery of Uploaded Images */}
      {images.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((imgUrl, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={`${imgUrl}-${index}`}
                  className={`group relative rounded-xl overflow-hidden border bg-slate-950 aspect-video flex items-center justify-center transition-all ${
                    isCover
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Cover Badge */}
                  {isCover && (
                    <span className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                      <Star className="w-2.5 h-2.5 fill-slate-950" />
                      <span>Cover</span>
                    </span>
                  )}

                  {/* Hover Control Overlay */}
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="p-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveLeft(index)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white"
                          title="Move left"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === images.length - 1}
                          onClick={() => handleMoveRight(index)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white"
                          title="Move right"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetAsCover(index)}
                          className="px-2 py-1 bg-amber-600/90 hover:bg-amber-600 text-white rounded text-[10px] font-semibold flex items-center gap-1"
                          title="Set this photo as the main cover image"
                        >
                          <Star className="w-2.5 h-2.5" />
                          <span>Make Cover</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] font-mono text-slate-500">
            Tip: Hover over any photo to set it as Cover, reorder, or delete it.
          </p>
        </div>
      )}
    </div>
  );
};
