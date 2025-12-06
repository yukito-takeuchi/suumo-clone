'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import HomeIcon from '@mui/icons-material/Home';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 1, fontSize: 32 }} />
            <Typography
              variant="h5"
              component="div"
              sx={{ fontWeight: 700, flexGrow: 0 }}
            >
              SUUMO Clone
            </Typography>
          </Link>

          <Box sx={{ flexGrow: 1 }} />

          {isAuthenticated ? (
            <>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user?.email}
              </Typography>
              {user?.role === 'corporate' && (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    href="/corporate/properties"
                    sx={{ mr: 1 }}
                  >
                    物件管理
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    href="/corporate/inquiries"
                    sx={{ mr: 1 }}
                  >
                    問い合わせ管理
                  </Button>
                </>
              )}
              <Button
                color="inherit"
                component={Link}
                href="/profile"
                sx={{ mr: 1 }}
              >
                プロフィール
              </Button>
              <Button color="inherit" onClick={logout}>
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                href="/login"
                sx={{ mr: 1 }}
              >
                ログイン
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                component={Link}
                href="/register"
              >
                新規登録
              </Button>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
