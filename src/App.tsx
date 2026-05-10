import { useState } from 'react';
import { AudienceProvider } from './lib/AudienceContext';
import { AudienceSelector } from './components/AudienceSelector';
import { TokenizerSelector } from './components/TokenizerSelector';
import { InputPanel } from './components/InputPanel';
import { VisualizationPipeline } from './components/VisualizationPipeline';
import { TokenizerType, TokenizationResult } from './types';
import { ThemeToggle } from './components/ThemeToggle';
import { simulateTokenization } from './lib/tokenizers';

export default function App() {
  const [tokenizerType, setTokenizerType] = useState<TokenizerType>(TokenizerType.BPE);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [result, setResult] = useState<TokenizationResult | null>(null);

  const handleTokenize = (text: string) => {
    setIsTokenizing(true);
    setResult(null); // Clear previous result
    
    // Simulate slight delay to make it feel like "processing"
    setTimeout(() => {
      const res = simulateTokenization(text, tokenizerType);
      setResult(res);
      setIsTokenizing(false);
    }, 400);
  };

  return (
    <AudienceProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 selection:bg-indigo-500/30 flex flex-col">
        <ThemeToggle />
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3 select-none">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-600/20">
              <span className="font-bold">T</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">TokenViz<span className="text-indigo-500 dark:text-indigo-400">.ai</span></h1>
          </div>
          
          <div className="hidden sm:block">
            <AudienceSelector />
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="max-w-6xl mx-auto space-y-8 flex flex-col items-center">
            
            <div className="sm:hidden w-full max-w-4xl mx-auto">
              <AudienceSelector />
            </div>

            <TokenizerSelector 
              selected={tokenizerType} 
              onSelect={(t) => {
                setTokenizerType(t);
                setResult(null); // Clear result when switching tokenizer to encourage re-running
              }} 
            />

            <InputPanel 
              onTokenize={handleTokenize} 
              isTokenizing={isTokenizing} 
            />

            {result && <VisualizationPipeline result={result} />}
            
          </div>
        </main>
        
      </div>
    </AudienceProvider>
  );
}
