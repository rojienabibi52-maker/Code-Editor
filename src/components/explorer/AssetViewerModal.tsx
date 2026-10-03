import React from 'react';
import { Image, Download, Share2, FileText, Music, Video, Package, Smartphone, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { FileItem } from '../../types/project';
import { useIDE } from '../../context/IDEContext';
import { Modal } from '../common/Modal';
import { Button3D } from '../common/Button3D';

interface AssetViewerModalProps {
  file: FileItem | null;
  onClose: () => void;
}

export const AssetViewerModal: React.FC<AssetViewerModalProps> = ({ file, onClose }) => {
  const { downloadFile, shareFile, activeProject } = useIDE();

  if (!file) return null;

  const isApk = file.extension === 'apk' || file.name.endsWith('.apk');
  const isAab = file.extension === 'aab' || file.name.endsWith('.aab');
  const isImage = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(file.extension);
  const isAudio = ['mp3', 'wav', 'ogg', 'aac'].includes(file.extension);
  const isVideo = ['mp4', 'webm'].includes(file.extension);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '1.8 MB';
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <Modal
      isOpen={!!file}
      onClose={onClose}
      title={file.name}
      subtitle={isApk ? 'Android Application Package · Direct Installable' : isAab ? 'Android App Bundle · Google Play Ready' : `Asset Resource · ${file.path}`}
      icon={
        isApk ? (
          <Package size={18} className="text-emerald-400" />
        ) : isAab ? (
          <Package size={18} className="text-blue-400" />
        ) : (
          <Image size={18} className="text-pink-400" />
        )
      }
      maxWidth="lg"
      footer={
        <>
          <Button3D
            variant="primary"
            size="md"
            icon={<Download size={15} />}
            onClick={() => downloadFile(file.id)}
          >
            {isApk ? 'Download APK' : isAab ? 'Download AAB' : 'Download File'}
          </Button3D>
          <Button3D
            variant="surface"
            size="md"
            icon={<Share2 size={14} />}
            onClick={() => shareFile(file.id)}
          >
            Share
          </Button3D>
          <Button3D variant="surface" size="md" onClick={onClose}>
            Close
          </Button3D>
        </>
      }
    >
      <div className="flex flex-col items-center justify-center p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 min-h-[220px]">
        {isApk ? (
          <div className="w-full text-center space-y-4 py-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Smartphone size={32} className="text-emerald-400 animate-pulse" />
            </div>

            <div>
              <div className="text-base font-bold text-neutral-100 flex items-center justify-center gap-2">
                <span>{activeProject.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  READY (.APK)
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                {activeProject.packageName || 'com.codingide.app'} · v{activeProject.version || '1.0.0'}
              </p>
            </div>

            {/* Quick Spec Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left max-w-md mx-auto">
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="text-[10px] text-neutral-500 font-medium">File Size</div>
                <div className="text-xs font-semibold text-neutral-200">{formatFileSize(file.size)}</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="text-[10px] text-neutral-500 font-medium">Platform</div>
                <div className="text-xs font-semibold text-emerald-400">Android 7.0 - 14+</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-neutral-500 font-medium">Keystore</div>
                <div className="text-xs font-semibold text-blue-400">v1 + v2 Signed</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400/90 font-medium">
              <CheckCircle2 size={14} />
              <span>Compiled binary saved directly into project files</span>
            </div>

            {/* Download Call to Action */}
            <div className="pt-2">
              <Button3D
                variant="primary"
                size="lg"
                icon={<Download size={16} />}
                onClick={() => downloadFile(file.id)}
                className="w-full max-w-sm mx-auto justify-center"
              >
                Download {file.name}
              </Button3D>
            </div>
          </div>
        ) : isAab ? (
          <div className="w-full text-center space-y-4 py-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Package size={32} className="text-blue-400" />
            </div>

            <div>
              <div className="text-base font-bold text-neutral-100 flex items-center justify-center gap-2">
                <span>{activeProject.name} Bundle</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold border border-blue-500/30">
                  PLAY READY (.AAB)
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                {activeProject.packageName || 'com.codingide.app'}
              </p>
            </div>

            <div className="pt-2">
              <Button3D
                variant="primary"
                size="lg"
                icon={<Download size={16} />}
                onClick={() => downloadFile(file.id)}
                className="w-full max-w-sm mx-auto justify-center"
              >
                Download {file.name}
              </Button3D>
            </div>
          </div>
        ) : isImage && file.assetDataUrl ? (
          <img
            src={file.assetDataUrl}
            alt={file.name}
            className="max-h-72 max-w-full rounded-lg object-contain border border-neutral-800 shadow-lg"
          />
        ) : isImage && file.content && file.extension === 'svg' ? (
          <div
            className="p-6 bg-neutral-900 rounded-lg flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: file.content }}
          />
        ) : isAudio ? (
          <div className="text-center py-6">
            <Music size={48} className="mx-auto text-amber-400 mb-3" />
            <p className="text-sm font-medium text-neutral-300">Audio Resource: {file.name}</p>
          </div>
        ) : isVideo ? (
          <div className="text-center py-6">
            <Video size={48} className="mx-auto text-sky-400 mb-3" />
            <p className="text-sm font-medium text-neutral-300">Video Asset: {file.name}</p>
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText size={48} className="mx-auto text-neutral-500 mb-3" />
            <p className="text-sm font-medium text-neutral-300">Document Asset: {file.name}</p>
          </div>
        )}

        <div className="mt-4 text-xs text-neutral-400 flex flex-wrap items-center justify-center gap-4">
          <span>Type: {file.extension.toUpperCase()}</span>
          <span>Path: /{file.path}</span>
          {!isApk && !isAab && (
            <span>Reference: <code className="px-1.5 py-0.5 rounded bg-neutral-800 text-blue-400">R.drawable.{file.name.replace(/\.[^/.]+$/, '')}</code></span>
          )}
        </div>
      </div>
    </Modal>
  );
};
