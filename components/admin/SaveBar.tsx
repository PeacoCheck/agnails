'use client';

export default function SaveBar({
  saveStatus,
  errorMessage,
  onSave,
}: {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  errorMessage: string;
  onSave: () => void;
}) {
  return (
    <div className="admin-save">
      <div className="admin-save-inner">
        <p>
          {saveStatus === 'saved' && <span className="admin-ok">Изменения сохранены и применены на сайте</span>}
          {saveStatus === 'error' && <span className="admin-error" style={{ margin: 0, display: 'inline-block' }}>Ошибка: {errorMessage}</span>}
          {saveStatus === 'saving' && 'Сохранение изменений...'}
          {saveStatus === 'idle' && 'Не забудьте сохранить внесённые правки'}
        </p>
        <button
          type="button"
          className="admin-btn full-mobile"
          onClick={onSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>
    </div>
  );
}
