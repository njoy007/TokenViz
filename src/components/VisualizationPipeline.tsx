import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TokenizationResult, AudienceMode, TokenizerType } from '../types';
import { useAudience } from '../lib/AudienceContext';
import { cn } from '../lib/utils';
import { FastForward, Pause, Play, Hash } from 'lucide-react';

interface Props {
  result: TokenizationResult;
}

export function VisualizationPipeline({ result }: Props) {
  const { mode } = useAudience();
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Staggered display of tokens in Panel A
  const [visibleTokens, setVisibleTokens] = useState<number>(0);

  useEffect(() => {
    setVisibleTokens(0);
    setIsPlaying(true);
  }, [result]);

  useEffect(() => {
    if (!isPlaying) return;
    
    if (visibleTokens < result.tokens.length) {
      const delay = animationSpeed === 'slow' ? 800 : animationSpeed === 'fast' ? 50 : 250;
      const timer = setTimeout(() => {
        setVisibleTokens(v => v + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
    }
  }, [visibleTokens, isPlaying, animationSpeed, result.tokens.length]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-8 pb-32">
      {/* Panel A - Splitting Animation */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm overflow-hidden relative">
        <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
              {mode === AudienceMode.BEGINNER ? "Panel A: Chopping up the text" : "Panel A: Live Token Splits"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {mode === AudienceMode.BEGINNER 
                ? "Watch how the computer splits your text into chunks it can understand." 
                : "The raw string is segmented into discrete token representations."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Speed:</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600 mx-1" />
              {(['slow', 'normal', 'fast'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setAnimationSpeed(s)}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider transition-colors",
                    animationSpeed === s 
                      ? "bg-indigo-500 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg min-h-[120px] items-center content-start shadow-inner">
          <AnimatePresence>
            {result.tokens.slice(0, visibleTokens).map((t, i) => (
              <motion.div
                key={`${t.id}-${i}`}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.4 }}
                style={{ backgroundColor: t.color + '40' }} // 40 is hex for 25% opacity
                className={cn(
                  "relative group flex flex-col items-center justify-center px-3 py-1.5 rounded border transition-all duration-200 hover:brightness-110",
                  "border-black/5 dark:border-white/10 shadow-sm"
                )}
              >
                <span className="font-mono text-sm text-slate-900 dark:text-slate-100 whitespace-pre font-bold">
                  {t.text.replace(' ', '\u00A0')}
                </span>
                {mode !== AudienceMode.BEGINNER && (
                  <span className="text-[9px] text-slate-600 dark:text-slate-400 font-mono mt-0.5 w-full text-center border-t border-black/10 dark:border-white/10 pt-0.5">
                    {t.id}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {visibleTokens < result.tokens.length && (
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-5 bg-slate-300 dark:bg-slate-600 rounded-sm ml-1"
            />
          )}
        </div>
      </div>

      {/* Panel B - Vocabulary Mapping */}
      {visibleTokens > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col"
        >
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
              {mode === AudienceMode.BEGINNER ? "Panel B: The 'Dictionary' ID" : "Panel B: Vocabulary Mapping"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {mode === AudienceMode.BEGINNER 
                ? "Every chunk gets a unique number, like finding a word in a huge dictionary." 
                : "Tokens are mapped to their vocabulary index IDs."}
            </p>
          </div>

          <div className="flex-1 overflow-x-auto bg-white dark:bg-slate-900/20">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[9px] tracking-widest">
                <tr>
                  <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">Text Fragment</th>
                  <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">Token ID</th>
                  {mode === AudienceMode.RESEARCHER && (
                    <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-700">UTF-8 Bytes</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {Array.from(new Set(result.tokens.slice(0, visibleTokens).map(t => t.id))).slice(0, 15).map(uniqueId => {
                  const t = result.tokens.find(tok => tok.id === uniqueId)!;
                  return (
                    <motion.tr 
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group"
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2.5 h-2.5 rounded shadow-sm" 
                            style={{ backgroundColor: t.color }}
                          />
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200 font-bold">
                            {t.text}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Hash className="w-3 h-3 opacity-50" />
                        {t.id}
                      </td>
                      {mode === AudienceMode.RESEARCHER && (
                        <td className="py-2.5 px-4 font-mono text-[10px] text-slate-500">
                          {t.bytes?.map(b => b.toString(16).padStart(2, '0')).join(' ')}
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {new Set(result.tokens.map(t => t.id)).size > 15 && (
              <div className="text-center py-3 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/60 uppercase tracking-widest font-bold">
                ... and {new Set(result.tokens.map(t => t.id)).size - 15} more unique tokens
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Panel C - Merge Rules (Hidden for Beginner) */}
      {mode !== AudienceMode.BEGINNER && result.rulesApplied && result.rulesApplied.length > 0 && visibleTokens >= result.tokens.length && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
        >
          <div className="mb-6 flex justify-between items-start max-w-full">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-rose-500 rounded-full"></span>
                {mode === AudienceMode.DEVELOPER ? "Panel C: Algorithm Steps" : "Panel C: Merge Logic"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {mode === AudienceMode.DEVELOPER 
                  ? "Sequence of operations performed." 
                  : "Top merge operations ranked by frequency."}
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase text-indigo-500 tracking-wider">Top Rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.rulesApplied.map((rule, i) => (
              <div key={i} className="flex flex-col gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] font-mono z-10 relative">
                  <div className="flex gap-1 items-center opacity-90">
                    <span className="text-slate-700 dark:text-slate-300">{rule.pair[0]}</span>
                    <span className="text-slate-400">+</span>
                    <span className="text-slate-700 dark:text-slate-300">{rule.pair[1]}</span>
                  </div>
                  <FastForward className="w-3 h-3 text-indigo-400 flex-shrink-0 mx-1" />
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {rule.merged}
                  </span>
                </div>
                {mode === AudienceMode.RESEARCHER && rule.freq && (
                  <div className="w-full mt-1 flex items-center justify-between gap-2 z-10 relative">
                     <span className="text-[9px] uppercase tracking-widest text-slate-500">Hits</span>
                     <span className="font-mono text-xs text-slate-400">{rule.freq}</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-500/20 w-full">
                  <div className="h-full bg-indigo-500" style={{ width: `${Math.max(10, 100 - i * 15)}%`}} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Panel D - Count & Cost */}
      {visibleTokens >= result.tokens.length && (
         <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col space-y-6"
       >
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         
         <div className="relative z-10">
           <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-4">
             Panel D: Stats & Efficiency
           </h3>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
               <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Total Tokens</div>
               <div className="text-2xl font-bold font-mono text-white flex items-end justify-center gap-1">
                 {result.tokens.length} <span className="text-xs text-slate-500 mb-1">/{result.originalText.length}c</span>
               </div>
             </div>

             <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
               <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Efficiency</div>
               <div className="text-2xl font-bold font-mono text-emerald-400 flex items-end justify-center gap-1">
                 {(result.originalText.length / Math.max(1, result.tokens.length)).toFixed(2)}
               </div>
               <div className="text-[8px] text-slate-500 uppercase mt-1 font-bold tracking-widest">chars/token</div>
             </div>

             {mode !== AudienceMode.BEGINNER ? (
               <>
                 <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700 text-center flex flex-col justify-center">
                   <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Vocab Size</div>
                   <div className="text-lg font-bold font-mono text-slate-200">
                     {result.vocabSize?.toLocaleString() || 'N/A'}
                   </div>
                 </div>
                 <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700 text-center flex flex-col justify-center">
                   <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Ext. Cost (GPT-4)</div>
                   <div className="text-lg font-bold font-mono text-indigo-400">
                     ${((result.tokens.length / 1000) * 0.03).toFixed(5)}
                   </div>
                 </div>
               </>
             ) : (
               <div className="col-span-2 p-4 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                 <p className="text-xs text-slate-400 text-center max-w-xs">
                   Higher efficiency means the AI understands more text using fewer "brain points."
                 </p>
               </div>
             )}
           </div>
         </div>
       </motion.div>
      )}

    </div>
  );
}
