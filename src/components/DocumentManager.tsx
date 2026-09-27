import React, { useState, useRef } from 'react';
import { AttachedFile } from '../types';
import { fileToAttachedFile, formatFileSize, downloadDataUrl } from '../utils/fileHelpers';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  RefreshCw, 
  Paperclip, 
  CheckCircle2, 
  FileCheck 
} from 'lucide-react';

interface DocumentManagerProps {
  documents: AttachedFile[];
  onAddDocument: (doc: AttachedFile) => void;
  onRemoveDocument: (docId: string) => void;
  onReplaceDocument?: (docId: string, newDoc: AttachedFile) => void;
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
  title?: string;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents = [],
  onAddDocument,
  onRemoveDocument,
  onReplaceDocument,
  onNotify,
  title = 'Documents & Fichiers Associés'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [replaceDocId, setReplaceDocId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File, isReplace = false) => {
    try {
      setIsUploading(true);
      setUploadProgress(25);

      // Progress animation
      setTimeout(() => setUploadProgress(70), 120);

      const attached = await fileToAttachedFile(file);

      setTimeout(() => {
        setUploadProgress(100);
        if (isReplace && replaceDocId && onReplaceDocument) {
          onReplaceDocument(replaceDocId, attached);
          onNotify?.(`Fichier remplacé avec succès (${attached.name})`, 'success');
          setReplaceDocId(null);
        } else {
          onAddDocument(attached);
          onNotify?.(`Fichier chargé avec succès : ${attached.name}`, 'success');
        }
        setIsUploading(false);
        setUploadProgress(0);
      }, 250);
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      onNotify?.('Erreur lors du chargement du fichier', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file, false);
      e.target.value = '';
    }
  };

  const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && replaceDocId) {
      handleProcessFile(file, true);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file, false);
    }
  };

  const handleDownload = (doc: AttachedFile) => {
    downloadDataUrl(doc.dataUrl, doc.name);
    onNotify?.(`Téléchargement lancé : ${doc.name}`, 'info');
  };

  const triggerReplace = (docId: string) => {
    setReplaceDocId(docId);
    replaceInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
          <span>{title} ({documents.length})</span>
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
        >
          <Upload className="w-3 h-3" />
          <span>Ajouter un fichier</span>
        </button>
      </div>

      {/* Hidden Native File Inputs (triggers Android native picker or OS dialog) */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        onChange={handleReplaceChange}
        className="hidden"
      />

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
            : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-950/40'
        }`}
      >
        {isUploading ? (
          <div className="space-y-2 py-1">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Chargement du fichier en cours ({uploadProgress}%)...</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-zinc-500 dark:text-zinc-400">
            <Upload className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mb-0.5" />
            <p className="text-xs font-medium">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Cliquez pour choisir</span> ou glissez un fichier ici
            </p>
            <p className="text-[10px] text-zinc-400">
              Tout format accepté (PDF, Image, Markdown, TXT, Code, etc.)
            </p>
          </div>
        )}
      </div>

      {/* Attached Files List */}
      {documents.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {doc.name}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {formatFileSize(doc.size)}
                  </p>
                </div>
              </div>

              {/* Actions on file: Télécharger, Remplacer, Supprimer */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="min-w-[34px] min-h-[34px] p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                  title="Télécharger le fichier"
                  aria-label="Télécharger"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {onReplaceDocument && (
                  <button
                    type="button"
                    onClick={() => triggerReplace(doc.id)}
                    className="min-w-[34px] min-h-[34px] p-1.5 rounded-lg text-zinc-500 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                    title="Remplacer par un autre fichier"
                    aria-label="Remplacer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onRemoveDocument(doc.id);
                    onNotify?.(`Fichier retiré : ${doc.name}`, 'info');
                  }}
                  className="min-w-[34px] min-h-[34px] p-1.5 rounded-lg text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                  title="Supprimer ce fichier"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
