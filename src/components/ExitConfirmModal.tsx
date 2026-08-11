import React from 'react';
import { soundFx } from '../utils/sound';
import { LogOut, X, ShieldAlert } from 'lucide-react';

interface ExitConfirmModalProps {
  onConfirmExit: () => void;
  onClose: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({ onConfirmExit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none pb-[env(safe-area-inset-bottom,16px)] pt-[env(safe-area-inset-top,16px)]">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-6 text-center relative overflow-hidden">
        {/* Top glow */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-rose-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
          <LogOut className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">QUIT GAME?</h2>
          <p className="text-xs text-slate-400">
            Are you sure you want to exit Galaxy Defender? Progress is automatically saved.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => {
              soundFx.playExplosion(false);
              onConfirmExit();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-rose-950 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>YES, EXIT GAME</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 active:scale-95 transition-all"
          >
            CANCEL / STAY
          </button>
        </div>
      </div>
    </div>
  );
};
