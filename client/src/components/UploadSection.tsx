import React, { useState } from 'react';
import { Plus, Camera, MessageSquare, Image, Video, Zap } from 'lucide-react';
import { VideoRecorder } from './VideoRecorder';

interface UploadSectionProps {
  onUpload: (files: FileList) => Promise<void>;
  onVideoUpload: (videoBlob: Blob) => Promise<void>;
  onNoteSubmit: (note: string) => Promise<void>;
  onAddStory: () => void;
  isUploading: boolean;
  progress: number;
  isDarkMode: boolean;
  storiesEnabled?: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onUpload,
  onVideoUpload,
  onNoteSubmit,
  onAddStory,
  isUploading,
  progress,
  isDarkMode,
  storiesEnabled = true
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [noteText, setNoteText] = useState('');


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      setShowUploadOptions(false);
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noteText.trim()) {
      await onNoteSubmit(noteText.trim());
      setNoteText('');
      setShowNoteInput(false);
    }
  };

  const handleVideoRecorded = async (videoBlob: Blob) => {
    setShowVideoRecorder(false);
    await onVideoUpload(videoBlob);
  };

  return (
    <div className={`mx-4 mb-4 p-6 rounded-3xl transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gray-800/40 border border-gray-700/30 backdrop-blur-xl shadow-2xl shadow-purple-500/10' 
        : 'bg-white/60 border border-gray-200/40 backdrop-blur-xl shadow-2xl shadow-pink-500/10'
    }`}>
      <div className="flex items-center gap-6">
        {/* Modern Upload Button */}
        <div className={`w-16 h-16 border-2 border-dashed rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 group hover:scale-105 ${
          isDarkMode 
            ? 'border-purple-500/50 bg-gray-700/30 hover:bg-purple-600/20 hover:border-purple-400' 
            : 'border-pink-400/50 bg-pink-50/30 hover:bg-pink-100/50 hover:border-pink-500'
        }`}>
          <button
            onClick={() => setShowUploadOptions(true)}
            className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer"
          >
            <Plus className={`w-6 h-6 transition-all duration-300 ${
              isDarkMode 
                ? 'text-purple-400 group-hover:text-purple-300' 
                : 'text-pink-500 group-hover:text-pink-600'
            }`} />
          </button>
        </div>

        {/* Modern Content Info */}
        <div className="flex-1">
          <h3 className={`font-bold text-lg tracking-tight mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Neuer Beitrag
          </h3>
          <p className={`text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Teile deine schönsten Momente von der Hochzeit
          </p>
          {progress > 0 && (
            <div className={`w-full h-2 rounded-full mt-3 overflow-hidden transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200/50'
            }`}>
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                    : 'bg-gradient-to-r from-pink-500 to-purple-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Stories Button */}
        <button
          onClick={onAddStory}
          className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
            isDarkMode
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg'
          }`}
          title="Story hinzufügen (24h)"
        >
          <Zap className="w-5 h-5" />
        </button>

        {/* Camera Icon */}
        <div className="flex items-center gap-2">
          <Camera className={`w-5 h-5 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
      </div>
      
      {/* Upload Options Modal - Instagram 2.0 Style */}
      {showUploadOptions && (
        <div 
          className="modal-overlay"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 99999999
          }}
          onClick={() => setShowUploadOptions(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`rounded-3xl p-8 max-w-md w-full transition-all duration-500 relative overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-800/90 border border-gray-700/50 backdrop-blur-xl shadow-2xl shadow-purple-500/20' 
              : 'bg-white/95 border border-gray-200/50 backdrop-blur-xl shadow-2xl shadow-pink-500/20'
          }`}>
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl ${
                isDarkMode ? 'bg-pink-500' : 'bg-pink-300'
              }`} style={{ transform: 'translate(50%, -50%)' }}></div>
              <div className={`absolute bottom-0 left-0 w-20 h-20 rounded-full blur-2xl ${
                isDarkMode ? 'bg-purple-500' : 'bg-purple-300'
              }`} style={{ transform: 'translate(-50%, 50%)' }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className={`w-16 h-16 mx-auto mb-4 p-4 rounded-2xl ${
                  isDarkMode ? 'bg-pink-500/20' : 'bg-pink-500/10'
                }`}>
                  <Plus className={`w-full h-full ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-600'
                  }`} />
                </div>
                <h3 className={`text-xl font-bold tracking-tight mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Neuer Beitrag
                </h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Was möchtest du mit dem Brautpaar teilen?
                </p>
              </div>
            
              <div className="space-y-4">

                <label className={`group flex items-center gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] relative overflow-hidden ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 hover:border-blue-400/50 backdrop-blur-sm' 
                    : 'bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/50 hover:border-blue-300/70 backdrop-blur-sm shadow-lg hover:shadow-xl'
                }`}>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className={`p-4 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                    isDarkMode ? 'bg-blue-600/80 shadow-lg shadow-blue-500/25' : 'bg-blue-500 shadow-lg shadow-blue-500/25'
                  }`}>
                    <Image className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg mb-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Foto oder Video
                    </h4>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-600'
                    }`}>
                      Aus der Galerie auswählen
                    </p>
                  </div>
                  <div className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-500'
                  }`}>
                    📸
                  </div>
                </label>


                <button
                  onClick={() => {
                    setShowUploadOptions(false);
                    setShowVideoRecorder(true);
                  }}
                  className={`group w-full flex items-center gap-5 p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-500/30 hover:border-red-400/50 backdrop-blur-sm' 
                      : 'bg-gradient-to-r from-red-50/80 to-pink-50/80 border border-red-200/50 hover:border-red-300/70 backdrop-blur-sm shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className={`p-4 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                    isDarkMode ? 'bg-red-600/80 shadow-lg shadow-red-500/25' : 'bg-red-500 shadow-lg shadow-red-500/25'
                  }`}>
                    <Video className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className={`font-bold text-lg mb-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Video aufnehmen
                    </h4>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-red-300' : 'text-red-600'
                    }`}>
                      Direkt mit der Kamera
                    </p>
                  </div>
                  <div className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${
                    isDarkMode ? 'text-red-400' : 'text-red-500'
                  }`}>
                    🎥
                  </div>
                </button>


                <button
                  onClick={() => {
                    setShowUploadOptions(false);
                    setShowNoteInput(true);
                  }}
                  className={`group w-full flex items-center gap-5 p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/30 hover:border-pink-400/50 backdrop-blur-sm' 
                      : 'bg-gradient-to-r from-pink-50/80 to-purple-50/80 border border-pink-200/50 hover:border-pink-300/70 backdrop-blur-sm shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className={`p-4 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                    isDarkMode ? 'bg-pink-600/80 shadow-lg shadow-pink-500/25' : 'bg-pink-500 shadow-lg shadow-pink-500/25'
                  }`}>
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className={`font-bold text-lg mb-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Notiz hinterlassen
                    </h4>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-pink-300' : 'text-pink-600'
                    }`}>
                      Schöne Nachricht für das Brautpaar
                    </p>
                  </div>
                  <div className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-500'
                  }`}>
                    💌
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowUploadOptions(false)}
                className={`w-full mt-6 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:scale-[1.02] ${
                  isDarkMode 
                    ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50' 
                    : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-700 border border-gray-200/50'
                }`}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Input Modal - Instagram 2.0 Style */}
      {showNoteInput && (
        <div 
          className="modal-overlay"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 99999999
          }}
          onClick={() => {
            setShowNoteInput(false);
            setNoteText('');
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`rounded-3xl p-8 max-w-lg w-full transition-all duration-500 relative overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-800/90 border border-gray-700/50 backdrop-blur-xl shadow-2xl shadow-purple-500/20' 
              : 'bg-white/95 border border-gray-200/50 backdrop-blur-xl shadow-2xl shadow-pink-500/20'
          }`}>
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl ${
                isDarkMode ? 'bg-pink-500' : 'bg-pink-300'
              }`} style={{ transform: 'translate(50%, -50%)' }}></div>
              <div className={`absolute bottom-0 left-0 w-20 h-20 rounded-full blur-2xl ${
                isDarkMode ? 'bg-purple-500' : 'bg-purple-300'
              }`} style={{ transform: 'translate(-50%, 50%)' }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 p-4 rounded-2xl ${
                  isDarkMode ? 'bg-pink-500/20' : 'bg-pink-500/10'
                }`}>
                  <MessageSquare className={`w-full h-full ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-600'
                  }`} />
                </div>
                <h3 className={`text-xl font-bold tracking-tight mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Notiz hinterlassen
                </h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Teile deine Gedanken und Wünsche mit dem Brautpaar
                </p>
              </div>
              <form onSubmit={handleNoteSubmit} className="space-y-6">
                <div className="relative">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Hinterlasse eine schöne Nachricht für das Brautpaar..."
                    rows={5}
                    className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-pink-500/30 focus:border-pink-500 outline-none resize-none transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm' 
                        : 'bg-white/80 border-gray-300/50 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
                    }`}
                    autoFocus
                    maxLength={500}
                  />
                  <div className={`absolute bottom-3 right-3 text-xs transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {noteText.length}/500
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNoteInput(false);
                      setNoteText('');
                    }}
                    className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:scale-[1.02] ${
                      isDarkMode 
                        ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50' 
                        : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-700 border border-gray-200/50'
                    }`}
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={!noteText.trim()}
                    className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:scale-[1.02] text-white ${
                      !noteText.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isDarkMode
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg shadow-pink-500/25'
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-500/25'
                    }`}
                  >
                    Senden
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Video Recorder */}
      {showVideoRecorder && (
        <VideoRecorder
          onVideoRecorded={handleVideoRecorded}
          onClose={() => setShowVideoRecorder(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};