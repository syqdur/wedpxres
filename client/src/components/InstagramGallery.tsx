import React, { useState } from 'react';
import { Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem, Comment, Like } from '../types';
import { InstagramPost } from './InstagramPost';
import { NotePost } from './NotePost';

interface InstagramGalleryProps {
  items: MediaItem[];
  onItemClick: (index: number) => void;
  onDelete?: (item: MediaItem) => void;
  onEditNote?: (item: MediaItem, newText: string) => void;
  isAdmin: boolean;
  comments: Comment[];
  likes: Like[];
  onAddComment: (mediaId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
  onToggleLike: (mediaId: string) => void;
  userName: string;
  isDarkMode: boolean;
}

export const InstagramGallery: React.FC<InstagramGalleryProps> = ({
  items,
  onItemClick,
  onDelete,
  onEditNote,
  isAdmin,
  comments,
  likes,
  onAddComment,
  onDeleteComment,
  onToggleLike,
  userName,
  isDarkMode
}) => {
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [notesSliderIndex, setNotesSliderIndex] = useState(0);

  const noteItems = items.filter(item => item.type === 'note');
  const mediaItems = items.filter(item => item.type !== 'note');

  const getAvatarUrl = (name: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`;
  };

  const nextNote = () => {
    setNotesSliderIndex((prev) => (prev + 1) % noteItems.length);
  };

  const prevNote = () => {
    setNotesSliderIndex((prev) => (prev - 1 + noteItems.length) % noteItems.length);
  };

  const goToNote = (index: number) => {
    setNotesSliderIndex(index);
  };

  return (
    <div>
      {/* Modern View Toggle */}
      <div className={`mx-4 mb-6 p-2 rounded-3xl transition-all duration-500 overflow-hidden ${
        isDarkMode 
          ? 'bg-gray-800/40 border border-gray-700/30 backdrop-blur-xl shadow-2xl shadow-purple-500/10' 
          : 'bg-white/60 border border-gray-200/40 backdrop-blur-xl shadow-2xl shadow-pink-500/10'
      }`}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-xl ${
            isDarkMode ? 'bg-pink-500' : 'bg-pink-300'
          }`} style={{ transform: 'translate(30%, -30%)' }}></div>
          <div className={`absolute bottom-0 left-0 w-12 h-12 rounded-full blur-xl ${
            isDarkMode ? 'bg-purple-500' : 'bg-purple-300'
          }`} style={{ transform: 'translate(-30%, 30%)' }}></div>
        </div>
        <div className="flex items-center justify-center">
          <div className={`p-1 rounded-2xl transition-all duration-300 flex flex-row ${
            isDarkMode ? 'bg-gray-700/30' : 'bg-white/50'
          }`}>
            <button
              onClick={() => setViewMode('feed')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                viewMode === 'feed'
                  ? isDarkMode
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25'
                : isDarkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">Feed</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                viewMode === 'grid'
                  ? isDarkMode
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="text-sm font-medium">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'feed' ? (
        // Feed View
        <div className="space-y-0">
          {items.map((item, index) => (
            item.type === 'note' ? (
              <NotePost
                key={item.id}
                item={item}
                comments={comments.filter(c => c.mediaId === item.id)}
                likes={likes.filter(l => l.mediaId === item.id)}
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment}
                onToggleLike={onToggleLike}
                onDelete={onDelete}
                onEditNote={onEditNote}
                showDeleteButton={isAdmin}
                userName={userName}
                isAdmin={isAdmin}
                isDarkMode={isDarkMode}
              />
            ) : (
              <InstagramPost
                key={item.id}
                item={item}
                comments={comments.filter(c => c.mediaId === item.id)}
                likes={likes.filter(l => l.mediaId === item.id)}
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment}
                onToggleLike={onToggleLike}
                onDelete={onDelete}
                onEditNote={onEditNote}
                showDeleteButton={isAdmin}
                userName={userName}
                isAdmin={isAdmin}
                onClick={() => onItemClick(index)}
                isDarkMode={isDarkMode}
              />
            )
          ))}
        </div>
      ) : (
        // Grid View
        <div className="p-1">
          {/* Notes Slider */}
          {noteItems.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 px-3">
                <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  💌 Notizen ({noteItems.length})
                </h3>
                
                {/* Slider Navigation */}
                {noteItems.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevNote}
                      className={`p-2 rounded-full transition-colors duration-300 ${
                        isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {/* Dots Indicator */}
                    <div className="flex gap-1">
                      {noteItems.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToNote(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === notesSliderIndex
                              ? 'bg-pink-500 w-4'
                              : isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={nextNote}
                      className={`p-2 rounded-full transition-colors duration-300 ${
                        isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Slider Container */}
              <div className="relative overflow-hidden rounded-xl">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${notesSliderIndex * 100}%)` }}
                >
                  {noteItems.map((item) => {
                    const itemLikes = likes.filter(l => l.mediaId === item.id);
                    const itemComments = comments.filter(c => c.mediaId === item.id);
                    const isLiked = itemLikes.some(like => like.userName === userName);
                    const canDelete = isAdmin || item.uploadedBy === userName;
                    const canEdit = item.uploadedBy === userName;
                
                    return (
                      <div
                        key={item.id}
                        className="w-full flex-shrink-0 px-3"
                      >
                        <div className={`p-6 rounded-xl border transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-800/50 border-gray-700' 
                            : 'bg-white border-gray-200 shadow-sm'
                        }`}>
                          {/* Note Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden">
                                <img 
                                  src={getAvatarUrl(item.uploadedBy)}
                                  alt={item.uploadedBy}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div>
                                  <span className={`font-semibold transition-colors duration-300 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {item.uploadedBy}
                                    {item.uploadedBy === userName && (
                                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full transition-colors duration-300 ${
                                        isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        Du
                                      </span>
                                    )}
                                  </span>
                                  <p className={`text-sm transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {new Date(item.uploadedAt).toLocaleDateString('de-DE', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Note Content */}
                          <div className={`mb-4 p-4 rounded-lg transition-colors duration-300 ${
                            isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                          }`}>
                            <p className={`text-base leading-relaxed transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {item.noteText || item.note}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => onToggleLike(item.id)}
                                className={`flex items-center gap-1 text-sm transition-colors duration-300 ${
                                  isLiked 
                                    ? 'text-red-500 hover:text-red-600' 
                                    : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
                                <span>{itemLikes.length}</span>
                              </button>
                              <span className={`text-sm transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                💬 {itemComments.length}
                              </span>
                            </div>
                            {(canDelete || canEdit) && (
                              <div className="flex gap-2">
                                {canEdit && onEditNote && (
                                  <button
                                    onClick={() => {
                                      const newText = prompt('Notiz bearbeiten:', item.noteText || item.note || '');
                                      if (newText !== null) {
                                        onEditNote(item, newText);
                                      }
                                    }}
                                    className={`text-sm px-3 py-1 rounded-full transition-colors duration-300 ${
                                      isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                                    }`}
                                  >
                                    Bearbeiten
                                  </button>
                                )}
                                {canDelete && onDelete && (
                                  <button
                                    onClick={() => onDelete(item)}
                                    className={`text-sm px-3 py-1 rounded-full transition-colors duration-300 ${
                                      isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-100 hover:bg-red-200 text-red-800'
                                    }`}
                                  >
                                    Löschen
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Swipe Hint */}
              {noteItems.length > 1 && (
                <div className={`text-center mt-2 text-xs transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  ← Wische oder nutze die Pfeile zum Navigieren →
                </div>
              )}
            </div>
          )}

          {/* Media Grid */}
          {mediaItems.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-3 px-3 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                📸 Medien ({mediaItems.length})
              </h3>
              <div className="grid grid-cols-3 gap-1">
                {mediaItems.map((item, mediaIndex) => {
                  // Find the original index in the full items array
                  const originalIndex = items.findIndex(i => i.id === item.id);
                  const itemLikes = likes.filter(l => l.mediaId === item.id);
                  const itemComments = comments.filter(c => c.mediaId === item.id);
                  
                  return (
                    <div
                      key={item.id}
                      className="relative aspect-square cursor-pointer group"
                      onClick={() => onItemClick(originalIndex)}
                    >
                      {/* Media Content */}
                      <div className="w-full h-full overflow-hidden">
                        {item.type === 'video' ? (
                          <div className="relative w-full h-full">
                            <video
                              src={item.url}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                            {/* Video indicator */}
                            <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.noteText || item.note || 'Uploaded media'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="flex items-center justify-center gap-4 text-sm font-medium">
                            <span className="flex items-center gap-1">
                              <span>❤️</span>
                              {itemLikes.length}
                            </span>
                            <span className="flex items-center gap-1">
                              <span>💬</span>
                              {itemComments.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {items.length === 0 && (
            <div className={`text-center py-12 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="text-6xl mb-4">📸</div>
              <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Noch keine Beiträge
              </h3>
              <p className={`transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Lade das erste Foto hoch oder hinterlasse eine Notiz!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};