import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface MapLightboxModalProps {
  isOpen: boolean;
  title: string;
  imageSrc: string;
  caption: string;
  onClose: () => void;
}

export const MapLightboxModal: React.FC<MapLightboxModalProps> = ({
  isOpen,
  title,
  imageSrc,
  caption,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Phóng to mặt bằng ${title}`}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-6xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#9A1B0E]">{title}</h3>
            <p className="text-xs text-slate-500">{caption}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng xem phóng to"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-100 overflow-auto flex items-center justify-center">
          <img
            src={imageSrc}
            alt={`Mặt bằng ${title}`}
            className="max-w-full h-auto rounded border border-slate-200 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
