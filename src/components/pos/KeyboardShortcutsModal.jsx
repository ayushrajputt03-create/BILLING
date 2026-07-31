import React from 'react';
import { Keyboard, X } from 'lucide-react';

export const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'F2', label: 'New Bill / Focus Barcode Search', desc: 'Clears active cart and focuses input for rapid scanning' },
    { key: 'F8', label: 'Collect Payment', desc: 'Opens payment modal to process cash, UPI, or card' },
    { key: 'Esc', label: 'Close / Cancel', desc: 'Closes any active modal dialog' },
    { key: 'Enter', label: 'Barcode Reader Input', desc: 'Auto-appends scanned barcode to bill' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">POS Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-xs text-white">{sc.label}</p>
                <p className="text-[10px] text-slate-400">{sc.desc}</p>
              </div>
              <span className="key-badge text-xs px-2 py-1">{sc.key}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
