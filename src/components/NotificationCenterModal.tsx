import React, { useState } from 'react';
import { InAppNotification, UserPreferences } from '../types/hunter';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Calendar, 
  Trophy, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  Settings, 
  Clock 
} from 'lucide-react';

interface NotificationCenterModalProps {
  notifications: InAppNotification[];
  preferences: UserPreferences;
  onMarkAllAsRead: () => void;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  notifications,
  preferences,
  onMarkAllAsRead,
  onUpdatePreferences,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'workout_reminder':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'quest_reset':
        return <Clock className="w-4 h-4 text-cyan-400" />;
      case 'achievement_unlocked':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'rank_promotion':
        return <Trophy className="w-4 h-4 text-purple-400" />;
      case 'community_challenge':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleTogglePref = (key: keyof UserPreferences['notificationsEnabled']) => {
    const updated = {
      ...preferences,
      notificationsEnabled: {
        ...preferences.notificationsEnabled,
        [key]: !preferences.notificationsEnabled[key],
      },
    };
    onUpdatePreferences(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-['Inter',sans-serif]">
      <div className="relative w-full max-w-lg max-h-[88vh] flex flex-col bg-[#071326] border border-cyan-500/30 rounded-3xl shadow-[0_0_40px_rgba(38,124,255,0.25)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0a1832]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base font-['Cinzel',serif] text-slate-100">
                Hunter Notifications
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && activeTab === 'notifications' && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 px-4 pt-2.5 pb-2 border-b border-slate-800/80 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer text-center ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(38,124,255,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(38,124,255,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'notifications' ? (
            notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-600" />
                <div className="text-sm font-semibold text-slate-400">No Notifications</div>
                <div className="text-xs">You will be alerted when daily quests reset or goals complete.</div>
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition flex items-start gap-3 ${
                    item.isRead
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                      : 'bg-gradient-to-r from-[#0c1e3d] to-[#071326] border-blue-500/50 shadow-[0_0_15px_rgba(38,124,255,0.1)]'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-200">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Choose which fitness notifications you wish to receive in-app:
              </div>

              <div className="space-y-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-3.5 divide-y divide-slate-800">
                {[
                  { key: 'workoutReminders', label: 'Workout Reminders', desc: 'Mindful cues for scheduled training sessions' },
                  { key: 'questResets', label: 'Daily Quest Resets', desc: 'Alerts when new daily or weekly quests refresh' },
                  { key: 'achievementAlerts', label: 'Achievement & Level-Up Unlocks', desc: 'Instant celebration when milestones are reached' },
                  { key: 'communityAnnouncements', label: 'Guild Challenges & Community', desc: 'Progress updates on collective guild goals' },
                ].map(opt => {
                  const isChecked = preferences.notificationsEnabled[opt.key as keyof UserPreferences['notificationsEnabled']];

                  return (
                    <div key={opt.key} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-xs text-slate-200">{opt.label}</div>
                        <div className="text-[11px] text-slate-400">{opt.desc}</div>
                      </div>

                      <button
                        onClick={() => handleTogglePref(opt.key as any)}
                        className={`w-11 h-6 rounded-full transition p-0.5 cursor-pointer flex items-center ${
                          isChecked ? 'bg-blue-600 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Zero manipulative notifications: Awakened Fit never spams or uses aggressive guilt tactics.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
