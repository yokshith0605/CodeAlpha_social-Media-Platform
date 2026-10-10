import React, { useState } from 'react';
import { Image as ImageIcon, X, Send, Sparkles, Hash, UploadCloud } from 'lucide-react';
import { useUser } from '../context/UserContext.tsx';
import { PHOTO_PRESETS } from '../constants/presets.ts';
import { api } from '../services/api.ts';
import { Post } from '../types/index.ts';

interface PostComposerProps {
  onPostCreated: (newPost: Post) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  onPostCreated,
  isModal = false,
  onClose,
}) => {
  const { currentUser, showToast } = useUser();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const suggestedTags = ['design', 'architecture', 'photography', 'cleancode', 'workspace', 'engineering'];

  const toggleTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter(t => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setShowPhotoPicker(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && !selectedImage) {
      showToast('Please add some text or an image');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createPost({
        content: content.trim(),
        image: selectedImage || undefined,
        tags: activeTags,
      });

      setContent('');
      setSelectedImage(null);
      setActiveTags([]);
      setShowPhotoPicker(false);
      showToast('Post published to feed!');
      onPostCreated(created);
      if (onClose) onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm ${isModal ? 'max-w-xl w-full' : 'mb-6'}`}>
      <div className="flex gap-3.5">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-100"
          referrerPolicy="no-referrer"
        />

        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update, design insight, or photo..."
            rows={isModal ? 4 : 3}
            className="w-full resize-none border-none focus:ring-0 p-0 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base leading-relaxed bg-transparent outline-none"
          />

          {/* Attached Image Preview */}
          {selectedImage && (
            <div className="relative mt-3 rounded-xl overflow-hidden border border-slate-200 max-h-72 group">
              <img
                src={selectedImage}
                alt="Upload preview"
                className="w-full h-full object-cover max-h-72"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Hash className="w-3 h-3 text-slate-400" /> Topics:
            </span>
            {suggestedTags.map((tag) => {
              const isSelected = activeTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-medium shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>

          {/* Photo Picker Drawer */}
          {showPhotoPicker && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-slate-700">Choose a High-Res Photo</span>
                <button
                  type="button"
                  onClick={() => setShowPhotoPicker(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {PHOTO_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => {
                      setSelectedImage(preset.url);
                      setShowPhotoPicker(false);
                    }}
                    className="group relative rounded-lg overflow-hidden border border-slate-200 aspect-video hover:border-indigo-500 transition-all text-left"
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-1.5">
                      <span className="text-[10px] font-medium text-white leading-tight truncate">
                        {preset.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom URL or File Upload */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200/60">
                <div className="flex-1 flex gap-1.5">
                  <input
                    type="url"
                    placeholder="Or paste an image URL..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customImageUrl.trim()) {
                        setSelectedImage(customImageUrl.trim());
                        setCustomImageUrl('');
                        setShowPhotoPicker(false);
                      }
                    }}
                    disabled={!customImageUrl.trim()}
                    className="px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50"
                  >
                    Attach
                  </button>
                </div>

                <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer transition-colors">
                  <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                className={`p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/70 transition-colors flex items-center gap-1.5 text-xs font-medium ${
                  showPhotoPicker || selectedImage ? 'text-indigo-600 bg-indigo-50/70' : ''
                }`}
                title="Add photo"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Photo</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs tabular-nums ${content.length > 260 ? 'text-amber-600 font-semibold' : 'text-slate-400'}`}>
                {content.length}/280
              </span>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting || (!content.trim() && !selectedImage)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Posting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
