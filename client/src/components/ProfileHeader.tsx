import React, { useState, useEffect } from 'react';
import { Settings, UserPlus, Edit3, Clock, X } from 'lucide-react';
import { ProfileEditModal } from './ProfileEditModal';
import { loadProfile, updateProfile } from '../services/firebaseService';
import { ProfileData } from '../types';

interface ProfileHeaderProps {
  isDarkMode: boolean;
  isAdmin: boolean;
  userName?: string;
  mediaItems?: any[];
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ isDarkMode, isAdmin, userName, mediaItems = [] }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [countdownEnded, setCountdownEnded] = useState(false);

  useEffect(() => {
    const unsubscribe = loadProfile(setProfileData);
    return unsubscribe;
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!profileData?.countdownDate) {
      setCountdown(null);
      setCountdownEnded(false);
      return;
    }

    const updateCountdown = () => {
      const targetDate = new Date(profileData.countdownDate!).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
        setCountdownEnded(false);
      } else {
        setCountdown(null);
        setCountdownEnded(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [profileData?.countdownDate]);

  const handleSaveProfile = async (newProfileData: {
    profilePicture?: File | string;
    name: string;
    bio: string;
    countdownDate?: string;
    countdownEndMessage?: string;
    countdownMessageDismissed?: boolean;
  }) => {
    if (!userName) return;
    await updateProfile(newProfileData, userName);
  };

  const handleDismissMessage = async () => {
    if (!userName || !profileData) return;
    
    await updateProfile({
      ...profileData,
      countdownMessageDismissed: true
    }, userName);
  };
  return (
    <div className={`mx-4 my-6 p-6 rounded-3xl transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gray-800/40 border border-gray-700/30 backdrop-blur-xl shadow-2xl shadow-purple-500/10' 
        : 'bg-white/60 border border-gray-200/40 backdrop-blur-xl shadow-2xl shadow-pink-500/10'
    }`}>
      <div className="flex items-center gap-6 mb-6">
        <div className={`w-24 h-24 rounded-full overflow-hidden relative ring-4 transition-all duration-300 ${
          isDarkMode 
            ? 'ring-gradient-to-r from-purple-600 to-pink-600 ring-purple-500/30' 
            : 'ring-gradient-to-r from-pink-500 to-purple-500 ring-pink-500/30'
        }`}>
          {profileData?.profilePicture ? (
            <img 
              src={profileData.profilePicture} 
              alt={profileData.name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-2xl font-bold ${
              isDarkMode 
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' 
                : 'bg-gradient-to-br from-pink-500 to-purple-500 text-white'
            }`}>
              {(profileData?.name || userName || 'K&M').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            kristinundmauro.de
          </h2>
          <div className={`flex gap-8 mt-3 text-sm font-medium transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <span className="flex flex-col items-center">
              <span className="font-bold text-lg">∞</span>
              <span className="text-xs opacity-70">Follower</span>
            </span>
            <span className="flex flex-col items-center">
              <span className="font-bold text-lg">{mediaItems.length || 0}</span>
              <span className="text-xs opacity-70">Beiträge</span>
            </span>
          </div>
        </div>
      </div>
     
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`font-bold text-lg tracking-tight transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {profileData?.name || 'Kristin & Maurizio 💕'}
          </h3>
          {isAdmin && (
            <button
              onClick={() => setShowEditModal(true)}
              className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-gray-700/50 hover:bg-gray-600/50 backdrop-blur-sm' 
                  : 'bg-gray-100/50 hover:bg-gray-200/50 backdrop-blur-sm'
              }`}
              title="Profil bearbeiten"
            >
              <Edit3 className={`w-4 h-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`} />
            </button>
          )}
        </div>
        <p className={`text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {profileData?.bio || (
            <>
              Wir sagen JA! ✨<br/>
              12.07.2025 - Der schönste Tag unseres Lebens 💍<br/>
              Teilt eure Lieblingsmomente mit uns! 📸<br/>
              #MaurizioUndKristin #Hochzeit2025 #FürImmer
            </>
          )}
          <br/>
          <span className={`inline-block mt-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
          }`}>
            💻 coded by Mauro
          </span>
        </p>

        {/* Countdown Display */}
        {countdown && (
          <div className={`mt-6 p-6 rounded-2xl transition-all duration-500 relative overflow-hidden ${
            isDarkMode 
              ? 'bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 border border-purple-500/30 backdrop-blur-xl shadow-2xl shadow-purple-500/20' 
              : 'bg-gradient-to-br from-pink-50/80 via-purple-50/60 to-blue-50/80 border border-pink-200/50 backdrop-blur-xl shadow-2xl shadow-pink-500/20'
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
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className={`p-2 rounded-full transition-colors duration-300 ${
                  isDarkMode ? 'bg-pink-500/20' : 'bg-pink-500/10'
                }`}>
                  <Clock className={`w-5 h-5 transition-colors duration-300 ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-600'
                  }`} />
                </div>
                <span className={`font-bold text-lg tracking-wide transition-colors duration-300 ${
                  isDarkMode ? 'text-pink-300' : 'text-pink-700'
                }`}>
                  Bis zu unserem großen Tag
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: countdown.days, label: 'Tage', gradient: 'from-pink-500 to-rose-500' },
                  { value: countdown.hours, label: 'Stunden', gradient: 'from-purple-500 to-violet-500' },
                  { value: countdown.minutes, label: 'Minuten', gradient: 'from-blue-500 to-indigo-500' },
                  { value: countdown.seconds, label: 'Sekunden', gradient: 'from-teal-500 to-cyan-500' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`relative p-4 rounded-xl transition-all duration-500 hover:scale-105 transform ${
                      isDarkMode 
                        ? 'bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 shadow-lg' 
                        : 'bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg'
                    }`}
                  >
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.gradient} opacity-5`}></div>
                    <div className="relative z-10 text-center">
                      <div className={`text-3xl md:text-4xl font-black mb-1 bg-gradient-to-br ${item.gradient} bg-clip-text text-transparent`}>
                        {item.value.toString().padStart(2, '0')}
                      </div>
                      <div className={`text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {item.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Countdown End Message */}
        {countdownEnded && profileData?.countdownEndMessage && !profileData?.countdownMessageDismissed && (
          <div className={`mt-4 p-4 rounded-xl border-2 transition-colors duration-300 animate-pulse relative ${
            isDarkMode ? 'bg-pink-900/30 border-pink-500/50' : 'bg-pink-50 border-pink-300'
          }`}>
            {/* Close Button */}
            <button
              onClick={handleDismissMessage}
              className={`absolute top-2 right-2 p-1 rounded-full transition-colors duration-300 ${
                isDarkMode 
                  ? 'hover:bg-pink-800/50 text-pink-400 hover:text-pink-300' 
                  : 'hover:bg-pink-200 text-pink-600 hover:text-pink-700'
              }`}
              title="Nachricht schließen"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="text-center pr-6">
              <div className="text-2xl mb-2">🎉</div>
              <p className={`text-lg font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-pink-300' : 'text-pink-700'
              }`}>
                {profileData.countdownEndMessage}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentProfileData={{
          profilePicture: profileData?.profilePicture,
          name: profileData?.name || 'Kristin & Maurizio',
          bio: profileData?.bio || 'Wir sagen JA! ✨\n12.07.2025 - Der schönste Tag unseres Lebens 💍\nTeilt eure Lieblingsmomente mit uns! 📸\n#MaurizioUndKristin #Hochzeit2025 #FürImmer',
          countdownDate: profileData?.countdownDate,
          countdownEndMessage: profileData?.countdownEndMessage,
          countdownMessageDismissed: profileData?.countdownMessageDismissed
        }}
        onSave={handleSaveProfile}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
