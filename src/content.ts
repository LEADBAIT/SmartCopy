import type { ContextRequest, SmartCopyMessage } from './types';

const triggerKey = 'Alt';
const shortcutKey = 'c';
let lastSelectionText = '';

function getSelectionText(): string {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return '';
  return selection.toString();
}

function getNodeContext(node: Node | null): string {
  if (!node) return '';
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  if (!element) return '';
  const block = element.closest('p, li, td, th, article, section, div, h1, h2, h3, h4, h5, h6');
  if (block) {
    return block.textContent?.trim() || '';
  }
  return element.textContent?.trim() || '';
}

function getSurroundingText(range: Range | null): string {
  if (!range) return '';
  const cloned = range.cloneRange();
  const container = cloned.commonAncestorContainer;
  const element = container.nodeType === Node.ELEMENT_NODE ? (container as Element) : container.parentElement;
  if (element) {
    return element.textContent?.trim() || '';
  }
  return '';
}

function buildContext(): ContextRequest {
  const selection = window.getSelection();
  const selectionText = getSelectionText();
  const anchorNode = selection?.anchorNode || null;
  const anchorText = anchorNode?.textContent?.trim() || '';
  const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  return {
    selectionText,
    anchorText,
    surroundingText: getSurroundingText(range),
    nodeContext: getNodeContext(anchorNode),
  };
}

function sendContext() {
  const context = buildContext();
  chrome.runtime.sendMessage({ type: 'SMARTCOPY_CONTEXT', context } as SmartCopyMessage, (response) => {
    if (chrome.runtime.lastError) {
      console.warn('SmartCopy: unable to reach background', chrome.runtime.lastError.message);
      return;
    }
    if (response) {
      lastSelectionText = context.selectionText;
    }
  });
}

function handleKeydown(event: KeyboardEvent) {
  if (event.altKey && event.key.toLowerCase() === shortcutKey && !event.shiftKey) {
    event.preventDefault();
    sendContext();
  }
}

function handleDoubleClick(event: MouseEvent) {
  if (event.altKey) {
    sendContext();
  }
}

function listenToSelectionChanges() {
  document.addEventListener('selectionchange', () => {
    const current = getSelectionText();
    if (current && current !== lastSelectionText) {
      lastSelectionText = current;
    }
  });
}

document.addEventListener('keydown', handleKeydown);
document.addEventListener('dblclick', handleDoubleClick);
listenToSelectionChanges();

chrome.runtime.onMessage.addListener((message: SmartCopyMessage, _sender, sendResponse) => {
  if (message.type === 'SMARTCOPY_REQUEST_CONTEXT') {
    const context = buildContext();
    sendResponse(context);
    return true;
  }
  return false;
});
