'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <>
      {/* Header 1: Top Bar (Light Green Background) */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#8BC34A',
          borderBottom: '1px solid #7CB342',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              minHeight: '40px !important',
              py: 0.5,
            }}
          >
            <Box sx={{ flexGrow: 1 }} />

            {/* Right Side: User Menu */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {isAuthenticated ? (
                <>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'white',
                      fontSize: '0.75rem',
                      mr: 1,
                    }}
                  >
                    {user?.email}
                  </Typography>

                  {user?.role === 'corporate' && (
                    <>
                      <Button
                        color="inherit"
                        component={Link}
                        href="/corporate/properties"
                        size="small"
                        sx={{
                          color: 'white',
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          minWidth: 'auto',
                          px: 1,
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        物件管理
                      </Button>
                      <Button
                        color="inherit"
                        component={Link}
                        href="/corporate/inquiries"
                        size="small"
                        sx={{
                          color: 'white',
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          minWidth: 'auto',
                          px: 1,
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        問い合わせ管理
                      </Button>
                    </>
                  )}

                  <Button
                    color="inherit"
                    component={Link}
                    href="/profile"
                    size="small"
                    sx={{
                      color: 'white',
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      minWidth: 'auto',
                      px: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    プロフィール
                  </Button>

                  <Button
                    color="inherit"
                    onClick={logout}
                    size="small"
                    sx={{
                      color: 'white',
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      minWidth: 'auto',
                      px: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    ログアウト
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    href="/register"
                    size="small"
                    sx={{
                      color: 'white',
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      minWidth: 'auto',
                      px: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    会員登録
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    href="/login"
                    size="small"
                    sx={{
                      color: 'white',
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      minWidth: 'auto',
                      px: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    ログイン
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Header 2: Main Navigation Bar (White Background) */}
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          bgcolor: 'white',
          color: '#231815',
          borderBottom: '2px solid #E0E0E0',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: '80px', md: '100px' },
              py: 1,
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                marginRight: '32px',
              }}
            >
              <Box
                component="img"
                src="/suumo-logo.svg"
                alt="SUUMO"
                sx={{
                  height: { xs: '50px', md: '60px' },
                  width: 'auto',
                }}
              />
            </Link>

            {/* Area Selector (Design Only) */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 1,
                mr: 4,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#666',
                  fontSize: '0.85rem',
                }}
              >
                全国へ
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: '#231815',
                  fontSize: '1rem',
                }}
              >
                関東版
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Category Navigation (Design Only) */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                gap: 0,
                alignItems: 'center',
              }}
            >
              {/* Active Tab: 賃貸 */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  bgcolor: '#8BC34A',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: '4px 4px 0 0',
                  cursor: 'pointer',
                }}
              >
                賃貸
              </Box>

              {/* Inactive Tabs */}
              {[
                { label: '新築マンション', sublabel: '新築' },
                { label: '中古マンション', sublabel: '中古' },
                { label: '新築一戸建て', sublabel: '新築' },
                { label: '中古一戸建て', sublabel: '中古' },
                { label: '注文住宅・土地', sublabel: null },
                { label: 'リフォーム', sublabel: null },
                { label: '売却査定', sublabel: null },
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 1.5,
                    py: 1.5,
                    color: '#666',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    borderLeft: '1px solid #E0E0E0',
                    '&:hover': {
                      bgcolor: '#F5F5F5',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.25,
                  }}
                >
                  {item.sublabel && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.65rem',
                        color: '#999',
                        lineHeight: 1,
                      }}
                    >
                      {item.sublabel}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.label.replace(item.sublabel || '', '')}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
}
