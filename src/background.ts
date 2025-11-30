import type { ContextRequest, CopyCandidates, CopyMode, SmartCopyConfig, SmartCopyMessage } from './types';

const defaultConfig: SmartCopyConfig = {
  defaultMode: 'expandedSentence',
  autoCopyOnShortcut: true,
  maxCharacters: 2000,
  trimWhitespace: true,
};

let lastCandidates: CopyCandidates | null = null;

function applyHeuristics(context: ContextRequest): CopyCandidates {
  const selection = context.selectionText || context.anchorText || '';
  const sentence = expandToSentence(context.surroundingText, selection);
  const paragraph = expandToParagraph(context.nodeContext, selection, context.surroundingText);

  const clean = (text: string) => {
    const trimmed = defaultConfig.trimWhitespace ? text.trim() : text;
    if (defaultConfig.maxCharacters && trimmed.length > defaultConfig.maxCharacters) {
      return `${trimmed.slice(0, defaultConfig.maxCharacters)}…`;
    }
    return trimmed;
  };

  return {
    exactSelection: clean(selection),
    expandedSentence: clean(sentence),
    expandedParagraph: clean(paragraph),
  };
}

function expandToSentence(surroundingText: string, selection: string): string {
  if (!surroundingText) return selection || '';
  const boundaryRegex = /([.!?])\s/;
  const parts = surroundingText.split(boundaryRegex);
  if (parts.length < 2) return surroundingText;
  return parts.reduce((acc, part, idx) => {
    if (acc) return acc;
    const chunk = part;
    const separator = parts[idx + 1] || '';
    const candidate = `${chunk}${separator}`;
    if (candidate.includes(selection) || selection.includes(candidate.trim())) {
      return candidate.trim();
    }
    return '';
  }, '') || selection || surroundingText;
}

function expandToParagraph(nodeContext: string, selection: string, surroundingText: string): string {
  const text = nodeContext || surroundingText || selection;
  if (!text) return '';
  const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return text.trim();
  const match = paragraphs.find((p) => p.includes(selection)) || paragraphs[0];
  return match;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('SmartCopy: Failed to write to clipboard', error);
  }
}

function handleContextMessage(context: ContextRequest, sendResponse: (candidates: CopyCandidates) => void) {
  const candidates = applyHeuristics(context);
  lastCandidates = candidates;
  sendResponse(candidates);
}

function handleCopy(mode?: CopyMode) {
  if (!lastCandidates) return;
  const chosenMode = mode || defaultConfig.defaultMode;
  const text = lastCandidates[chosenMode];
  copyToClipboard(text);
}

chrome.runtime.onMessage.addListener((message: SmartCopyMessage, _sender, sendResponse) => {
  if (message.type === 'SMARTCOPY_CONTEXT') {
    handleContextMessage(message.context, sendResponse as (candidates: CopyCandidates) => void);
    return true;
  }

  if (message.type === 'SMARTCOPY_GET_LAST') {
    sendResponse(lastCandidates);
    return true;
  }

  if (message.type === 'SMARTCOPY_REQUEST_COPY') {
    handleCopy(message.mode);
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'SMARTCOPY_REQUEST_CONTEXT') {
    requestContextFromActiveTab();
    sendResponse({ requested: true });
    return true;
  }

  return false;
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'smartcopy_copy_default') {
    requestContextFromActiveTab(true);
  }
});

function requestContextFromActiveTab(copyAfter = false) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) return;
    chrome.tabs.sendMessage(
      tab.id,
      { type: 'SMARTCOPY_REQUEST_CONTEXT' },
      (response: ContextRequest | undefined) => {
        if (!response) return;
        const candidates = applyHeuristics(response);
        lastCandidates = candidates;
        if (copyAfter && defaultConfig.autoCopyOnShortcut) {
          handleCopy(defaultConfig.defaultMode);
        }
      },
    );
  });
}
