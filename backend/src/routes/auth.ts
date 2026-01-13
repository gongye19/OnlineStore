import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// 注册新用户
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { phone, password, nickname, email, address, gender } = req.body;

    if (!phone || !password || !nickname) {
      return res.status(400).json({ error: 'Phone, password, and nickname are required' });
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

export default router;

