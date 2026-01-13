import React, { useState } from 'react';
import { authApi } from '../src/lib/api';

const ChangePassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'verify' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authApi.sendEmailOTP(email);
      setMessage('验证码已发送到您的邮箱，请查收');
      setStep('verify');
    } catch (err: any) {
      setError(err.message || '发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authApi.verifyEmailOTP(email, token);
      setMessage('邮箱验证成功，请设置新密码');
      setStep('password');
    } catch (err: any) {
      setError(err.message || '验证码错误或已过期');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authApi.changePassword(email, token, newPassword);
      setMessage('密码修改成功！请使用新密码登录');
      setTimeout(() => {
        window.location.hash = '#login';
      }, 2000);
    } catch (err: any) {
      setError(err.message || '修改密码失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[520px] mx-auto px-6 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl font-light mb-4 tracking-tight">
          {step === 'email' && '修改密码'}
          {step === 'verify' && '验证邮箱'}
          {step === 'password' && '设置新密码'}
        </h1>
        <p className="text-[9px] uppercase tracking-[0.4em] opacity-40">
          Change Password
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm">
          {message}
        </div>
      )}

      {step === 'email' && (
        <form onSubmit={handleSendOTP} className="space-y-8">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-art-charcoal/40">
              注册邮箱 / EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-x-0 border-t-0 border-b border-art-charcoal/20 focus:ring-0 focus:border-art-gold bg-transparent py-3 text-sm font-light"
              placeholder="请输入注册时填写的邮箱"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-art-charcoal text-white text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-art-gold transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? '发送中...' : '发送验证码'}
          </button>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => window.location.hash = '#login'}
              className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
            >
              返回登录
            </button>
          </div>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifyOTP} className="space-y-8">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-art-charcoal/40">
              邮箱验证码 / VERIFICATION CODE
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full border-x-0 border-t-0 border-b border-art-charcoal/20 focus:ring-0 focus:border-art-gold bg-transparent py-3 text-sm font-light"
              placeholder="请输入邮箱收到的6位验证码"
              maxLength={6}
            />
            <p className="text-[8px] opacity-40 mt-2">验证码已发送到 {email}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-art-charcoal text-white text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-art-gold transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? '验证中...' : '验证邮箱'}
          </button>

          <div className="text-center space-y-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setToken('');
                setError('');
                setMessage('');
              }}
              className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
            >
              重新发送验证码
            </button>
          </div>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={handleChangePassword} className="space-y-8">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-art-charcoal/40">
              新密码 / NEW PASSWORD
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border-x-0 border-t-0 border-b border-art-charcoal/20 focus:ring-0 focus:border-art-gold bg-transparent py-3 text-sm font-light"
              placeholder="至少6位字符"
              minLength={6}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-art-charcoal/40">
              确认新密码 / CONFIRM PASSWORD
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full border-x-0 border-t-0 border-b bg-transparent py-3 text-sm font-light focus:ring-0 ${
                confirmPassword && newPassword !== confirmPassword
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-art-charcoal/20 focus:border-art-gold'
              }`}
              placeholder="再次输入新密码"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-art-charcoal text-white text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-art-gold transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? '修改中...' : '确认修改密码'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ChangePassword;

