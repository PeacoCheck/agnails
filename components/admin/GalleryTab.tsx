'use client';

import type { SiteContent } from '@/lib/site-content-schema';

export default function GalleryTab({
  content,
  setContent,
  uploadFile,
  uploadTitle,
  uploadAlt,
  isUploading,
  previewUrl,
  onFileChange,
  onTitleChange,
  onAltChange,
  onUpload,
  onDelete,
  onMove,
}: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  uploadFile: File | null;
  uploadTitle: string;
  uploadAlt: string;
  isUploading: boolean;
  previewUrl: string | null;
  onFileChange: (file: File | null) => void;
  onTitleChange: (value: string) => void;
  onAltChange: (value: string) => void;
  onUpload: (e: React.FormEvent) => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  return (
    <section className="admin-card">
      <h2>Галерея работ</h2>
      <p className="hint">JPEG, PNG или WebP до 5 МБ. После загрузки фото сжимается в webp.</p>
      <form className="admin-upload" onSubmit={onUpload}>
        {previewUrl && <img src={previewUrl} alt="" className="admin-upload-preview" />}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        />
        <input value={uploadTitle} onChange={(e) => onTitleChange(e.target.value)} placeholder="Название (например: Молочный нюд)" />
        <input value={uploadAlt} onChange={(e) => onAltChange(e.target.value)} placeholder="Alt-текст" />
        <button className="admin-btn" type="submit" disabled={isUploading || !uploadFile}>
          {isUploading ? 'Загрузка и сжатие...' : 'Загрузить в галерею'}
        </button>
      </form>
      <div className="admin-works">
        {content.works.map((work, idx) => (
          <div className="admin-work" key={`${work.src}-${idx}`}>
            <img src={work.src} alt={work.alt} />
            <div className="admin-work-meta">
              <input
                value={work.title}
                onChange={(e) => {
                  const works = [...content.works];
                  works[idx] = { ...works[idx], title: e.target.value };
                  setContent({ ...content, works });
                }}
              />
              <div className="admin-work-actions">
                <button type="button" className="admin-btn ghost tiny" onClick={() => onMove(idx, -1)} disabled={idx === 0}>↑</button>
                <button type="button" className="admin-btn ghost tiny" onClick={() => onMove(idx, 1)} disabled={idx === content.works.length - 1}>↓</button>
                <button type="button" className="admin-btn danger tiny" onClick={() => onDelete(idx)}>Удалить</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
