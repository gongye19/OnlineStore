import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// 注册新用户
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { phone, password, nickname, email, address, gender } = req.body;

    if (!phone || !password || !nickname || !email) {
      return res.status(400).json({ error: 'Phone, password, nickname, and email are required' });
    }

    // 使用 Supabase Auth 创建用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      phone,
      password,
      options: {
        data: {
          nickname,
          email,
          address,
          gender: gender || 'other'
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user' });
    }

    // 创建用户资料记录
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        phone,
        nickname,
        email: email || null,
        address: address || null,
        gender: gender || 'other',
        is_admin: false
      });

    if (profileError) {
      // 如果创建资料失败，尝试删除已创建的用户
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: authData.user.id,
        phone,
        nickname
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// 登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    // 使用 Supabase Auth 登录
    const { data, error } = await supabase.auth.signInWithPassword({
      phone,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({ error: 'Login failed' });
    }

    // 获取用户资料
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    res.json({
      message: 'Login successful',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      },
      user: {
        id: userProfile.id,
        phone: userProfile.phone,
        nickname: userProfile.nickname,
        email: userProfile.email,
        address: userProfile.address,
        gender: userProfile.gender,
        is_admin: userProfile.is_admin
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// 获取当前用户信息
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    res.json({
      id: userProfile.id,
      phone: userProfile.phone,
      nickname: userProfile.nickname,
      email: userProfile.email,
      address: userProfile.address,
      gender: userProfile.gender,
      is_admin: userProfile.is_admin
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ error: error.message || 'Failed to get user info' });
  }
});

// 登出（可选，Supabase 客户端端处理）
router.post('/logout', async (req: Request, res: Response) => {
  res.json({ message: 'Logout successful' });
});

// 发送邮箱验证码（用于修改密码）
router.post('/send-email-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // 检查用户是否存在
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (userError || !users) {
      // 为了安全，即使邮箱不存在也返回成功（防止邮箱枚举攻击）
      return res.json({ message: 'If the email exists, a verification code has been sent' });
    }

    // 使用 Supabase Auth 发送邮箱验证码
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // 不创建新用户，只验证现有用户
      }
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Verification code sent to email' });
  } catch (error: any) {
    console.error('Send email OTP error:', error);
    res.status(500).json({ error: error.message || 'Failed to send verification code' });
  }
});

// 验证邮箱验证码
router.post('/verify-email-otp', async (req: Request, res: Response) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and token are required' });
    }

    // 验证 OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ error: 'Verification failed' });
    }

    // 返回一个临时 token，用于修改密码
    res.json({
      message: 'Email verified successfully',
      verified: true,
      user_id: data.user.id
    });
  } catch (error: any) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify code' });
  }
});

// 修改密码（需要邮箱验证）
router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // 先验证 OTP
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (verifyError || !verifyData.user) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // 使用 Supabase Admin API 更新密码
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      verifyData.user.id,
      { password: newPassword }
    );

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message || 'Failed to change password' });
  }
});

export default router;

