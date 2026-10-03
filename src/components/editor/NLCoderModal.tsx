import React, { useState } from 'react';
import { Sparkles, ArrowRight, FilePlus, Check, X, ShieldAlert, Code2 } from 'lucide-react';
import { useIDE } from '../../context/IDEContext';
import { Modal } from '../common/Modal';
import { Button3D } from '../common/Button3D';
import { NLCoderService } from '../../services/nlCoder';
import { NLCodePlan } from '../../types/editor';

interface NLCoderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NLCoderModal: React.FC<NLCoderModalProps> = ({ isOpen, onClose }) => {
  const { activeProject, executeNLPlan } = useIDE();
  const [prompt, setPrompt] = useState('');
  const [proposedPlan, setProposedPlan] = useState<NLCodePlan | null>(null);

  const quickPrompts = [
    'Create a login screen',
    'Add interactive counter button',
    'Create user profile screen',
    'Add search bar with filter',
    'Create settings card view',
  ];

  const handleGenerate = (text: string) => {
    if (!text.trim()) return;
    const plan = NLCoderService.planChanges(text, activeProject);
    setProposedPlan(plan);
  };

  const handleApply = () => {
    if (proposedPlan) {
      executeNLPlan(proposedPlan);
      setProposedPlan(null);
      setPrompt('');
      onClose();
    }
  };

  const handleClose = () => {
    setProposedPlan(null);
    setPrompt('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={proposedPlan ? 'Review Smart Code Changes' : 'What do you want to code?'}
      subtitle={proposedPlan ? 'Review proposed file modifications before applying' : 'Natural language coding command engine'}
      icon={<Sparkles size={18} className="text-blue-400" />}
      maxWidth="lg"
      footer={
        proposedPlan ? (
          <>
            <Button3D variant="surface" size="md" onClick={() => setProposedPlan(null)}>
              Back
            </Button3D>
            <Button3D variant="primary" size="md" icon={<Check size={14} />} onClick={handleApply}>
              Apply Changes
            </Button3D>
          </>
        ) : (
          <>
            <Button3D variant="surface" size="md" onClick={handleClose}>
              Cancel
            </Button3D>
            <Button3D
              variant="primary"
              size="md"
              icon={<ArrowRight size={14} />}
              onClick={() => handleGenerate(prompt)}
              disabled={!prompt.trim()}
            >
              Analyze & Propose
            </Button3D>
          </>
        )
      }
    >
      {!proposedPlan ? (
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Describe what feature or component to code:
            </label>
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleGenerate(prompt);
              }}
              placeholder="e.g. Create a login screen with validation and error text"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map(qp => (
                <button
                  key={qp}
                  onClick={() => {
                    setPrompt(qp);
                    handleGenerate(qp);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white hover:border-blue-500 hover:bg-neutral-800 transition-all text-xs"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-start gap-2.5">
            <Sparkles size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-200 block">{proposedPlan.summary}</span>
              <span className="text-[11px] text-blue-300/80">Request: "{proposedPlan.userPrompt}"</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-neutral-300 block">Proposed File Actions:</span>
            {proposedPlan.changes.map((c, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2">
                  <FilePlus size={15} className="text-emerald-400 shrink-0" />
                  <span className="font-mono font-semibold text-neutral-200 text-xs truncate">
                    + Created {c.path.split('/').pop()}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">{c.description}</p>
                <div className="max-h-36 overflow-y-auto p-2 rounded-lg bg-neutral-900 border border-neutral-800/80 font-mono text-[10px] text-neutral-300">
                  <pre>{c.newContent.slice(0, 450)}...</pre>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-neutral-500 flex items-center gap-1.5">
            <ShieldAlert size={12} className="text-amber-400 shrink-0" />
            Changes will be applied to your project tree only when you tap "Apply Changes".
          </p>
        </div>
      )}
    </Modal>
  );
};
