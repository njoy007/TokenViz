import { useAudience } from '../lib/AudienceContext';
import { AudienceMode } from '../types';
import { BookOpen, Code2, Microscope } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const MODES = [
  { id: AudienceMode.BEGINNER, icon: BookOpen, label: 'Beginner', desc: 'Simple explanations, friendly visuals' },
  { id: AudienceMode.DEVELOPER, icon: Code2, label: 'Developer', desc: 'Token IDs, technical details' },
  { id: AudienceMode.RESEARCHER, icon: Microscope, label: 'Researcher', desc: 'Merge rules, algorithms, stats' },
];

export function AudienceSelector() {
  const { mode, setMode } = useAudience();

  return (
    <div className="flex flex-row items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-700 w-full sm:w-auto overflow-x-auto">
      {MODES.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "relative px-4 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors duration-200 w-full sm:w-auto text-xs font-medium",
              isActive ? "text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            title={m.desc}
          >
            {isActive && (
              <motion.div
                layoutId="audience-pill"
                className="absolute inset-0 bg-indigo-600 rounded-md shadow-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
