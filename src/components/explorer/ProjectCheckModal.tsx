import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCw,
  Wrench,
  FileText,
  Layers,
  Box,
} from 'lucide-react';
import { useIDE } from '../../context/IDEContext';
import { Modal } from '../common/Modal';
import { Button3D } from '../common/Button3D';
import { ProjectCheckSummary } from '../../services/projectChecker';

interface ProjectCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBuildStudio?: () => void;
}

export const ProjectCheckModal: React.FC<ProjectCheckModalProps> = ({
  isOpen,
  onClose,
  onOpenBuildStudio,
}) => {
  const { runProjectCheck, activeProject } = useIDE();
  const [summary, setSummary] = useState<ProjectCheckSummary | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'errors' | 'warnings'>('all');

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = runProjectCheck();
      setSummary(res);
      setIsScanning(false);
    }, 400);
  };

  useEffect(() => {
    if (isOpen) {
      handleScan();
    }
  }, [isOpen, activeProject.id]);

  const filteredItems = summary
    ? summary.items.filter(item => {
        if (filter === 'errors') return !item.passed && item.critical;
        if (filter === 'warnings') return !item.passed && !item.critical;
        return true;
      })
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Code & Validation Check"
      subtitle={`${activeProject.name} · 25-Point Android Architecture Analysis`}
      icon={<ShieldCheck size={18} className="text-blue-400" />}
      maxWidth="xl"
      footer={
        <>
          <Button3D
            variant="surface"
            size="md"
            icon={<RotateCw size={14} className={isScanning ? 'animate-spin' : ''} />}
            onClick={handleScan}
          >
            Re-scan Project
          </Button3D>
          {onOpenBuildStudio && summary?.canBuild && (
            <Button3D
              variant="primary"
              size="md"
              icon={<Box size={14} />}
              onClick={() => {
                onClose();
                onOpenBuildStudio();
              }}
            >
              Open Build Studio
            </Button3D>
          )}
          <Button3D variant="surface" size="md" onClick={onClose}>
            Close
          </Button3D>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Metric Cards Banner (Section 8) */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block mb-0.5">Files Checked</span>
              <span className="text-base font-bold text-neutral-100 font-mono">
                {summary.filesChecked}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block mb-0.5">Resources Checked</span>
              <span className="text-base font-bold text-neutral-100 font-mono">
                {summary.resourcesChecked}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block mb-0.5">Errors</span>
              <span
                className={`text-base font-bold font-mono ${
                  summary.errorsCount > 0 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {summary.errorsCount}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block mb-0.5">Warnings</span>
              <span
                className={`text-base font-bold font-mono ${
                  summary.warningsCount > 0 ? 'text-amber-400' : 'text-neutral-400'
                }`}
              >
                {summary.warningsCount}
              </span>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-neutral-800 text-blue-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Checks ({summary?.items.length || 0})
          </button>
          <button
            onClick={() => setFilter('errors')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'errors'
                ? 'bg-neutral-800 text-red-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Errors ({summary?.errorsCount || 0})
          </button>
          <button
            onClick={() => setFilter('warnings')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'warnings'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Warnings ({summary?.warningsCount || 0})
          </button>
        </div>

        {/* Checks List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                !item.passed && item.critical
                  ? 'bg-red-500/10 border-red-500/30'
                  : !item.passed && !item.critical
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-neutral-950/70 border-neutral-800/80'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {item.passed ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : item.critical ? (
                  <AlertCircle size={16} className="text-red-400" />
                ) : (
                  <AlertTriangle size={16} className="text-amber-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-200">{item.title}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
