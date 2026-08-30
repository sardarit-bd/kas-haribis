'use client';
import { FormEvent, useState } from 'react';

export default function AccessCodeForm({ documentId }: { documentId: string }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    setWorking(true);
    setMessage('');
    setDownloadUrl('');
    try {
      const response = await fetch('/api/heter-code-access', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code, documentId }),
      });
      const result = (await response.json()) as {
        error?: string;
        downloadUrl?: string;
      };
      if (!response.ok || !result.downloadUrl) {
        setMessage(result.error || 'The access code could not be accepted.');
        return;
      }
      setDownloadUrl(result.downloadUrl);
      setMessage('Access approved. Your protected download is ready.');
    } catch {
      setMessage('The code could not be verified. Please try again.');
    } finally {
      setWorking(false);
    }
  }
  return (
    <section className="heterCodeUnlock">
      <div>
        <p className="eyebrow gold">HAVE AN ACCESS CODE?</p>
        <h2>Download without payment</h2>
        <p>Enter the code supplied by Kav Haribis for this document.</p>
      </div>
      {downloadUrl ? (
        <div className="codeUnlockSuccess">
          <span>✓</span>
          <p>{message}</p>
          <a className="primary" href={downloadUrl}>
            Download protected Heter Iska
          </a>
        </div>
      ) : (
        <form onSubmit={submit}>
          <label htmlFor="heter-access-code">Access code</label>
          <div>
            <input
              id="heter-access-code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="XXXXX-XXXXX"
              autoComplete="off"
              maxLength={11}
              required
            />
            <button disabled={working}>
              {working ? 'Checking…' : 'Use access code'}
            </button>
          </div>
          {message && (
            <p className="formError" role="alert">
              {message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
