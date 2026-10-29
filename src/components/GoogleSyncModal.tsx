import React from 'react';
import { User } from 'firebase/auth';
import { X, Cloud, ExternalLink, RefreshCw, FileSpreadsheet, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface GoogleSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  sheetInfo: { id: string; name: string; url: string } | null;
  isSyncing: boolean;
  onForceSync: () => void;
}

export const GoogleSyncModal: React.FC<GoogleSyncModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  sheetInfo,
  isSyncing,
  onForceSync,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg p-6 bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <Cloud className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Google Drive &amp; Sheets Sync</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Nexus Life Command stores and reads your life analytics from your personal Google Drive using Google Sheets.
        </p>

        {user ? (
          <div className="space-y-4">
            {/* Account Status Card */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-9 h-9 rounded-full border border-slate-700" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-cyan-900/60 border border-cyan-700/60 flex items-center justify-center text-cyan-300 font-bold text-sm">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-white">{user.displayName || 'Connected Account'}</div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            </div>

            {/* Master Sheet info */}
            {sheetInfo && (
              <div className="p-3.5 bg-slate-900/80 border border-cyan-900/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    <span>Active Master Ledger</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
                  </span>
                </div>
                <div className="text-sm font-bold text-white">{sheetInfo.name}</div>
                <div className="text-xs text-slate-400">Contains 3 formatted sheets: `Finances`, `Physical_Health`, `Mental_Health`.</div>

                <div className="pt-2 flex items-center gap-3">
                  <a
                    href={sheetInfo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors"
                  >
                    <span>Open in Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={onForceSync}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Force Re-sync</span>
                  </button>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg flex items-start gap-2.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Least Privilege Guarantee:</strong> This application only has permission to view and edit spreadsheets created by or explicitly opened with this applet. Your other personal Drive files remain untouched.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center py-3">
            <p className="text-xs text-slate-300">
              Sign in with your Google account to automatically create and synchronize your personal "Nexus Life Master Ledger" directly in your Google Drive.
            </p>

            {/* Official Google Sign-in Button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-md shadow-md border border-slate-300 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>

            <div className="pt-3 text-[11px] text-slate-500">
              You can also continue using sample data locally without signing in.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
