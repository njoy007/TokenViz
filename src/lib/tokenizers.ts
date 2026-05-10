import { TokenizerType, Token, MergeRule, TokenizationResult } from '../types';
import { getStringColor } from './utils';

// Helper for generating deterministic token IDs
const generateId = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 50000 + 100;
};

const getBytes = (text: string) => {
  return Array.from(new TextEncoder().encode(text));
};

const createToken = (text: string, isContinuation = false): Token => {
  return {
    id: generateId(text),
    text,
    bytes: getBytes(text),
    color: getStringColor(text),
    isContinuation
  };
};

export const tokenizeWord = (text: string): Token[] => {
  const splits = text.match(/\w+|\s+|[^\s\w]+/g) || [];
  return splits.map(s => createToken(s));
};

export const tokenizeChar = (text: string): Token[] => {
  const splits = text.split('');
  return splits.map(s => createToken(s));
};

export const tokenizeBPE = (text: string): TokenizationResult => {
  // We simulate BPE by actually running a mini BPE algorithm on the input
  let tokens = text.split('');
  let rules: MergeRule[] = [];
  
  // Do max 10 iterations to show some merges
  for (let iter = 0; iter < 10; iter++) {
    const pairs: Record<string, number> = {};
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i] === ' ' || tokens[i] === '\n') continue; // Don't merge across spaces usually for simple BPE
      const pair = tokens[i] + '|' + tokens[i+1];
      pairs[pair] = (pairs[pair] || 0) + 1;
    }
    
    let bestPair = '';
    let maxFreq = 0;
    for (const p in pairs) {
      if (pairs[p] > maxFreq) {
        maxFreq = pairs[p];
        bestPair = p;
      }
    }
    
    if (maxFreq < 2) break; // No repeating pairs
    
    const [p1, p2] = bestPair.split('|');
    const merged = p1 + p2;
    rules.push({ pair: [p1, p2], merged, freq: maxFreq });
    
    const newTokens: string[] = [];
    let i = 0;
    while (i < tokens.length) {
      if (i < tokens.length - 1 && tokens[i] === p1 && tokens[i+1] === p2) {
        newTokens.push(merged);
        i += 2;
      } else {
        newTokens.push(tokens[i]);
        i++;
      }
    }
    tokens = newTokens;
  }
  
  // Additional step: merge spaces into next token to look more realistic like GPT-2
  const finalTokens: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === ' ' && i < tokens.length - 1) {
      finalTokens.push(' ' + tokens[i+1]);
      i++;
    } else {
      finalTokens.push(tokens[i]);
    }
  }

  return {
    tokens: finalTokens.map(t => createToken(t)),
    originalText: text,
    type: TokenizerType.BPE,
    rulesApplied: rules,
    vocabSize: 50257
  };
};

export const tokenizeWordPiece = (text: string): TokenizationResult => {
  // Simulate WordPiece: split by space/punct, then randomly split words into pieces with ##
  const words = text.match(/[A-Za-z]+|[0-9]+|\s+|[^\s\w]+/g) || [];
  const tokens: Token[] = [];
  const rules: MergeRule[] = []; // Used to store 'likelihood' mapping in our visualization
  
  words.forEach(w => {
    if (/\w+/.test(w) && w.length > 3) {
      // Split word
      const splitPoint = Math.floor(w.length / 2);
      const w1 = w.slice(0, splitPoint);
      const w2 = w.slice(splitPoint);
      tokens.push(createToken(w1));
      tokens.push(createToken('##' + w2, true));
      rules.push({ pair: [w1, '##' + w2], merged: w, freq: Math.random() }); // fake prob
    } else {
      tokens.push(createToken(w));
    }
  });

  return {
    tokens,
    originalText: text,
    type: TokenizerType.WORDPIECE,
    rulesApplied: rules,
    vocabSize: 30522
  };
};

export const tokenizeSentencePiece = (text: string, type: TokenizerType.SENTENCEPIECE_BPE | TokenizerType.SENTENCEPIECE_UNIGRAM): TokenizationResult => {
  // Replace leading space with U+2581
  let spText = text.replace(/ /g, '\u2581');
  // simulate splits
  const tokens: Token[] = [];
  const splits = spText.match(/\u2581?[^\u2581]+/g) || [];
  
  splits.forEach(w => {
    if (w.length > 5) {
      const splitPoint = Math.floor(w.length / 2);
      tokens.push(createToken(w.slice(0, splitPoint)));
      tokens.push(createToken(w.slice(splitPoint)));
    } else {
      tokens.push(createToken(w));
    }
  });

  return {
    tokens,
    originalText: text,
    type,
    vocabSize: 32000
  };
};

export const simulateTokenization = (text: string, type: TokenizerType): TokenizationResult => {
  switch (type) {
    case TokenizerType.WORD:
      return { tokens: tokenizeWord(text), originalText: text, type, vocabSize: 100000 };
    case TokenizerType.CHAR:
      return { tokens: tokenizeChar(text), originalText: text, type, vocabSize: 256 };
    case TokenizerType.BPE:
      return tokenizeBPE(text);
    case TokenizerType.WORDPIECE:
      return tokenizeWordPiece(text);
    case TokenizerType.SENTENCEPIECE_BPE:
    case TokenizerType.SENTENCEPIECE_UNIGRAM:
      return tokenizeSentencePiece(text, type);
    case TokenizerType.UNIGRAM: // Treat unigram similar to sentencepiece unigram visually for now
      return tokenizeSentencePiece(text, TokenizerType.SENTENCEPIECE_UNIGRAM);
    default:
      return tokenizeBPE(text);
  }
};
