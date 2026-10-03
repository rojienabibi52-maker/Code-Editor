import React from 'react';
import { Info, FolderGit2, Calendar, FileText, Download, Share2 } from 'lucide-react';
import { Project } from '../../types/project';
import { Modal } from '../common/Modal';
import { Button3D } from '../common/Button3D';
import { useIDE } from '../../context/IDEContext';

interface ProjectInfoModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({ project, onClose }) => {
  const { exportProjectZip, exportProjectApk, shareProject } = useIDE();

  if (!project) return null;

  const fileCount = Object.keys(project.files).length;
  const folderCount = Object.keys(project.folders).length;

  return (
    <Modal
      isOpen={!!project}
      onClose={onClose}
      title="Project Details"
      subtitle={project.name}
      icon={<Info size={18} className="text-blue-400" />}
      maxWidth="md"
      footer={
        <>
          <Button3D
            variant="primary"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => exportProjectApk(project.id)}
            title="Generate APK directly into project files & download"
          >
            Download APK
          </Button3D>
          <Button3D
            variant="surface"
            size="sm"
            icon={<Download size={14} className="text-sky-400" />}
            onClick={() => exportProjectZip(project.id)}
          >
            Export ZIP
          </Button3D>
          <Button3D
            variant="surface"
            size="sm"
            icon={<Share2 size={14} />}
            onClick={() => shareProject(project.id)}
          >
            Share
          </Button3D>
          <Button3D variant="surface" size="sm" onClick={onClose}>
            Close
          </Button3D>
        </>
      }
    >
      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block mb-0.5">Project Type</span>
            <span className="font-semibold text-neutral-200 uppercase">{project.type}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block mb-0.5">Application ID</span>
            <span className="font-mono text-neutral-200 truncate block">
              {project.packageName || 'None'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block mb-0.5">Files Count</span>
            <span className="font-semibold text-blue-400">{fileCount} files</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block mb-0.5">Folders Count</span>
            <span className="font-semibold text-amber-400">{folderCount} folders</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span>Created:</span>
            <span className="text-neutral-200">{new Date(project.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-400">
            <span>Last Modified:</span>
            <span className="text-neutral-200">{new Date(project.modifiedAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-400">
            <span>Target SDK:</span>
            <span className="text-emerald-400 font-mono">API 34 (Android 14)</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
