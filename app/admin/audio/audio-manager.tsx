'use client';
import { FormEvent, useMemo, useState } from 'react';

type AudioItem = {
  id: string;
  title: string;
  series: string;
  audioUrl: string;
  sort_order: number;
};
const CHUNK = 5 * 1024 * 1024;

export default function AudioManager({
  initialAudios,
}: {
  initialAudios: AudioItem[];
}) {
  const [audios, setAudios] = useState(initialAudios);
  const [editing, setEditing] = useState<AudioItem | null>(null);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const filtered = useMemo(
    () =>
      audios.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [audios, query],
  );
  const value = editing || {
    id: '',
    title: '',
    series: 'english-series',
    audioUrl: '',
    sort_order: audios.length + 1,
  };

  async function reload() {
    const result = (await fetch('/api/audio').then((response) =>
      response.json(),
    )) as { audios: AudioItem[] };
    setAudios(result.audios);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    setMessage('Saving…');
    const response = await fetch('/api/audio', {
      method: data.id ? 'PUT' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error || 'Could not save.');
      return;
    }
    await reload();
    setEditing(null);
    setMessage(
      data.id
        ? 'Recording updated.'
        : 'Recording added. Select it to upload an audio file.',
    );
  }

  async function upload(file: File) {
    if (!editing) return;
    setMessage('Preparing audio upload…');
    setProgress(0);
    let session: any = null;
    try {
      let response = await fetch('/api/admin/audio-upload?action=start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: editing.id,
          type: file.type,
          size: file.size,
        }),
      });
      session = await response.json();
      if (!response.ok) throw new Error(session.error);
      const parts = [];
      const total = Math.ceil(file.size / CHUNK);
      for (let index = 0; index < total; index++) {
        response = await fetch(
          `/api/admin/audio-upload?action=part&key=${encodeURIComponent(session.key)}&uploadId=${encodeURIComponent(session.uploadId)}&partNumber=${index + 1}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/octet-stream' },
            body: file.slice(
              index * CHUNK,
              Math.min(file.size, (index + 1) * CHUNK),
            ),
          },
        );
        const part = (await response.json()) as any;
        if (!response.ok) throw new Error(part.error);
        parts.push(part);
        setProgress(Math.round(((index + 1) / total) * 100));
        setMessage(`Uploading… ${index + 1} of ${total} pieces`);
      }
      response = await fetch('/api/admin/audio-upload?action=complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...session, parts }),
      });
      const result = (await response.json()) as any;
      if (!response.ok) throw new Error(result.error);
      await reload();
      setEditing((current) =>
        current ? { ...current, audioUrl: result.audioUrl } : current,
      );
      setMessage('Audio file uploaded securely.');
      setProgress(100);
    } catch (error) {
      if (session)
        fetch('/api/admin/audio-upload?action=abort', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(session),
        }).catch(() => {});
      setMessage(error instanceof Error ? error.message : 'Upload failed.');
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this recording?')) return;
    await fetch(`/api/audio?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    setAudios((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="directoryManager">
      <section className="settingsCard stickyEditor">
        <h2>{editing ? 'Edit recording' : 'Add a recording'}</h2>
        <form key={value.id || 'new'} onSubmit={save}>
          <input type="hidden" name="id" value={value.id} />
          <label>
            Title
            <input name="title" defaultValue={value.title} required />
          </label>
          <label>
            Audio collection
            <select name="series" defaultValue={value.series}>
              <option value="english-series">5-Minute English Series</option>
              <option value="hebrew-series">5-Minute Hebrew Series</option>
              <option value="yiddish-series">5-Minute Yiddish Series</option>
              <option value="general-shiurim">General Shiurim</option>
              <option value="video-shiurim">Video Shiurim</option>
            </select>
          </label>
          <label>
            Audio or video URL <small>(optional when uploading)</small>
            <input
              name="audioUrl"
              type="text"
              defaultValue={value.audioUrl}
              placeholder="https://… or a YouTube link"
            />
          </label>
          <label>
            Display order
            <input
              name="sort_order"
              type="number"
              min="0"
              defaultValue={value.sort_order}
            />
          </label>
          <button className="primary">
            {editing ? 'Save changes' : 'Add recording'}
          </button>
          {editing && (
            <button
              className="cancelButton"
              type="button"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          )}
        </form>
        {editing && (
          <label className="coverUpload">
            Upload or replace media file
            <input
              type="file"
              accept="audio/mpeg,audio/mp4,audio/aac,audio/x-m4a,audio/wav,audio/x-wav,video/mp4,video/webm,video/quicktime,.mp3,.m4a,.aac,.wav,.mp4,.webm,.mov"
              onChange={(event) =>
                event.target.files?.[0] && upload(event.target.files[0])
              }
            />
            <small>
              Audio or video file — uploaded in safe smaller pieces.
            </small>
            {progress > 0 && <progress max="100" value={progress} />}
          </label>
        )}
        <p>{message}</p>
      </section>
      <section className="adminDirectoryList">
        <div className="connectionStatus">
          <b>Audio Library</b>
          <span className="ready">{audios.length} recordings</span>
        </div>
        <input
          className="managerSearch"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search recordings…"
        />
        {filtered.map((item) => (
          <article key={item.id}>
            <div>
              <b>{item.title}</b>
              <span>
                {item.series.replaceAll('-', ' ')} ·{' '}
                {item.audioUrl ? 'Audio connected' : 'Needs audio'}
              </span>
            </div>
            <button onClick={() => setEditing(item)}>Edit</button>
            <button className="deleteButton" onClick={() => remove(item.id)}>
              Remove
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
