import React, { useState } from 'react';
import { IDEProvider, useIDE } from './context/IDEContext';
import { TopBar } from './components/navigation/TopBar';
import { BottomNav } from './components/navigation/BottomNav';
import { ProjectExplorer } from './components/explorer/ProjectExplorer';
import { CodeEditor } from './components/editor/CodeEditor';
import { PreviewHost } from './components/preview/PreviewHost';
import { ProjectsScreen } from './components/projects/ProjectsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { CreateProjectModal } from './components/projects/CreateProjectModal';
import { BuildStudioModal } from './components/build/BuildStudioModal';
import { ProjectCheckModal } from './components/explorer/ProjectCheckModal';
import { ToastContainer } from './components/common/Toast';
import { X } from 'lucide-react';

function IDEApp() {
  const {
    settings,
    themeColors,
    toasts,
    dismissToast,
    openProject,
    activeFile,
  } = useIDE();

  const [activeMainTab, setActiveMainTab] = useState<'home' | 'projects' | 'create' | 'editor' | 'settings'>('editor');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBuildStudio, setShowBuildStudio] = useState(false);
  const [buildStudioInitialTab, setBuildStudioInitialTab] = useState<'config' | 'build' | 'precheck' | 'history' | 'summary' | 'delete'>('config');
  const [showProjectCheck, setShowProjectCheck] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleOpenBuildStudio = (tab: 'config' | 'build' | 'precheck' | 'history' | 'summary' | 'delete' = 'build') => {
    setBuildStudioInitialTab(tab);
    setShowBuildStudio(true);
  };

  const handleOpenAppConfig = (projectId?: string) => {
    if (projectId) {
      openProject(projectId);
    }
    setBuildStudioInitialTab('config');
    setShowBuildStudio(true);
  };

  const handleSelectFileFromExplorer = (fileId: string) => {
    setActiveMainTab('editor');
    setMobileDrawerOpen(false);
  };

  const handleOpenProjectFromList = (projectId: string) => {
    openProject(projectId);
    setActiveMainTab('editor');
  };

  const workspaceMode = settings.workspaceMode || 'code-preview';

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden text-neutral-100 font-sans transition-colors duration-150 select-none"
      style={{
        backgroundColor: themeColors.background,
        color: themeColors.text,
      }}
    >
      {/* 1. Global Top Bar */}
      <TopBar
        onOpenBuildStudio={() => handleOpenBuildStudio('build')}
        onOpenAppConfig={() => handleOpenAppConfig()}
        onOpenProjectCheck={() => setShowProjectCheck(true)}
        onToggleExplorerDrawer={() => setMobileDrawerOpen(!mobileDrawerOpen)}
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
      />

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* DESKTOP VIEW (>= 1024px) */}
        <div className="hidden lg:flex w-full h-full">
          {/* Left Column: Project Explorer */}
          <div className="w-72 shrink-0 h-full">
            <ProjectExplorer
              onSelectFileToEdit={handleSelectFileFromExplorer}
              onOpenAppConfig={() => handleOpenAppConfig()}
            />
          </div>

          {/* Center Column: Active Main Tab (Editor, Projects, Settings) */}
          <div className="flex-1 flex h-full overflow-hidden">
            {activeMainTab === 'projects' ? (
              <ProjectsScreen
                onOpenProject={handleOpenProjectFromList}
                onOpenCreateModal={() => setShowCreateModal(true)}
                onOpenAppConfig={handleOpenAppConfig}
              />
            ) : activeMainTab === 'settings' ? (
              <SettingsScreen />
            ) : (
              <div className="flex-1 flex h-full overflow-hidden">
                {/* Code Only Mode */}
                {workspaceMode === 'code-only' && (
                  <div className="flex-1 flex h-full overflow-hidden">
                    <CodeEditor onNewFileClick={() => {}} />
                  </div>
                )}

                {/* Preview Only Mode */}
                {workspaceMode === 'preview-only' && (
                  <div className="flex-1 flex h-full overflow-hidden">
                    <PreviewHost />
                  </div>
                )}

                {/* Split Mode (Code + Preview) */}
                {workspaceMode === 'code-preview' && (
                  <>
                    <div className="flex-1 flex h-full overflow-hidden">
                      <CodeEditor onNewFileClick={() => {}} />
                    </div>
                    <div className="w-[420px] xl:w-[480px] shrink-0 h-full">
                      <PreviewHost />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* TABLET VIEW (768px - 1023px) */}
        <div className="hidden md:flex lg:hidden w-full h-full">
          {activeMainTab === 'projects' ? (
            <ProjectsScreen
              onOpenProject={handleOpenProjectFromList}
              onOpenCreateModal={() => setShowCreateModal(true)}
              onOpenAppConfig={handleOpenAppConfig}
            />
          ) : activeMainTab === 'settings' ? (
            <SettingsScreen />
          ) : activeMainTab === 'home' ? (
            <div className="w-full h-full">
              <ProjectExplorer
                onSelectFileToEdit={handleSelectFileFromExplorer}
                onOpenAppConfig={() => handleOpenAppConfig()}
              />
            </div>
          ) : (
            <div className="flex-1 flex h-full overflow-hidden">
              {/* Explorer visible on side */}
              <div className="w-64 shrink-0 h-full">
                <ProjectExplorer
                  onSelectFileToEdit={handleSelectFileFromExplorer}
                  onOpenAppConfig={() => handleOpenAppConfig()}
                />
              </div>
              {/* Editor or Preview based on split */}
              <div className="flex-1 flex h-full overflow-hidden">
                {settings.phoneSubTab === 'preview' || workspaceMode === 'preview-only' ? (
                  <PreviewHost />
                ) : (
                  <CodeEditor onNewFileClick={() => {}} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* PHONE MOBILE VIEW (< 768px) */}
        <div className="flex md:hidden w-full h-full relative overflow-hidden">
          {activeMainTab === 'home' && (
            <div className="w-full h-full">
              <ProjectExplorer
                onSelectFileToEdit={handleSelectFileFromExplorer}
                onOpenAppConfig={() => handleOpenAppConfig()}
              />
            </div>
          )}

          {activeMainTab === 'projects' && (
            <ProjectsScreen
              onOpenProject={handleOpenProjectFromList}
              onOpenCreateModal={() => setShowCreateModal(true)}
              onOpenAppConfig={handleOpenAppConfig}
            />
          )}

          {activeMainTab === 'settings' && <SettingsScreen />}

          {activeMainTab === 'editor' && (
            <div className="w-full h-full flex flex-col overflow-hidden">
              {settings.phoneSubTab === 'preview' || workspaceMode === 'preview-only' ? (
                <PreviewHost />
              ) : (
                <CodeEditor
                  onBackToExplorer={() => setActiveMainTab('home')}
                  onNewFileClick={() => setActiveMainTab('home')}
                />
              )}
            </div>
          )}

          {/* Mobile Explorer Drawer Overlay */}
          {mobileDrawerOpen && (
            <div className="absolute inset-0 z-40 flex">
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-xs"
                onClick={() => setMobileDrawerOpen(false)}
              />
              <div
                className="relative w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200"
                style={{ backgroundColor: themeColors.surface }}
              >
                <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: themeColors.border }}>
                  <span className="font-bold text-xs uppercase tracking-wider text-neutral-300">
                    Project Drawer
                  </span>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded-md text-neutral-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ProjectExplorer
                    onSelectFileToEdit={handleSelectFileFromExplorer}
                    onOpenAppConfig={() => handleOpenAppConfig()}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. Mobile Bottom Navigation (< 768px) */}
      <BottomNav
        activeTab={activeMainTab}
        onChangeTab={tab => setActiveMainTab(tab)}
        onOpenCreateModal={() => setShowCreateModal(true)}
      />

      {/* 4. Modals */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => setActiveMainTab('editor')}
      />

      <BuildStudioModal
        isOpen={showBuildStudio}
        initialTab={buildStudioInitialTab}
        onClose={() => setShowBuildStudio(false)}
      />

      <ProjectCheckModal
        isOpen={showProjectCheck}
        onClose={() => setShowProjectCheck(false)}
        onOpenBuildStudio={() => handleOpenBuildStudio('build')}
      />

      {/* 5. Tactile Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <IDEProvider>
      <IDEApp />
    </IDEProvider>
  );
}
