import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Sun, Moon } from 'lucide-react';
import { UserNamePrompt } from './components/UserNamePrompt';
import { UploadSection } from './components/UploadSection';
import { InstagramGallery } from './components/InstagramGallery';
import { MediaModal } from './components/MediaModal';
import { AdminPanel } from './components/AdminPanel';
import { ProfileHeader } from './components/ProfileHeader';
import { UnderConstructionPage } from './components/UnderConstructionPage';
import { StoriesBar } from './components/StoriesBar';
import { StoriesViewer } from './components/StoriesViewer';
import { StoryUploadModal } from './components/StoryUploadModal';
import { TabNavigation } from './components/TabNavigation';
import { LiveUserIndicator } from './components/LiveUserIndicator';
import { SpotifyCallback } from './components/SpotifyCallback';
import { MusicWishlist } from './components/MusicWishlist';
import { Timeline } from './components/Timeline';
import { PostWeddingRecap } from './components/PostWeddingRecap';
import { PublicRecapPage } from './components/PublicRecapPage';
import { AdminLoginModal } from './components/AdminLoginModal';
import { useUser } from './hooks/useUser';
import { useDarkMode } from './hooks/useDarkMode';
import { MediaItem, Comment, Like } from './types';
import {
  uploadFiles,
  uploadVideoBlob,
  loadGallery,
  deleteMediaItem,
  loadComments,
  addComment,
  deleteComment,
  loadLikes,
  toggleLike,
  addNote,
  editNote
} from './services/firebaseService';
import { subscribeSiteStatus, SiteStatus } from './services/siteStatusService';
import {
  subscribeStories,
  subscribeAllStories,
  addStory,
  markStoryAsViewed,
  deleteStory,
  cleanupExpiredStories,
  Story
} from './services/liveService';

function App() {
  const { userName, deviceId, showNamePrompt, setUserName } = useUser();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [status, setStatus] = useState('');
  const [siteStatus, setSiteStatus] = useState<SiteStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showStoriesViewer, setShowStoriesViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showStoryUpload, setShowStoryUpload] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'music' | 'timeline'>('gallery');
  
  // Handle tab switching when features are disabled
  const handleTabChange = (tab: 'gallery' | 'music' | 'timeline') => {
    if (tab === 'gallery' && siteStatus && !siteStatus.galleryEnabled) {
      return; // Don't switch to gallery if disabled
    }
    if (tab === 'music' && siteStatus && !siteStatus.musicWishlistEnabled) {
      return; // Don't switch to music if disabled
    }
    setActiveTab(tab);
  };

  // Auto-switch away from disabled tabs
  useEffect(() => {
    if (siteStatus) {
      if (activeTab === 'gallery' && !siteStatus.galleryEnabled) {
        setActiveTab('timeline'); // Switch to timeline if gallery is disabled
      }
      if (activeTab === 'music' && !siteStatus.musicWishlistEnabled) {
        setActiveTab('timeline'); // Switch to timeline if music is disabled
      }
    }
  }, [siteStatus, activeTab]);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Check if we're on the Spotify callback page
  const isSpotifyCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('code') && urlParams.has('state');
  };

  // Check if we're on the Public Recap page
  const isPublicRecap = () => {
    return window.location.pathname === '/recap';
  };

  // Check if we're on the Post-Wedding Recap page (admin)
  const isPostWeddingRecap = () => {
    return window.location.pathname === '/admin/post-wedding-recap';
  };

  // Subscribe to site status changes
  useEffect(() => {
    const unsubscribe = subscribeSiteStatus((status) => {
      setSiteStatus(status);
    });

    return unsubscribe;
  }, []);

  // Subscribe to stories when user is logged in
  useEffect(() => {
    if (!userName || !siteStatus || siteStatus.isUnderConstruction) return;

    // Subscribe to stories (admin sees all, users see only active)
    const unsubscribeStories = isAdmin 
      ? subscribeAllStories(setStories)
      : subscribeStories(setStories);

    // Cleanup expired stories periodically
    const cleanupInterval = setInterval(() => {
      cleanupExpiredStories();
    }, 60000); // Check every minute

    return () => {
      clearInterval(cleanupInterval);
      unsubscribeStories();
    };
  }, [userName, deviceId, siteStatus, isAdmin]);

  useEffect(() => {
    if (!userName || !siteStatus || siteStatus.isUnderConstruction) return;

    const unsubscribeGallery = loadGallery(setMediaItems);
    const unsubscribeComments = loadComments(setComments);
    const unsubscribeLikes = loadLikes(setLikes);

    return () => {
      unsubscribeGallery();
      unsubscribeComments();
      unsubscribeLikes();
    };
  }, [userName, siteStatus]);

  // Auto-logout when window/tab is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear admin status when page is closed
      if (isAdmin) {
        localStorage.removeItem('admin_status');
      }
    };

    // Check if admin status is stored in localStorage (for page refreshes)
    const storedAdminStatus = localStorage.getItem('admin_status');
    if (storedAdminStatus) {
      setIsAdmin(true);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAdmin]);

  const handleUpload = async (files: FileList) => {
    if (!userName) return;

    setIsUploading(true);
    setUploadProgress(0);
    setStatus('⏳ Lädt hoch...');

    try {
      await uploadFiles(files, userName, deviceId, setUploadProgress);
      setStatus('✅ Bilder erfolgreich hochgeladen!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('❌ Fehler beim Hochladen. Bitte versuche es erneut.');
      console.error('Upload error:', error);
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleVideoUpload = async (videoBlob: Blob) => {
    if (!userName) return;

    setIsUploading(true);
    setUploadProgress(0);
    setStatus('⏳ Video wird hochgeladen...');

    try {
      await uploadVideoBlob(videoBlob, userName, deviceId, setUploadProgress);
      setStatus('✅ Video erfolgreich hochgeladen!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('❌ Fehler beim Hochladen des Videos. Bitte versuche es erneut.');
      console.error('Video upload error:', error);
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleNoteSubmit = async (noteText: string) => {
    if (!userName) return;

    setIsUploading(true);
    setStatus('⏳ Notiz wird gespeichert...');

    try {
      await addNote(noteText, userName, deviceId);
      setStatus('✅ Notiz erfolgreich hinterlassen!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('❌ Fehler beim Speichern der Notiz. Bitte versuche es erneut.');
      console.error('Note error:', error);
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditNote = async (item: MediaItem, newText: string) => {
    if (!userName || item.uploadedBy !== userName) {
      alert('Du kannst nur deine eigenen Notizen bearbeiten.');
      return;
    }

    setIsUploading(true);
    setStatus('⏳ Notiz wird aktualisiert...');

    try {
      await editNote(item.id, newText);
      setStatus('✅ Notiz erfolgreich aktualisiert!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('❌ Fehler beim Aktualisieren der Notiz. Bitte versuche es erneut.');
      console.error('Edit note error:', error);
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    // Check permissions
    if (!isAdmin && item.uploadedBy !== userName) {
      alert('Du kannst nur deine eigenen Beiträge löschen.');
      return;
    }

    const itemType = item.type === 'note' ? 'Notiz' : item.type === 'video' ? 'Video' : 'Bild';
    const confirmMessage = isAdmin 
      ? `${itemType} von ${item.uploadedBy} wirklich löschen?`
      : `Dein${item.type === 'note' ? 'e' : ''} ${itemType} wirklich löschen?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteMediaItem(item);
      setStatus(`✅ ${itemType} erfolgreich gelöscht!`);
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus(`❌ Fehler beim Löschen des ${itemType}s.`);
      console.error('Delete error:', error);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleAddComment = async (mediaId: string, text: string) => {
    if (!userName) return;
    
    try {
      await addComment(mediaId, text, userName, deviceId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleToggleLike = async (mediaId: string) => {
    if (!userName) return;
    
    try {
      await toggleLike(mediaId, userName, deviceId);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleStoryUpload = async (file: File) => {
    if (!userName) return;

    setIsUploading(true);
    setStatus('⏳ Story wird hochgeladen...');

    try {
      // Determine media type
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      
      // Add story using the service function
      await addStory(file, mediaType, userName, deviceId);
      
      setStatus('✅ Story erfolgreich hinzugefügt!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Story upload error:', error);
      setStatus('❌ Fehler beim Hochladen der Story. Bitte versuche es erneut.');
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewStory = (storyIndex: number) => {
    setCurrentStoryIndex(storyIndex);
    setShowStoriesViewer(true);
  };

  const handleStoryViewed = async (storyId: string) => {
    await markStoryAsViewed(storyId, deviceId);
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteStory(storyId);
      setStatus('✅ Story erfolgreich gelöscht!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error deleting story:', error);
      setStatus('❌ Fehler beim Löschen der Story.');
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === mediaItems.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? mediaItems.length - 1 : prev - 1
    );
  };

  const handleAdminLogin = (username: string) => {
    setIsAdmin(true);
    localStorage.setItem('admin_status', 'true');
    setShowAdminLogin(false);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('admin_status');
  };

  // Show Spotify callback handler if on callback page
  if (isSpotifyCallback()) {
    return <SpotifyCallback isDarkMode={isDarkMode} />;
  }

  // Show Public Recap Page if on that route
  if (isPublicRecap()) {
    return <PublicRecapPage isDarkMode={isDarkMode} />;
  }

  // Show Post-Wedding Recap if on that route (admin only)
  if (isPostWeddingRecap()) {
    // Only allow access if admin
    if (!isAdmin) {
      return (
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Zugriff verweigert
            </h1>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Diese Seite ist nur für Administratoren zugänglich.
            </p>
            <button
              onClick={() => setShowAdminLogin(true)}
              className="mt-4 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-colors"
            >
              Anmelden
            </button>
          </div>
          
          <AdminLoginModal 
            isOpen={showAdminLogin}
            onClose={() => setShowAdminLogin(false)}
            onLogin={handleAdminLogin}
            isDarkMode={isDarkMode}
          />
        </div>
      );
    }

    return (
      <PostWeddingRecap
        isDarkMode={isDarkMode}
        mediaItems={mediaItems}
        isAdmin={isAdmin}
        userName={userName || ''}
      />
    );
  }

  // Show loading while site status is being fetched
  if (siteStatus === null) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className={`text-lg transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Lade Website...
          </p>
        </div>
      </div>
    );
  }

  // Show under construction page if site is under construction
  if (siteStatus.isUnderConstruction) {
    return (
      <UnderConstructionPage 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        siteStatus={siteStatus}
        isAdmin={isAdmin}
        onToggleAdmin={setIsAdmin}
      />
    );
  }

  if (showNamePrompt) {
    return <UserNamePrompt onSubmit={setUserName} isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/10 to-pink-900/10' 
        : 'bg-gradient-to-br from-gray-50 via-pink-50/30 to-purple-50/20'
    }`}>
      {/* Modern Instagram 2.0 Header */}
      <div className={`sticky top-0 z-50 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-900/70 border-gray-700/30 backdrop-blur-xl shadow-xl shadow-purple-500/5' 
          : 'bg-white/70 border-gray-200/30 backdrop-blur-xl shadow-xl shadow-pink-500/5'
      } border-b`}>
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                  : 'bg-gradient-to-r from-pink-500 to-purple-500'
              }`}>
                <span className="text-white text-sm font-bold">K&M</span>
              </div>
              <h1 className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                kristinundmauro
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Live User Indicator */}
              <LiveUserIndicator 
                currentUser={userName || ''}
                isDarkMode={isDarkMode}
              />
              
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? 'text-yellow-400 hover:bg-gray-800/50 hover:scale-110' 
                    : 'text-gray-600 hover:bg-gray-100/50 hover:scale-110'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <ProfileHeader 
          isDarkMode={isDarkMode} 
          isAdmin={isAdmin}
          userName={userName}
          mediaItems={mediaItems}
        />
        
        {/* Stories Bar */}
        <StoriesBar
          stories={stories}
          currentUser={userName || ''}
          onAddStory={() => setShowStoryUpload(true)}
          onViewStory={handleViewStory}
          isDarkMode={isDarkMode}
          storiesEnabled={siteStatus?.storiesEnabled ?? true}
        />
        
        {/* Tab Navigation */}
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isDarkMode={isDarkMode}
          galleryEnabled={siteStatus?.galleryEnabled ?? true}
          musicWishlistEnabled={siteStatus?.musicWishlistEnabled ?? true}
        />

        {/* Tab Content */}
        {activeTab === 'gallery' && siteStatus?.galleryEnabled ? (
          <>
            <UploadSection
              onUpload={handleUpload}
              onVideoUpload={handleVideoUpload}
              onNoteSubmit={handleNoteSubmit}
              onAddStory={() => setShowStoryUpload(true)}
              isUploading={isUploading}
              progress={uploadProgress}
              isDarkMode={isDarkMode}
              storiesEnabled={siteStatus?.storiesEnabled ?? true}
            />

            {status && (
              <div className="px-4 py-2">
                <p className={`text-sm text-center transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`} dangerouslySetInnerHTML={{ __html: status }} />
              </div>
            )}

            <InstagramGallery
              items={mediaItems}
              onItemClick={openModal}
              onDelete={handleDelete}
              onEditNote={handleEditNote}
              isAdmin={isAdmin}
              comments={comments}
              likes={likes}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onToggleLike={handleToggleLike}
              userName={userName || ''}
              isDarkMode={isDarkMode}
            />
          </>
        ) : activeTab === 'timeline' ? (
          <Timeline 
            isDarkMode={isDarkMode}
            userName={userName || ''}
            isAdmin={isAdmin}
          />
        ) : activeTab === 'music' && siteStatus?.musicWishlistEnabled ? (
          <MusicWishlist isDarkMode={isDarkMode} />
        ) : (
          <div className={`p-8 text-center transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <p>Diese Funktion ist derzeit deaktiviert.</p>
          </div>
        )}
      </div>

      <MediaModal
        isOpen={modalOpen}
        items={mediaItems}
        currentIndex={currentImageIndex}
        onClose={() => setModalOpen(false)}
        onNext={nextImage}
        onPrev={prevImage}
        comments={comments}
        likes={likes}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onToggleLike={handleToggleLike}
        userName={userName || ''}
        isAdmin={isAdmin}
        isDarkMode={isDarkMode}
      />

      {/* Stories Viewer */}
      <StoriesViewer
        isOpen={showStoriesViewer}
        stories={stories}
        initialStoryIndex={currentStoryIndex}
        currentUser={userName || ''}
        onClose={() => setShowStoriesViewer(false)}
        onStoryViewed={handleStoryViewed}
        onDeleteStory={handleDeleteStory}
        isAdmin={isAdmin}
        isDarkMode={isDarkMode}
      />

      {/* Story Upload Modal */}
      <StoryUploadModal
        isOpen={showStoryUpload}
        onClose={() => setShowStoryUpload(false)}
        onUpload={handleStoryUpload}
        isDarkMode={isDarkMode}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={handleAdminLogin}
        isDarkMode={isDarkMode}
      />

      <AdminPanel 
        isDarkMode={isDarkMode} 
        isAdmin={isAdmin}
        onToggleAdmin={(status) => {
          if (status) {
            setShowAdminLogin(true);
          } else {
            handleAdminLogout();
          }
        }}
        mediaItems={mediaItems}
        siteStatus={siteStatus}
      />
    </div>
  );
}

export default App;