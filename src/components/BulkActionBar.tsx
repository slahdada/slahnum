import React from 'react';
import { Download, Trash2, X, CheckSquare } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onExportSelected: () => void;
  onDeleteSelected: () => void;
  itemLabel?: string;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onExportSelected,
  onDeleteSelected,
  itemLabel = 'éléments'
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[calc(100%-1.5rem)] sm:w-auto bg-zinc-900/95 text-white border border-zinc-700/80 rounded-2xl shadow-2xl p-2.5 sm:px-4 sm:py-2.5 backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4 duration-200">
      
      {/* Count & Select All */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-bold font-mono px-2 py-0.5 rounded-md bg-indigo-600 text-white">
          {selectedCount}
        </span>
        <span className="font-medium text-zinc-300 hidden xs:inline">
          {selectedCount > 1 ? `${itemLabel} sélectionnés` : `${itemLabel.replace(/s$/, '')} sélectionné`}
        </span>
        {selectedCount < totalCount && (
          <button
            type="button"
            onClick={onSelectAll}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-semibold ml-1"
          >
            Tout
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onExportSelected}
          className="min-h-[36px] px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-all shadow-xs"
          title="Exporter la sélection"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Exporter</span>
        </button>

        <button
          type="button"
          onClick={onDeleteSelected}
          className="min-h-[36px] px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition-all"
          title="Supprimer la sélection"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Supprimer</span>
        </button>

        <button
          type="button"
          onClick={onClearSelection}
          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-white rounded-lg transition-colors ml-1"
          title="Annuler la sélection"
          aria-label="Annuler"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
