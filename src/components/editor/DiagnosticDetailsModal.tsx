import React from 'react';
import { AlertCircle, AlertTriangle, Info, Wrench, Check, X } from 'lucide-react';
import { DiagnosticItem } from '../../types/editor';
import { Modal } from '../common/Modal';
import { Button3D } from '../common/Button3D';

interface DiagnosticDetailsModalProps {
  diagnostic: DiagnosticItem | null;
  onClose: () => void;
  onApplyFix: (diag: DiagnosticItem) => void;
}

export const DiagnosticDetailsModal: React.FC<DiagnosticDetailsModalProps> = ({
  diagnostic,
  onClose,
  onApplyFix,
}) => {
  if (!diagnostic) return null;

  const isError = diagnostic.severity === 'error';
  const isWarn = diagnostic.severity === 'warning';

  return (
    <Modal
      isOpen={!!diagnostic}
      onClose={onClose}
      title="Code Diagnostic Details"
      subtitle={`Line ${diagnostic.line}, Column ${diagnostic.column}`}
      icon={
        isError ? (
          <AlertCircle size={18} className="text-red-400" />
        ) : isWarn ? (
          <AlertTriangle size={18} className="text-amber-400" />
        ) : (
          <Info size={18} className="text-blue-400" />
        )
      }
      maxWidth="md"
      footer={
        <>
          <Button3D variant="surface" size="md" onClick={onClose}>
            Dismiss
          </Button3D>
          {diagnostic.suggestedFix && (
            <Button3D
              variant="primary"
              size="md"
              icon={<Wrench size={14} />}
              onClick={() => {
                onApplyFix(diagnostic);
                onClose();
              }}
            >
              Apply Quick Fix
            </Button3D>
          )}
        </>
      }
    >
      <div className="space-y-3.5 text-xs">
        {/* What happened */}
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
          <span className="font-semibold text-neutral-400 text-[11px] block uppercase tracking-wider">
            What Happened
          </span>
          <p className="text-sm font-medium text-neutral-100">{diagnostic.message}</p>
        </div>

        {/* Why it happened */}
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
          <span className="font-semibold text-neutral-400 text-[11px] block uppercase tracking-wider">
            Why It Happened
          </span>
          <p className="text-neutral-300 leading-relaxed">{diagnostic.explanation}</p>
        </div>

        {/* Possible solution / Quick fix */}
        {diagnostic.suggestedFix && (
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
            <span className="font-semibold text-blue-300 text-[11px] block uppercase tracking-wider">
              Possible Solution / Quick Fix
            </span>
            <p className="text-blue-200 font-mono text-xs">{diagnostic.suggestedFix}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
