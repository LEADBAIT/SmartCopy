import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/popup.css';
import type { CopyCandidates, CopyMode, SmartCopyMessage } from '../types';

type CandidateEntry = {
  mode: CopyMode;
  title: string;
  value: string;
};

const defaultModes: CandidateEntry['mode'][] = ['exactSelection', 'expandedSentence', 'expandedParagraph'];

const modeLabels: Record<CopyMode, string> = {
  exactSelection: 'Exact selection',
  expandedSentence: 'Sentence',
  expandedParagraph: 'Paragraph',
};

function Popup() {
  const [candidates, setCandidates] = useState<CopyCandidates | null>(null);
  const [message, setMessage] = useState<string>('Trigger SmartCopy (Alt + C or Alt + double click) to capture text.');
  const [defaultMode, setDefaultMode] = useState<CopyMode>('expandedSentence');
  const [autoCopy, setAutoCopy] = useState<boolean>(true);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'SMARTCOPY_GET_LAST' } as SmartCopyMessage, (response: CopyCandidates | null) => {
      if (response) {
        setCandidates(response);
        setMessage('Select a copy option below.');
      }
    });
  }, []);

  const handleCopy = async (mode: CopyMode) => {
    if (!candidates) return;
    try {
      await navigator.clipboard.writeText(candidates[mode]);
      setMessage(`${modeLabels[mode]} copied to clipboard.`);
    } catch (error) {
      console.error('SmartCopy: copy failed', error);
      setMessage('Unable to access clipboard.');
    }
  };

  const candidateList: CandidateEntry[] = candidates
    ? defaultModes.map((mode) => ({
        mode,
        title: modeLabels[mode],
        value: candidates[mode],
      }))
    : [];

  return (
    <div className="popup">
      <header className="popup__header">
        <div>
          <h1>SmartCopy</h1>
          <p className="popup__subtitle">Smart predictive copy helper</p>
        </div>
      </header>

      <section className="popup__status">{message}</section>

      <section className="popup__list">
        {candidateList.length === 0 && <p className="popup__empty">No candidates yet. Try the shortcut on a page.</p>}
        {candidateList.map((entry) => (
          <article key={entry.mode} className="candidate">
            <div className="candidate__header">
              <h2>{entry.title}</h2>
              <button onClick={() => handleCopy(entry.mode)}>Copy</button>
            </div>
            <p className="candidate__preview">{entry.value || 'No text detected.'}</p>
          </article>
        ))}
      </section>

      <section className="popup__settings">
        <h3>Settings</h3>
        <label className="setting">
          <span>Default mode</span>
          <select value={defaultMode} onChange={(e) => setDefaultMode(e.target.value as CopyMode)}>
            {defaultModes.map((mode) => (
              <option key={mode} value={mode}>
                {modeLabels[mode]}
              </option>
            ))}
          </select>
        </label>
        <label className="setting">
          <span>Auto-copy on shortcut</span>
          <input type="checkbox" checked={autoCopy} onChange={(e) => setAutoCopy(e.target.checked)} />
        </label>
        <p className="setting__hint">Settings are placeholders; persistence will be added later.</p>
      </section>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<Popup />);
}
