'use client';

export default function AdminLogin({
  password,
  loginError,
  isPending,
  onPasswordChange,
  onSubmit,
}: {
  password: string;
  loginError: string;
  isPending: boolean;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="admin-root admin-login">
      <div className="admin-login-card">
        <div className="kicker">AG Nails</div>
        <h1>Вход в админку</h1>
        <p>Введите пароль администратора для управления сайтом и QR-аналитикой.</p>
        {loginError && <div className="admin-error">{loginError}</div>}
        <form onSubmit={onSubmit}>
          <div className="admin-field" style={{ marginBottom: 18 }}>
            <span>Пароль администратора</span>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="admin-btn full" type="submit" disabled={isPending}>
            {isPending ? 'Проверка...' : 'Войти в панель'}
          </button>
        </form>
      </div>
    </div>
  );
}
