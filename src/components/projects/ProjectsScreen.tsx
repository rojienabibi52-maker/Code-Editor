import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  FolderGit2,
  MoreVertical,
  Edit,
  Edit3,
  Download,
  Share2,
  Copy,
  Info,
  Trash2,
  Smartphone,
  Globe,
  Code2,
  Layers,
  Upload,
  Settings,
  Package,
} from 'lucide-react';
import { useIDE } from '../../context/IDEContext';
import { Project, ProjectType } from '../../types/project';
import { Button3D } from '../common/Button3D';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ProjectInfoModal } from './ProjectInfoModal';

type SortOption = 'recent_edited' | 'recent_created' | 'name_asc' | 'name_desc';

interface ProjectsScreenProps {
  onOpenProject: (projectId: string) => void;
  onOpenCreateModal: () => void;
  onOpenAppConfig?: (projectId: string) => void;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
  onOpenProject,
  onOpenCreateModal,
  onOpenAppConfig,
}) => {
  const {
    projects,
    activeProject,
    deleteProject,
    duplicateProject,
    renameProject,
    exportProjectZip,
    exportProjectApk,
    exportProjectAab,
    shareProject,
    importProjectFromZip,
    themeColors,
    addToast,
  } = useIDE();

  const zipInputRef = React.useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent_edited');
  const [filterType, setFilterType] = useState<string>('all');

  // Active Menu Project ID
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);

  // Info Modal Project
  const [infoProject, setInfoProject] = useState<Project | null>(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  // Rename Dialog State
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [renameName, setRenameName] = useState('');

  // Project List Processing
  const filteredProjects = useMemo(() => {
    let list = Object.values(projects);

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filterType !== 'all') {
      list = list.filter(p => p.type === filterType);
    }

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'recent_edited') return b.modifiedAt - a.modifiedAt;
      if (sortBy === 'recent_created') return b.createdAt - a.createdAt;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      return 0;
    });
  }, [projects, search, filterType, sortBy]);

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'android', label: 'Android' },
    { id: 'web', label: 'Web' },
    { id: 'react', label: 'React' },
    { id: 'flutter', label: 'Flutter' },
    { id: 'app_design', label: 'App Design' },
    { id: 'figma', label: 'Figma' },
    { id: 'empty', label: 'Empty' },
  ];

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 select-none"
      style={{ backgroundColor: themeColors.background }}
    >
      {/* Top Header */}
      <div className="max-w-5xl mx-auto w-full space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
              <FolderGit2 className="text-blue-500" size={24} />
              Projects
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Manage, export, and configure mobile and web workspaces
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={zipInputRef}
              accept=".zip"
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const newProj = await importProjectFromZip(file);
                    onOpenProject(newProj.id);
                  } catch (err) {
                    // toast already shown
                  }
                  if (zipInputRef.current) zipInputRef.current.value = '';
                }
              }}
            />

            <Button3D
              variant="surface"
              size="md"
              icon={<Upload size={15} />}
              onClick={() => zipInputRef.current?.click()}
            >
              Import Project (ZIP)
            </Button3D>

            {activeProject && (
              <Button3D
                variant="surface"
                size="md"
                icon={<Download size={15} className="text-emerald-400" />}
                onClick={() => exportProjectApk(activeProject.id)}
                title="Generate APK into project files & download"
              >
                Export APK
              </Button3D>
            )}

            <Button3D
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
              onClick={onOpenCreateModal}
            >
              Create Project
            </Button3D>
          </div>
        </div>

        {/* Search, Sort & Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-3 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700/80 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700/80 text-xs text-neutral-300">
              <ArrowUpDown size={13} className="text-neutral-500" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                aria-label="Sort projects"
                className="bg-transparent text-xs text-neutral-200 focus:outline-none cursor-pointer"
              >
                <option value="recent_edited" className="bg-neutral-900">Recently Edited</option>
                <option value="recent_created" className="bg-neutral-900">Recently Created</option>
                <option value="name_asc" className="bg-neutral-900">Name A-Z</option>
                <option value="name_desc" className="bg-neutral-900">Name Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {filterOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilterType(opt.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all shrink-0 font-medium ${
                filterType === opt.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Projects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {filteredProjects.map(project => {
            const isActive = activeProject?.id === project.id;
            const fileCount = Object.keys(project.files).length;

            return (
              <div
                key={project.id}
                className={`group relative p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between ${
                  isActive
                    ? 'bg-neutral-900 border-blue-500 shadow-lg shadow-blue-500/10'
                    : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-800/40 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                        {project.type === 'android' ? (
                          <Smartphone size={18} />
                        ) : project.type === 'web' ? (
                          <Globe size={18} />
                        ) : (
                          <Code2 size={18} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-neutral-100 truncate">
                            {project.name}
                          </h3>
                          {isActive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 truncate">
                          {project.packageName || project.type}
                        </p>
                      </div>
                    </div>

                    {/* Three-dot menu toggle */}
                    <div className="relative">
                      <button
                        onClick={() => setMenuProjectId(menuProjectId === project.id ? null : project.id)}
                        className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                        title="Project Options"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {menuProjectId === project.id && (
                        <div
                          className="absolute right-0 top-8 w-44 py-1 rounded-xl bg-neutral-950 border border-neutral-700 shadow-2xl z-30 text-xs space-y-0.5"
                          style={{
                            boxShadow: '0 15px 30px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)',
                          }}
                        >
                          <button
                            onClick={() => {
                              onOpenProject(project.id);
                              setMenuProjectId(null);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-neutral-200 hover:bg-neutral-800"
                          >
                            <Edit size={13} className="text-blue-400" />
                            Open in Editor
                          </button>

                          {onOpenAppConfig && project.type === 'android' && (
                            <button
                              onClick={() => {
                                onOpenAppConfig(project.id);
                                setMenuProjectId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-neutral-200 hover:bg-neutral-800"
                            >
                              <Settings size={13} className="text-emerald-400" />
                              ⚙️ App Configuration
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setRenameTarget(project);
                              setRenameName(project.name);
                              setMenuProjectId(null);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-neutral-200 hover:bg-neutral-800"
                          >
                            <Edit3 size={13} className="text-amber-400" />
                            Rename
                          </button>

                          <button
                            onClick={() => {
                              exportProjectApk(project.id);
                              setMenuProjectId(null);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-neutral-200 hover:bg-neutral-800"
                          >
                            <Download size={13} className="text-emerald-400" />
                            Export / Download APK
                          </button>

                          <button
                            onClick={() => {
                              exportProjectAab(project.id);
                              setMenuProjectId(null);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-neutral-200 hover:bg-neutral-800"
                          >
                            <Package size={13} className="text-blue-400" />
                            Export / Download AAB
                          </button>

                          <button
                            onClick={() => {
                              exportProjectZip(project.id);
                              setMenuProjectId(null);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-neutral-200 hover:bg-neutral-800"
                          >
                            <Download size={13} className="text-sky-400" />
                            Export ZIP
                          </button>

                          <button
                            onClick={() => {
                              shareProject(project.id);
                              setMenuProjectId(null);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-neutral-200 hover:bg-neutral-800"
                          >
                            <Share2 size={13} className="text-purple-400" />
                            Share
                          </button>

                          <button
                            onClick={() => {
                              duplicateProject(project.id);
                              setMenuProjectId(null);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-neutral-200 hover:bg-neutral-800"
                          >
                            <Copy size={13} className="text-neutral-400" />
                            Duplicate
                          </button>

                          <button
                            onClick={() => {
                              setInfoProject(project);
                              setMenuProjectId(null);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-neutral-200 hover:bg-neutral-800"
                          >
                            <Info size={13} className="text-cyan-400" />
                            Project Info
                          </button>

                          <div className="border-t border-neutral-800 my-1" />

                          <button
                            onClick={() => {
                              setDeleteTarget(project);
                              setMenuProjectId(null);
                            }}
                            className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-red-400 hover:bg-red-500/20 font-medium"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 mt-3 line-clamp-2">
                    {project.description || `Configured as a ${project.type} workspace in CODING IDE.`}
                  </p>
                </div>

                {/* Footer metadata & Open button */}
                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>{fileCount} files</span>
                  <div className="flex items-center gap-2">
                    <span>{new Date(project.modifiedAt).toLocaleDateString()}</span>
                    <Button3D
                      variant={isActive ? 'primary' : 'surface'}
                      size="sm"
                      onClick={() => onOpenProject(project.id)}
                    >
                      {isActive ? 'Active' : 'Open'}
                    </Button3D>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-16 text-neutral-400 space-y-3">
            <FolderGit2 size={40} className="mx-auto text-neutral-600 opacity-60" />
            <p className="text-sm font-medium">No matching projects found</p>
            <Button3D variant="surface" size="md" onClick={() => setSearch('')}>
              Clear Search
            </Button3D>
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm p-5 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl space-y-4">
            <h3 className="text-sm font-semibold text-neutral-100">Rename Project</h3>
            <input
              type="text"
              value={renameName}
              onChange={e => setRenameName(e.target.value)}
              autoFocus
              className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
            />
            <div className="flex items-center justify-end gap-2">
              <Button3D variant="surface" size="sm" onClick={() => setRenameTarget(null)}>
                Cancel
              </Button3D>
              <Button3D
                variant="primary"
                size="sm"
                onClick={() => {
                  if (renameName.trim()) {
                    renameProject(renameTarget.id, renameName);
                    setRenameTarget(null);
                  }
                }}
              >
                Save
              </Button3D>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Project"
          itemName={deleteTarget.name}
          itemType="project"
          onConfirm={() => deleteProject(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Project Info Modal */}
      <ProjectInfoModal project={infoProject} onClose={() => setInfoProject(null)} />
    </div>
  );
};
