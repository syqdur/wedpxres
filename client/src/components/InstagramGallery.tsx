import React, { useState } from 'react';
import { Grid, List, Heart, MessageCircle, Trash2, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
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

  if (items.length === 0) {
    return (
      <div className={`mx-4 my-6 p-8 rounded-3xl transition-all duration-500 relative overflow-hidden ${
        isDarkMode 
          ? 'bg-gray-800/40 border border-gray-700/30 backdrop-blur-xl shadow-2xl shadow-purple-500/10' 
          : 'bg-white/60 border border-gray-200/40 backdrop-blur-xl shadow-2xl shadow-pink-500/10'
      }`}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl ${
            isDarkMode ? 'bg-pink-500' : 'bg-pink-300'
          }`} style={{ transform: 'translate(50%, -50%)' }}></div>
          <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl ${
            isDarkMode ? 'bg-purple-500' : 'bg-purple-300'
          }`} style={{ transform: 'translate(-50%, 50%)' }}></div>
        </div>
        
        <div className="relative z-10 text-center py-8">
          <div className={`w-20 h-20 mx-auto mb-6 p-4 rounded-2xl transition-all duration-300 ${
            isDarkMode ? 'bg-pink-500/20' : 'bg-pink-500/10'
          }`}>
            <span className="text-4xl">📸</span>
          </div>
          
          <h3 className={`text-2xl font-bold mb-4 bg-gradient-to-br from-pink-500 to-purple-600 bg-clip-text text-transparent`}>
            Noch keine Beiträge
          </h3>
          
          <p className={`text-sm max-w-md mx-auto leading-relaxed transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Lade das erste Foto von eurer Hochzeit hoch oder hinterlasse eine Notiz!
          </p>
        </div>
      </div>
    );
  }

  // Filter items for grid view
  const mediaItems = items.filter(item => item.type !== 'note');
  const noteItems = items.filter(item => item.type === 'note');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'vor wenigen Minuten';
    if (diffInHours < 24) return `vor ${diffInHours}h`;
    if (diffInHours < 168) return `vor ${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString('de-DE');
  };

  const getAvatarUrl = (username: string) => {
    const weddingAvatars = [
      'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'https://images.pexels.com/photos/1616113/pexels-photo-1616113.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'https://images.pexels.com/photos/1444424/pexels-photo-1444424.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'https://images.pexels.com/photos/1024967/pexels-photo-1024967.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'https://images.pexels.com/photos/1729799/pexels-photo-1729799.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'https://images.pexels.com/photos/1444443/pexels-photo-1444443.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    ];
    
    const hash = username.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return weddingAvatars[Math.abs(hash) % weddingAvatars.length];
  };

  // Slider navigation for notes
  const nextNote = () => {
    setNotesSliderIndex((prev) => 
      prev === noteItems.length - 1 ? 0 : prev + 1
    );
  };

  const prevNote = () => {
    setNotesSliderIndex((prev) => 
      prev === 0 ? noteItems.length - 1 : prev - 1
    );
  };

  const goToNote = (index: number) => {
    setNotesSliderIndex(index);
  };

  return (
    <div>
      {/* Modern View Toggle */}
      <div className={`mx-4 mb-6 p-2 rounded-3xl transition-all duration-500 relative overflow-hidden ${
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
        <div className="relative z-10 flex items-center justify-center">
          <div className={`p-1 rounded-2xl transition-all duration-300 ${
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
        // Feed View (existing)
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
        // Grid View with Notes Slider
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
                                <div className={`text-sm transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {formatDate(item.uploadedAt)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              {canEdit && onEditNote && (
                                <button
                                  onClick={() => {
                                    const newText = prompt('Notiz bearbeiten:', item.noteText);
                                    if (newText && newText.trim()) {
                                      onEditNote(item, newText.trim());
                                    }
                                  }}
                                  className={`p-2 rounded transition-colors duration-300 ${
                                    isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-500 hover:bg-blue-50'
                                  }`}
                                  title="Notiz bearbeiten"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              )}
                              {canDelete && onDelete && (
                                <button
                                  onClick={() => onDelete(item)}
                                  className={`p-2 rounded transition-colors duration-300 ${
                                    isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-500 hover:bg-red-50'
                                  }`}
                                  title="Notiz löschen"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Note Content */}
                          <div className={`p-4 rounded-lg mb-4 transition-colors duration-300 ${
                            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                          }`}>
                            <p className={`text-base leading-relaxed transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              "{item.noteText}"
                            </p>
                          </div>

                          {/* Note Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => onToggleLike(item.id)}
                                className={`flex items-center gap-2 transition-colors ${
                                  isLiked ? 'text-red-500' : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}
                              >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="font-medium">{itemLikes.length}</span>
                              </button>
                              <div className={`flex items-center gap-2 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                <MessageCircle className="w-5 h-5" />
                                <span className="font-medium">{itemComments.length}</span>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              💌 Notiz
                            </div>
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
                              <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5"></div>
                            </div>
                          </div>
                        ) : item.isUnavailable || !item.url ? (
                          <div className={`w-full h-full flex items-center justify-center transition-colors duration-300 ${
                            isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <div className="text-center">
                              <div className="text-2xl mb-1">📷</div>
                              <div className="text-xs">Nicht verfügbar</div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt="Hochzeitsfoto"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex items-center gap-4 text-white">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 fill-current" />
                            <span className="font-semibold">{itemLikes.length}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-semibold">{itemComments.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Media type indicator */}
                      {item.type === 'image' && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-black/60 rounded-full p-1">
                            <span className="text-white text-xs">📸</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty Grid State */}
          {mediaItems.length === 0 && noteItems.length === 0 && (
            <div className={`mx-4 my-6 p-8 rounded-3xl transition-all duration-500 relative overflow-hidden ${
              isDarkMode 
                ? 'bg-gray-800/40 border border-gray-700/30 backdrop-blur-xl shadow-2xl shadow-purple-500/10' 
                : 'bg-white/60 border border-gray-200/40 backdrop-blur-xl shadow-2xl shadow-pink-500/10'
            }`}>
              {/* Decorative background elements */}
              <div className="absolute inset-0 opacity-10">
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl ${
                  isDarkMode ? 'bg-pink-500' : 'bg-pink-300'
                }`} style={{ transform: 'translate(50%, -50%)' }}></div>
                <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl ${
                  isDarkMode ? 'bg-purple-500' : 'bg-purple-300'
                }`} style={{ transform: 'translate(-50%, 50%)' }}></div>
              </div>
              
              <div className="relative z-10 text-center py-8">
                <div className={`w-20 h-20 mx-auto mb-6 p-4 rounded-2xl transition-all duration-300 ${
                  isDarkMode ? 'bg-pink-500/20' : 'bg-pink-500/10'
                }`}>
                  <Grid className={`w-full h-full transition-colors duration-300 ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-600'
                  }`} />
                </div>
                
                <h3 className={`text-2xl font-bold mb-4 bg-gradient-to-br from-pink-500 to-purple-600 bg-clip-text text-transparent`}>
                  Keine Inhalte
                </h3>
                
                <p className={`text-sm max-w-md mx-auto leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Lade das erste Foto hoch oder hinterlasse eine Notiz!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};