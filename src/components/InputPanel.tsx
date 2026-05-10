import { useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAudience } from '../lib/AudienceContext';
import { AudienceMode } from '../types';

interface Props {
  onTokenize: (text: string) => void;
  isTokenizing: boolean;
}

const EXAMPLES = [
  { label: 'Hello World', text: 'Hello, World!' },
  { label: 'Multilingual', text: 'Bonjour, GPT-4... 🤖' },
  { label: 'Code Snippet', text: 'def tokenize(text):\n    return text.split()' }
];

export function InputPanel({ onTokenize, isTokenizing }: Props) {
  const [text, setText] = useState('Tokenization is the first step in NLP.');
  const { mode } = useAudience();

  return (
    <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto z-30 relative space-y-4">
      <div>
        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Input Text</label>
        <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus-within:border-indigo-500 transition-colors">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text here to tokenize..."
            className="w-full h-32 p-4 bg-transparent resize-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-500 font-mono text-sm"
          />
          <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono">
            {text.length} chars
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mr-1 hidden sm:block">
            {mode === AudienceMode.BEGINNER ? 'Presets' : 'Presets'}
          </span>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setText(ex.text)}
              className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-700"
            >
              {ex.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => onTokenize(text)}
          disabled={!text.trim() || isTokenizing}
          className={cn(
            "w-full sm:w-auto px-8 py-2 rounded bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2",
            (!text.trim() || isTokenizing) && "opacity-50 cursor-not-allowed hover:bg-indigo-600 shadow-none"
          )}
        >
          {isTokenizing && <Play className="w-4 h-4 animate-pulse shrink-0" />}
          {isTokenizing ? 'Processing...' : 'Tokenize Text'}
        </button>
      </div>
    </div>
  );
}
