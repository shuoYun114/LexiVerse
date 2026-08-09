import React, { useState } from 'react';
import { isDemoEnv, loginAccount, registerAccount } from '../utils/auth';
import { UserAccount } from '../types';
import { UserCheck, UserPlus, LogIn, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isDemo = isDemoEnv();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isRegisterMode) {
      if (password !== confirmPassword) {
        setErrorMsg('两次输入的密码不一致');
        return;
      }
      const res = await registerAccount(username, password);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onAuthSuccess({ username, createdAt: new Date().toISOString() });
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.message);
      }
    } else {
      const res = await loginAccount(username, password);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onAuthSuccess({ username, createdAt: new Date().toISOString() });
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(9, 13, 22, 0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '30px', border: '1px solid var(--color-primary-glow)' }}>
        
        {/* 标题栏 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '16px', color: 'var(--color-primary-glow)', marginBottom: '12px' }}>
            {isRegisterMode ? <UserPlus size={32} /> : <UserCheck size={32} />}
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: 800 }}>
            {isRegisterMode ? '注册 LexiVerse 账号' : '登录 LexiVerse 账号'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {isDemo ? '🌌 GitHub Pages 演示在线端' : '💻 本地/局域网全功能多设备同步线'}
          </p>
        </div>

        {/* GitHub Demo 限制注册的警示提示 Banner */}
        {isDemo && isRegisterMode && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '20px',
              fontSize: '0.8rem',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>当前为 GitHub Pages 演示 Demo 模式</strong>
              <div style={{ marginTop: '4px', opacity: 0.9 }}>
                此处不支持注册新账号。请克隆代码并在本地运行 `npm run dev`，即可开放注册与局域网多设备自动同步功能！
              </div>
            </div>
          </div>
        )}

        {/* 表单切换 Tab */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: !isRegisterMode ? 'var(--color-primary)' : 'transparent',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            登录账号
          </button>

          <button
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: isRegisterMode ? 'var(--color-primary)' : 'transparent',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            注册账号
          </button>
        </div>

        {/* 提示信息 */}
        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* 输入表单 */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名..."
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码..."
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
              }}
            />
          </div>

          {isRegisterMode && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码..."
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: '#fff',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              className="cyber-button"
              style={{ flex: 1, padding: '10px' }}
            >
              取消
            </button>
            <button
              type="submit"
              className="cyber-button cyber-button-primary"
              style={{ flex: 1, padding: '10px' }}
            >
              <LogIn size={18} /> {isRegisterMode ? '立即注册' : '登录账户'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
