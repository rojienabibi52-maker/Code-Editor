import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button3D } from './Button3D';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  itemType?: 'file' | 'folder' | 'project';
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  destructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  itemName,
  itemType = 'file',
  onConfirm,
  onCancel,
  confirmLabel = 'Move to Trash',
  destructive = true,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      icon={<AlertTriangle size={20} className="text-amber-400" />}
      maxWidth="sm"
      footer={
        <>
          <Button3D variant="surface" size="md" onClick={onCancel}>
            Cancel
          </Button3D>
          <Button3D
            variant={destructive ? 'danger' : 'primary'}
            size="md"
            icon={<Trash2 size={16} />}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmLabel}
          </Button3D>
        </>
      }
    >
      <div className="space-y-3 py-1">
        <p className="text-neutral-300">
          Are you sure you want to delete <span className="font-semibold text-white underline decoration-red-500/50">{itemName}</span>?
        </p>
        <p className="text-xs text-neutral-400 bg-neutral-950/70 p-3 rounded-lg border border-neutral-800">
          This {itemType} will be moved to Trash. You can restore it anytime or recover unsaved items.
        </p>
      </div>
    </Modal>
  );
};
