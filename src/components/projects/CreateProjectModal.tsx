import React, { useState } from 'react';
import {
  Smartphone,
  Globe,
  Code2,
  Layers,
  FolderOpen,
  Layout,
  Upload,
  Figma,
  Check,
} from 'lucide-react';
import { useIDE } from '../../context/IDEContext';
import { Modal } from '../common/Modal';
import { Button3D } from '../common/Button3D';
import { ProjectType } from '../../types/project';
import { PROJECT_TEMPLATES } from '../../constants/templates';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { createProject, importProjectFromZip, addToast } = useIDE();
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<ProjectType>('android');
  const [packageName, setPackageName] = useState('com.codingide.app');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const projectTypeOptions: { type: ProjectType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      type: 'android',
      label: 'Android App',
      icon: <Smartphone size={18} className="text-emerald-400" />,
      desc: 'Jetpack Compose Material 3 & Kotlin DSL',
    },
    {
      type: 'web',
      label: 'Web App',
      icon: <Globe size={18} className="text-blue-400" />,
      desc: 'HTML5, CSS3 & modern JavaScript',
    },
    {
      type: 'react',
      label: 'React',
      icon: <Code2 size={18} className="text-sky-400" />,
      desc: 'React 19 with TypeScript components',
    },
    {
      type: 'flutter',
      label: 'Flutter',
      icon: <Layers size={18} className="text-cyan-400" />,
      desc: 'Dart native cross-platform structure',
    },
    {
      type: 'app_design',
      label: 'App Design',
      icon: <Layout size={18} className="text-purple-400" />,
      desc: 'Design tokens & UI wireframe schemas',
    },
    {
      type: 'html_css_js',
      label: 'HTML / CSS / JS',
      icon: <Globe size={18} className="text-amber-400" />,
      desc: 'Vanilla web development starter',
    },
    {
      type: 'figma',
      label: 'Figma Project',
      icon: <Figma size={18} className="text-pink-400" />,
      desc: 'Design token mapping foundation',
    },
    {
      type: 'empty',
      label: 'Empty Project',
      icon: <FolderOpen size={18} className="text-neutral-400" />,
      desc: 'Clean blank workspace with README',
    },
  ];

  const handleSelectType = (type: ProjectType) => {
    setSelectedType(type);
    const tmpl = PROJECT_TEMPLATES[type];
    if (tmpl) {
      setPackageName(tmpl.defaultPackage);
      if (!name) {
        setName(tmpl.name.replace(/[^a-zA-Z0-9]/g, ''));
      }
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject = createProject(name.trim(), selectedType, packageName);
    setName('');
    onCreated(newProject.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      subtitle="Select a project architecture template"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".zip"
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const newProj = await importProjectFromZip(file);
                    onCreated(newProj.id);
                    onClose();
                  } catch (err) {
                    // handled
                  }
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }
              }}
            />
            <Button3D
              type="button"
              variant="surface"
              size="md"
              icon={<Upload size={14} />}
              onClick={() => fileInputRef.current?.click()}
            >
              Import ZIP
            </Button3D>
          </div>

          <div className="flex items-center gap-2">
            <Button3D variant="surface" size="md" onClick={onClose}>
              Cancel
            </Button3D>
            <Button3D
              variant="primary"
              size="md"
              onClick={handleCreate}
              disabled={!name.trim()}
            >
              Create Project
            </Button3D>
          </div>
        </div>
      }
    >
      <form onSubmit={handleCreate} className="space-y-4">
        {/* Name input */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Project Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. MyMobileApp"
            autoFocus
            className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Package name (for Android) */}
        {selectedType === 'android' && (
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Package Name (Application ID)
            </label>
            <input
              type="text"
              value={packageName}
              onChange={e => setPackageName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        )}

        {/* Project Types Grid */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-2">
            Architecture Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {projectTypeOptions.map(opt => {
              const isSelected = selectedType === opt.type;
              return (
                <div
                  key={opt.type}
                  onClick={() => handleSelectType(opt.type)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 shrink-0">
                    {opt.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-neutral-100">{opt.label}</span>
                      {isSelected && <Check size={14} className="text-blue-400" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{opt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
};
