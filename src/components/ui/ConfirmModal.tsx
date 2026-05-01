import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", isDestructive = true }: ConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 ${isDestructive ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-yellow-500 to-yellow-600'}`}></div>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${isDestructive ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
            <AlertTriangle className={`w-5 h-5 ${isDestructive ? 'text-red-500' : 'text-yellow-500'}`} />
          </div>
          <h3 className="text-xl font-bold text-zinc-100">{title}</h3>
        </div>
        <p className="text-zinc-400 mb-8 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 rounded-xl text-zinc-300 hover:bg-zinc-800 font-medium transition-colors border border-transparent hover:border-zinc-700"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`px-5 py-2 rounded-xl text-white font-bold transition-colors shadow-lg shadow-black/20 ${isDestructive ? 'bg-red-600 hover:bg-red-500' : 'bg-yellow-600 hover:bg-yellow-500'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
