import React from 'react';
import { Trash2, RotateCcw, AlertOctagon, FileCode2, Folder } from 'lucide-react';
import { useIDE } from '../../context/IDEContext';
import { Modal } from '../common/Modal';
import { Button3D } from '../common/Button3D';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({ isOpen, onClose }) => {
  const { trash, restoreTrashItem, emptyTrash } = useIDE();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Trash Bin"
      subtitle={`${trash.length} item${trash.length === 1 ? '' : 's'} stored safely`}
      icon={<Trash2 size={18} className="text-red-400" />}
      maxWidth="lg"
      footer={
        <>
          {trash.length > 0 && (
            <Button3D
              variant="danger"
              size="sm"
              icon={<AlertOctagon size={14} />}
              onClick={() => {
                if (window.confirm('Permanently delete all items from trash? This cannot be undone.')) {
                  emptyTrash();
                }
              }}
            >
              Empty Trash Permanently
            </Button3D>
          )}
          <Button3D variant="surface" size="md" onClick={onClose}>
            Close
          </Button3D>
        </>
      }
    >
      {trash.length === 0 ? (
        <div className="py-12 text-center text-neutral-400 space-y-2">
          <Trash2 size={36} className="mx-auto text-neutral-600 mb-2 opacity-50" />
          <p className="font-medium text-neutral-300">Trash is empty</p>
          <p className="text-xs text-neutral-500">Deleted files and folders are moved here for safe recovery.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {trash.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.type === 'file' ? (
                  <FileCode2 size={16} className="text-blue-400 shrink-0" />
                ) : (
                  <Folder size={16} className="text-amber-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-200 truncate">{item.name}</p>
                  <p className="text-[11px] text-neutral-500">
                    Deleted {new Date(item.deletedAt).toLocaleTimeString()} · {item.type}
                  </p>
                </div>
              </div>

              <Button3D
                variant="surface"
                size="sm"
                icon={<RotateCcw size={13} className="text-emerald-400" />}
                onClick={() => restoreTrashItem(item.id)}
              >
                Restore
              </Button3D>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
