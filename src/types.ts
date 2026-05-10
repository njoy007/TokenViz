export enum AudienceMode {
  BEGINNER = 'beginner',
  DEVELOPER = 'developer',
  RESEARCHER = 'researcher',
}

export enum TokenizerType {
  BPE = 'bpe',
  WORDPIECE = 'wordpiece',
  SENTENCEPIECE_BPE = 'sp_bpe',
  SENTENCEPIECE_UNIGRAM = 'sp_unigram',
  UNIGRAM = 'unigram',
  CHAR = 'char',
  WORD = 'word',
}

export interface Token {
  id: number;
  text: string;
  bytes?: number[];
  color?: string;
  isContinuation?: boolean; // For WordPiece ##
}

export interface MergeRule {
  pair: [string, string];
  merged: string;
  freq?: number;
}

export interface TokenizationResult {
  tokens: Token[];
  originalText: string;
  type: TokenizerType;
  rulesApplied?: MergeRule[];
  vocabSize?: number;
}
