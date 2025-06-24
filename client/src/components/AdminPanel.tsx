import React, { useState } from 'react';
import { Lock, Unlock, Settings, Download, Globe, Users, ExternalLink, Image, Video, MessageSquare, Gift, Heart, Star, Eye, Code, Music, Sparkles, Camera } from 'lucide-react';
import { MediaItem } from '../types';
import { downloadAllMedia } from '../services/downloadService';
import { SiteStatus, updateSiteStatus, updateFeatureToggles } from '../services/siteStatusService';
import { ShowcaseModal } from './ShowcaseModal';
import { UserManagementModal } from './UserManagementModal';
import { SpotifyAdmin } from './SpotifyAdmin';

interface AdminPanelProps {
  isDarkMode: boolean;
  isAdmin: boolean;
  onToggleAdmin: (isAdmin: boolean) => void;
  mediaItems?: MediaItem[];
  siteStatus?: SiteStatus;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isDarkMode, 
  isAdmin, 
  onToggleAdmin,
  mediaItems = [],
  siteStatus
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadWarning, setShowDownloadWarning] = useState(false);
  const [isUpdatingSiteStatus, setIsUpdatingSiteStatus] = useState(false);
  const [isUpdatingFeatures, setIsUpdatingFeatures] = useState(false);
  const [showExternalServices, setShowExternalServices] = useState(false);
  const [showShowcase, setShowShowcase] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showSpotifyAdmin, setShowSpotifyAdmin] = useState(false);

  const handleAdminToggle = () => {
    onToggleAdmin(!isAdmin);
  };

  const handleToggleSiteStatus = async () => {
    if (!siteStatus) return;

    const action = siteStatus.isUnderConstruction ? 'freischalten' : 'sperren';
    const confirmMessage = siteStatus.isUnderConstruction 
      ? '🌐 Website für alle Besucher freischalten?\n\nAlle Besucher können dann sofort auf die Galerie zugreifen.'
      : '🔒 Website für alle Besucher sperren?\n\nAlle Besucher sehen dann die Under Construction Seite.';

    if (window.confirm(confirmMessage)) {
      setIsUpdatingSiteStatus(true);
      try {
        await updateSiteStatus(!siteStatus.isUnderConstruction, 'Admin');
        
        const successMessage = siteStatus.isUnderConstruction
          ? '✅ Website wurde erfolgreich freigeschaltet!\n\n🌐 Alle Besucher können jetzt auf die Galerie zugreifen.'
          : '🔒 Website wurde erfolgreich gesperrt!\n\n⏳ Alle Besucher sehen jetzt die Under Construction Seite.';
        
        alert(successMessage);
      } catch (error) {
        alert(`❌ Fehler beim ${action} der Website:\n${error}`);
      } finally {
        setIsUpdatingSiteStatus(false);
      }
    }
  };

  const handleDownloadAll = async () => {
    const downloadableItems = mediaItems.filter(item => item.type !== 'note');
    
    if (downloadableItems.length === 0) {
      alert('Keine Medien zum Herunterladen vorhanden.');
      return;
    }

    setShowDownloadWarning(true);
  };

  const confirmDownload = async () => {
    setShowDownloadWarning(false);
    setIsDownloading(true);
    
    try {
      await downloadAllMedia(mediaItems);
      
      const downloadableItems = mediaItems.filter(item => item.type !== 'note');
      alert(`✅ Download erfolgreich!\n\n📊 Heruntergeladen:\n- ${mediaItems.filter(item => item.type === 'image').length} Bilder\n- ${mediaItems.filter(item => item.type === 'video').length} Videos\n- ${mediaItems.filter(item => item.type === 'note').length} Notizen\n\n💡 Verwende die Bilder für professionelle Fotobuch-Services!`);
    } catch (error) {
      console.error('Download error:', error);
      
      if (error.toString().includes('teilweise erfolgreich')) {
        alert(`⚠️ ${error}\n\n💡 Die ZIP-Datei enthält alle verfügbaren Dateien und Fehlerberichte.`);
      } else {
        alert(`❌ Download-Fehler:\n${error}\n\n🔧 Versuche es erneut oder verwende einen anderen Browser.`);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // NEW: Handle Post-Wedding Recap
  const handleOpenPostWeddingRecap = () => {
    const recapUrl = '/admin/post-wedding-recap';
    window.open(recapUrl, '_blank', 'noopener,noreferrer');
  };

  const getDownloadButtonText = () => {
    const imageCount = mediaItems.filter(item => item.type === 'image').length;
    const videoCount = mediaItems.filter(item => item.type === 'video').length;
    const noteCount = mediaItems.filter(item => item.type === 'note').length;
    
    if (mediaItems.length === 0) return 'Keine Medien';
    
    const parts = [];
    if (imageCount > 0) parts.push(`${imageCount} Bild${imageCount > 1 ? 'er' : ''}`);
    if (videoCount > 0) parts.push(`${videoCount} Video${videoCount > 1 ? 's' : ''}`);
    if (noteCount > 0) parts.push(`${noteCount} Notiz${noteCount > 1 ? 'en' : ''}`);
    
    return parts.join(', ') + ' als ZIP';
  };

  const getSiteStatusInfo = () => {
    if (!siteStatus) return 'Status unbekannt';
    
    return siteStatus.isUnderConstruction 
      ? '🔒 Website ist gesperrt (Under Construction)'
      : '🌐 Website ist freigeschaltet';
  };

  const handleToggleGallery = async () => {
    if (!siteStatus) return;
    
    setIsUpdatingFeatures(true);
    try {
      await updateFeatureToggles(
        !siteStatus.galleryEnabled,
        siteStatus.musicWishlistEnabled,
        siteStatus.storiesEnabled,
        'Admin'
      );
    } catch (error) {
      alert('Fehler beim Aktualisieren der Galerie-Einstellung');
    } finally {
      setIsUpdatingFeatures(false);
    }
  };

  const handleToggleMusicWishlist = async () => {
    if (!siteStatus) return;
    
    setIsUpdatingFeatures(true);
    try {
      await updateFeatureToggles(
        siteStatus.galleryEnabled,
        !siteStatus.musicWishlistEnabled,
        siteStatus.storiesEnabled,
        'Admin'
      );
    } catch (error) {
      alert('Fehler beim Aktualisieren der Musikwünsche-Einstellung');
    } finally {
      setIsUpdatingFeatures(false);
    }
  };

  const handleToggleStories = async () => {
    if (!siteStatus) return;
    
    setIsUpdatingFeatures(true);
    try {
      await updateFeatureToggles(
        siteStatus.galleryEnabled,
        siteStatus.musicWishlistEnabled,
        !siteStatus.storiesEnabled,
        'Admin'
      );
    } catch (error) {
      alert('Fehler beim Aktualisieren der Stories-Einstellung');
    } finally {
      setIsUpdatingFeatures(false);
    }
  };

  const externalServices = [
    {
      name: 'CEWE Fotobuch',
      description: 'Deutschlands Testsieger - Kostenlose Software',
      url: 'https://www.cewe.de/fotobuch',
      features: ['Kostenlose Software', 'Testsieger Stiftung Warentest', 'Echtfotopapier', 'Express-Service'],
      price: 'ab 7,95€',
      flag: '🇩🇪',
      free: true
    },
    {
      name: 'dm Fotobuch',
      description: 'Günstige Fotobücher bei dm-drogerie markt',
      url: 'https://www.dm.de/services/fotobuch',
      features: ['Günstige Preise', 'In jeder dm-Filiale abholbar', 'Verschiedene Formate', 'Schnelle Bearbeitung'],
      price: 'ab 4,95€',
      flag: '🇩🇪',
      free: false
    },
    {
      name: 'Pixum',
      description: 'Premium deutsche Fotobücher',
      url: 'https://www.pixum.de/fotobuch',
      features: ['Made in Germany', 'Umweltfreundlich', 'Lebenslange Garantie', 'Premium-Qualität'],
      price: 'ab 12,95€',
      flag: '🇩🇪',
      free: false
    },
    {
      name: 'Rossmann Fotobuch',
      description: 'Fotobücher bei Rossmann - günstig und gut',
      url: 'https://www.rossmann-fotowelt.de/fotobuch',
      features: ['Sehr günstig', 'In Rossmann-Filialen abholbar', 'Einfache Bedienung', 'Schnelle Lieferung'],
      price: 'ab 3,99€',
      flag: '🇩🇪',
      free: false
    },
    {
      name: 'Albelli',
      description: 'Europäischer Fotobuch-Service mit kostenloser Software',
      url: 'https://www.albelli.de/fotobuch',
      features: ['Kostenlose Software', 'Hochwertige Bindung', 'Verschiedene Formate', 'Gute Preise'],
      price: 'ab 9,99€',
      flag: '🇪🇺',
      free: true
    },
    {
      name: 'Mein Fotobuch',
      description: 'Deutscher Anbieter mit kostenloser Software',
      url: 'https://www.meinfotobuch.de',
      features: ['Kostenlose Software', 'Deutsche Qualität', 'Persönlicher Service', 'Flexible Gestaltung'],
      price: 'ab 8,95€',
      flag: '🇩🇪',
      free: true
    }
  ];

  return (
    <>
      {/* Main Admin Toggle Button */}
      <button
        onClick={handleAdminToggle}
        className={`fixed bottom-4 left-4 p-2 rounded-full shadow-lg transition-colors duration-300 ${
          isDarkMode
            ? isAdmin
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            : isAdmin
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
        }`}
        title={isAdmin ? "Admin-Modus verlassen" : "Admin-Modus"}
      >
        {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
      </button>

      {/* Admin Controls - Vertical rectangular buttons */}
      {isAdmin && (
        <div className="fixed bottom-16 left-4 flex flex-col gap-2 max-w-xs">
          {/* POST-WEDDING RECAP BUTTON */}
          <button
            onClick={handleOpenPostWeddingRecap}
            className={`px-3 py-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              isDarkMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
            }`}
            title="Post-Hochzeits-Zusammenfassung"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Recap</span>
          </button>

          {/* USER MANAGEMENT BUTTON */}
          <button
            onClick={() => setShowUserManagement(true)}
            className={`px-3 py-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              isDarkMode
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                : 'bg-cyan-500 hover:bg-cyan-600 text-white'
            }`}
            title="User Management"
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Users</span>
          </button>

          {/* SPOTIFY ADMIN BUTTON */}
          <button
            onClick={() => setShowSpotifyAdmin(true)}
            className={`px-3 py-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              isDarkMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            title="Spotify Admin"
          >
            <Music className="w-4 h-4" />
            <span className="text-sm font-medium">Spotify</span>
          </button>

          {/* Showcase Button */}
          <button
            onClick={() => setShowShowcase(true)}
            className={`px-3 py-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              isDarkMode
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
            title="WeddingPix Showcase"
          >
            <Code className="w-4 h-4" />
            <span className="text-sm font-medium">Showcase</span>
          </button>

          {/* Gallery Toggle */}
          {siteStatus && (
            <button
              onClick={handleToggleGallery}
              disabled={isUpdatingFeatures}
              className={`px-3 py-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                isUpdatingFeatures
                  ? isDarkMode
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : siteStatus.galleryEnabled
                    ? isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-400 hover:bg-gray-500 text-gray-600'
              }`}
              title={`Galerie ${siteStatus.galleryEnabled ? 'deaktivieren' : 'aktivieren'}`}
            >
              <Image className="w-4 h-4" />
              <span className="text-sm font-medium">Gallery</span>
            </button>
          )}

          {/* Music Wishlist Toggle */}
          {siteStatus && (
            <button
              onClick={handleToggleMusicWishlist}
              disabled={isUpdatingFeatures}
              className={`px-3 py-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                isUpdatingFeatures
                  ? isDarkMode
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : siteStatus.musicWishlistEnabled
                    ? isDarkMode
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-400 hover:bg-gray-500 text-gray-600'
              }`}
              title={`Musikwünsche ${siteStatus.musicWishlistEnabled ? 'deaktivieren' : 'aktivieren'}`}
            >
              <Music className="w-4 h-4" />
              <span className="text-sm font-medium">Music</span>
            </button>
          )}

          {/* Stories Toggle */}
          {siteStatus && (
            <button
              onClick={handleToggleStories}
              disabled={isUpdatingFeatures}
              className={`px-3 py-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                isUpdatingFeatures
                  ? isDarkMode
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : siteStatus.storiesEnabled
                    ? isDarkMode
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-400 hover:bg-gray-500 text-gray-600'
              }`}
              title={`Stories ${siteStatus.storiesEnabled ? 'deaktivieren' : 'aktivieren'}`}
            >
              <Camera className="w-4 h-4" />
              <span className="text-sm font-medium">Stories</span>
            </button>
          )}

          {/* Site Status Toggle */}
          {siteStatus && (
            <button
              onClick={handleToggleSiteStatus}
              disabled={isUpdatingSiteStatus}
              className={`px-3 py-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                isUpdatingSiteStatus
                  ? isDarkMode
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : siteStatus.isUnderConstruction
                    ? isDarkMode
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                    : isDarkMode
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={getSiteStatusInfo()}
            >
              {isUpdatingSiteStatus ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {siteStatus.isUnderConstruction ? 'Unlock' : 'Lock'}
              </span>
            </button>
          )}

          {/* External Services Button */}
          <button
            onClick={() => setShowExternalServices(true)}
            className={`px-3 py-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              isDarkMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
            title="Deutsche Fotobuch-Services"
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Services</span>
          </button>
          
          {/* ZIP Download Button */}
          <button
            onClick={handleDownloadAll}
            disabled={isDownloading || mediaItems.length === 0}
            className={`px-3 py-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              isDownloading || mediaItems.length === 0
                ? isDarkMode
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
            title={getDownloadButtonText()}
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span className="text-sm font-medium">Download</span>
          </button>
        </div>
      )}

      {/* USER MANAGEMENT MODAL */}
      <UserManagementModal 
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
        isDarkMode={isDarkMode}
      />

      {/* SPOTIFY ADMIN MODAL */}
      {showSpotifyAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                🎵 Spotify Admin Panel
              </h3>
              <button
                onClick={() => setShowSpotifyAdmin(false)}
                className={`p-2 rounded-full transition-colors duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Spotify Admin Panel */}
            <SpotifyAdmin 
              isDarkMode={isDarkMode}
            />
            
            {/* Close Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowSpotifyAdmin(false)}
                className={`py-3 px-6 rounded-xl transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Showcase Modal */}
      <ShowcaseModal 
        isOpen={showShowcase}
        onClose={() => setShowShowcase(false)}
        isDarkMode={isDarkMode}
      />

      {/* External Services Modal */}
      {showExternalServices && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full transition-colors duration-300 ${
                  isDarkMode ? 'bg-purple-600' : 'bg-purple-500'
                }`}>
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Deutsche Fotobuch-Services 🇩🇪
                  </h3>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Erstelle ein hochwertiges Hochzeitsfotobuch mit deutschen Anbietern
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExternalServices(false)}
                className={`p-2 rounded-full transition-colors duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Instructions */}
            <div className={`p-4 rounded-xl mb-6 transition-colors duration-300 ${
              isDarkMode ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'
            }`}>
              <h4 className={`font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>
                📖 So erstellst du dein Hochzeitsfotobuch:
              </h4>
              <ol className={`text-sm space-y-1 transition-colors duration-300 ${
                isDarkMode ? 'text-blue-200' : 'text-blue-700'
              }`}>
                <li>1. 📥 Lade alle Bilder als ZIP herunter (Button links unten)</li>
                <li>2. 🎯 Wähle einen deutschen Service unten aus</li>
                <li>3. 📤 Lade die Bilder hoch und gestalte dein Fotobuch</li>
                <li>4. 📚 Bestelle dein hochwertiges Hochzeitsfotobuch</li>
              </ol>
            </div>

            {/* Content Stats */}
            <div className={`p-4 rounded-xl mb-6 transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'
            }`}>
              <h4 className={`font-semibold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                📊 Verfügbare Inhalte:
              </h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'bg-green-600' : 'bg-green-500'
                  }`}>
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {mediaItems.filter(item => item.type === 'image').length}
                  </div>
                  <div className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Bilder
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                  }`}>
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {mediaItems.filter(item => item.type === 'video').length}
                  </div>
                  <div className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Videos
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'bg-pink-600' : 'bg-pink-500'
                  }`}>
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-600'
                  }`}>
                    {mediaItems.filter(item => item.type === 'note').length}
                  </div>
                  <div className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Nachrichten
                  </div>
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {externalServices.map((service, index) => (
                <div key={index} className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 shadow-lg'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{service.flag}</span>
                      {service.free && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${
                          isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'
                        }`}>
                          <Gift className="w-3 h-3 inline mr-1" />
                          Kostenlos
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {service.price}
                    </span>
                  </div>
                  
                  <h4 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {service.name}
                  </h4>
                  
                  <p className={`text-sm mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {service.description}
                  </p>
                  
                  <div className="mb-4">
                    <ul className={`text-xs space-y-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Service besuchen
                  </a>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowExternalServices(false)}
                className={`py-3 px-6 rounded-xl transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Warning Modal */}
      {showDownloadWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-md w-full transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-blue-500" />
              <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Medien herunterladen
              </h3>
            </div>
            
            <div className={`mb-6 space-y-3 text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <p>
                <strong>Was wird heruntergeladen:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{mediaItems.filter(item => item.type === 'image').length} Bilder</li>
                <li>{mediaItems.filter(item => item.type === 'video').length} Videos</li>
                <li>{mediaItems.filter(item => item.type === 'note').length} Notizen (als Textdatei)</li>
              </ul>
              
              <div className={`p-3 rounded-lg mt-4 transition-colors duration-300 ${
                isDarkMode ? 'bg-blue-900/30 border border-blue-700/50' : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className="text-xs">
                  <strong>💡 Tipp:</strong><br/>
                  Verwende die heruntergeladenen Bilder für deutsche Fotobuch-Services wie CEWE, dm oder Pixum für beste Qualität!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDownloadWarning(false)}
                className={`flex-1 py-3 px-4 rounded-xl transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDownload}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl transition-colors"
              >
                Download starten
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// X icon component
const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);