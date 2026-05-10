import { TokenizerType, AudienceMode } from '../types';
import { useAudience } from '../lib/AudienceContext';
import { cn } from '../lib/utils';
import { ChevronDown, Check, Zap } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const TOKENIZERS = [
  { 
    id: TokenizerType.BPE, 
    name: 'Byte-Pair Encoding (BPE)', 
    models: 'GPT-2, GPT-4, RoBERTa',
    family: 'Subword',
    desc: {
      [AudienceMode.BEGINNER]: 'Finds common character pairs and merges them, like learning syllables before whole words.',
      [AudienceMode.DEVELOPER]: 'Iteratively merges the most frequent pair of adjacent bytes/characters. Standard for most LLMs.',
      [AudienceMode.RESEARCHER]: 'Data compression technique. Builds vocab from chars by progressively replacing high-frequency pairs. O(N^2) naive complexity.'
    }
  },
  { 
    id: TokenizerType.WORDPIECE, 
    name: 'WordPiece', 
    models: 'BERT, DistilBERT',
    family: 'Subword',
    desc: {
      [AudienceMode.BEGINNER]: 'Splits rare words into smaller pieces. Uses "##" to show when pieces belong to the same word.',
      [AudienceMode.DEVELOPER]: 'Similar to BPE but maximizes the likelihood of the training data instead of strict frequency.',
      [AudienceMode.RESEARCHER]: 'Greedy subword tokenization maximizing language model likelihood. O(N) inference with deterministic longest-match.'
    }
  },
  { 
    id: TokenizerType.SENTENCEPIECE_BPE, 
    name: 'SentencePiece (BPE)', 
    models: 'LLaMA, T5 (some)',
    family: 'Subword',
    desc: {
      [AudienceMode.BEGINNER]: 'Treats spaces like a normal letter (often seen as " ") before splitting things up.',
      [AudienceMode.DEVELOPER]: 'Language-agnostic tokenizer that includes spaces in the sequence, then applies BPE.',
      [AudienceMode.RESEARCHER]: 'Direct stream processing. Replaces whitespace with U+2581 avoiding pre-tokenization dependency. Uses BPE backend.'
    }
  },
  { 
    id: TokenizerType.SENTENCEPIECE_UNIGRAM, 
    name: 'SentencePiece (Unigram)', 
    models: 'T5, ALBERT',
    family: 'Subword',
    desc: {
      [AudienceMode.BEGINNER]: 'Starts with a massive list of pieces and removes the least helpful ones over time.',
      [AudienceMode.DEVELOPER]: 'Uses a probabilistic unigram model to select the most likely tokenization sequence.',
      [AudienceMode.RESEARCHER]: 'Subword regularized Unigram LM backing. Computes Viterbi path. Naturally supports multiple segmentations for augmentation.'
    }
  },
  {
    id: TokenizerType.WORD,
    name: 'Word-level',
    models: 'Legacy / Educational',
    family: 'Word',
    desc: {
      [AudienceMode.BEGINNER]: 'Splits text by spaces and punctuation. Simple but struggles with unknown words.',
      [AudienceMode.DEVELOPER]: 'Baseline whitespace and regex splitting. High OOV (out-of-vocabulary) rate, explodes vocab size.',
      [AudienceMode.RESEARCHER]: 'Naive space delimiting. Leads to sparse embedding representations and inability to handle morphological variations.'
    }
  },
  {
    id: TokenizerType.CHAR,
    name: 'Char-level',
    models: 'CNN LMs, CANINE',
    family: 'Character',
    desc: {
      [AudienceMode.BEGINNER]: 'Chops everything into single letters. Small vocabulary but makes the output very long.',
      [AudienceMode.DEVELOPER]: 'Every character is a token. Very small vocab (approx 256), but forces models to learn composition from scratch.',
      [AudienceMode.RESEARCHER]: 'Minimal bias, zero OOV. However, drastically increases sequence length, placing extreme burden on attention mechanisms.'
    }
  }
];

interface Props {
  selected: TokenizerType;
  onSelect: (t: TokenizerType) => void;
}

export function TokenizerSelector({ selected, onSelect }: Props) {
  const { mode } = useAudience();
  const [isOpen, setIsOpen] = useState(false);

  const activeTokenizer = TOKENIZERS.find(t => t.id === selected) || TOKENIZERS[0];

  return (
    <div className="relative w-full max-w-4xl mx-auto z-40">
      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Select Tokenizer</label>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex items-center justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left"
      >
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 justify-start items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              {activeTokenizer.name}
            </h2>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 uppercase tracking-wider font-bold">
              {activeTokenizer.family}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {activeTokenizer.desc[mode]}
          </p>
          {mode !== AudienceMode.BEGINNER && (
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-mono uppercase tracking-widest">
              Models: {activeTokenizer.models}
            </p>
          )}
        </div>
        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ml-4", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/50 flex flex-col"
          >
            <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-1">
              {TOKENIZERS.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelect(t.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-md flex items-start gap-3 transition-colors border",
                    selected === t.id 
                      ? "bg-indigo-50/50 dark:bg-indigo-600/10 border-indigo-200 dark:border-indigo-500/50" 
                      : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}
                >
                  <div className="mt-1 flex-shrink-0 w-4">
                    {selected === t.id && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2 items-center justify-between">
                      <span className={cn("text-sm font-bold", selected === t.id ? "text-indigo-700 dark:text-indigo-300" : "text-slate-800 dark:text-slate-300")}>
                        {t.name}
                      </span>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-bold shrink-0",
                        selected === t.id ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30" : "bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700"
                      )}>
                        {t.family}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {t.desc[mode]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
