export type CopyMode = 'exactSelection' | 'expandedSentence' | 'expandedParagraph';

export interface CopyCandidates {
  exactSelection: string;
  expandedSentence: string;
  expandedParagraph: string;
}

export interface SmartCopyConfig {
  defaultMode: CopyMode;
  autoCopyOnShortcut: boolean;
  maxCharacters?: number;
  trimWhitespace?: boolean;
}

export interface ContextRequest {
  selectionText: string;
  anchorText: string;
  surroundingText: string;
  nodeContext: string;
}

export type SmartCopyMessage =
  | { type: 'SMARTCOPY_CONTEXT'; context: ContextRequest }
  | { type: 'SMARTCOPY_GET_LAST' }
  | { type: 'SMARTCOPY_REQUEST_CONTEXT' }
  | { type: 'SMARTCOPY_REQUEST_COPY'; mode?: CopyMode };
