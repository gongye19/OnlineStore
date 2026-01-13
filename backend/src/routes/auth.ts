import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// 注册新用户
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { phone, password, nickname, email, address, gender } = req.body;

    // 验证必填字段：邮箱是必填的（用于 Supabase Auth），手机号和昵称也是必填的
    if (!email || !password || !nickname || !phone) {
      return res.status(400).json({ error: '邮箱、密码、昵称和手机号都是必填项' });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '邮箱格式不正确，请输入有效的邮箱地址' });
    }

    // 验证手机号格式（11位数字）
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: '手机号格式不正确，请输入11位有效手机号' });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为6位' });
    }

    // 使用邮箱注册（Supabase Auth 使用邮箱作为主标识符）
    // 手机号存储在用户 metadata 中，作为网站登录信息
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone, // 手机号存储在 metadata 中
          nickname,
          address: address || null,
          gender: gender || 'other'
        },
        emailRedirectTo: undefined // 不需要邮箱验证重定向
      }
    });

    if (authError) {
      console.error('Supabase signUp error:', authError);
      // 提供更详细的错误信息
      let errorMessage = authError.message;
      let statusCode = 400;
      
      if (authError.code === 'email_provider_disabled') {
        errorMessage = '邮箱注册功能未启用。请在 Supabase Dashboard → Authentication → Providers → Email 中启用邮箱注册功能';
        statusCode = 400;
      } else if (authError.code === 'phone_provider_disabled') {
        errorMessage = '手机号注册功能未启用';
        statusCode = 400;
      } else if (authError.message.includes('email') || authError.message.includes('Email')) {
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          errorMessage = '该邮箱已被注册，请使用其他邮箱或直接登录';
        } else {
          errorMessage = '邮箱格式不正确或已被注册';
        }
        statusCode = 400;
      } else if (authError.message.includes('password')) {
        errorMessage = '密码不符合要求（至少6位）';
        statusCode = 400;
      }
      
      return res.status(statusCode).json({ 
        error: errorMessage,
        code: authError.code || 'unknown',
        details: authError.message 
      });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user' });
    }

    // 如果 Supabase 启用了邮箱验证，新用户可能处于未确认状态
    // 使用 service role key 可以自动确认用户（跳过邮箱验证）
    if (authData.user && !authData.user.email_confirmed_at) {
      try {
        // 使用 admin API 自动确认用户邮箱
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          authData.user.id,
          { email_confirm: true }
        );
        if (confirmError) {
          console.warn('Could not auto-confirm user:', confirmError);
        } else {
          console.log('User email auto-confirmed');
        }
      } catch (confirmError: any) {
        console.warn('Error auto-confirming user:', confirmError);
      }
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

    // 由于 Supabase Auth 使用邮箱，需要通过手机号查找对应的邮箱
    // 如果 phone 是邮箱格式，直接使用；否则从 users 表查找
    let loginEmail = phone;
    
    // 如果输入的不是邮箱格式（不包含 @），则从 users 表查找对应的邮箱
    if (!phone.includes('@')) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('phone', phone)
        .single();
      
      if (userError || !userData?.email) {
        return res.status(401).json({ error: '手机号或密码错误' });
      }
      loginEmail = userData.email;
    }

    // 使用邮箱登录 Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password
    });

    if (error) {
      console.error('Login error:', error);
      // 提供更友好的错误信息
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = '手机号或密码错误';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = '请先验证邮箱，检查您的邮箱收件箱';
      } else if (error.message.includes('email')) {
        errorMessage = '邮箱格式错误或账户不存在';
      }
      return res.status(401).json({ 
        error: errorMessage,
        code: error.status 
      });
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

