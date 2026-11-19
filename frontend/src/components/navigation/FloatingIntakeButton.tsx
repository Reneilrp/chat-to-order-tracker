import React from 'react';
import { ClipboardPaste } from 'lucide-react';

interface FloatingIntakeButtonProps {
  onOpen: () => void;
}

export const FloatingIntakeButton: React.FC<FloatingIntakeButtonProps> = ({ onOpen }) => {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4 pointer-events-none flex justify-center">
      <button
        type="button"
        onClick={onOpen}
        className="pointer-events-auto min-h-[52px] px-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-sm shadow-xl shadow-orange-950/20 border border-amber-300 flex items-center gap-2.5 active:scale-95 transition"
      >
        <ClipboardPaste className="w-5 h-5 stroke-[2.5]" />
        <span>+ Paste Chat / Order</span>
      </button>
    </div>
  );
};
