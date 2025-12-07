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
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Left Section: Logo + Area (25% of width) */}
            <Box
              sx={{
                flex: '0 0 25%',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                pr: 2,
              }}
            >
              {/* Logo */}
              <Link
                href="/"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <Box
                  component="img"
                  src="/suumo-logo.svg"
                  alt="SUUMO"
                  sx={{
                    height: { xs: '55px', md: '70px' },
                    width: 'auto',
                    maxWidth: '100%',
                  }}
                />
              </Link>

              {/* Area Selector (Design Only) */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 0.3,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    fontSize: '0.7rem',
                  }}
                >
                  全国へ
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    color: '#231815',
                    fontSize: '1.1rem',
                    lineHeight: 1,
                  }}
                >
                  関東版
                </Typography>
              </Box>
            </Box>

            {/* Right Section: Category Navigation (75% of width) */}
            <Box
              sx={{
                flex: '0 0 75%',
                display: { xs: 'none', md: 'flex' },
                gap: 0,
                alignItems: 'stretch',
                justifyContent: 'flex-end',
              }}
            >
              {/* Active Category: 借りる > 賃貸 */}
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '110px',
                  borderLeft: '1px solid #E0E0E0',
                }}
              >
                {/* 第1階層: ラベル（小さく控えめ） */}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.7rem',
                    color: '#999',
                    lineHeight: 1.2,
                    mb: 0.8,
                    fontWeight: 400,
                  }}
                >
                  借りる
                </Typography>

                {/* 第2階層: ボタン（大きく目立つ） */}
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#8BC34A',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    px: 2.5,
                    py: 0.6,
                    borderRadius: '3px',
                    textTransform: 'none',
                    minWidth: 'auto',
                    border: '1px solid #7CB342',
                    '&:hover': {
                      bgcolor: '#7CB342',
                      border: '1px solid #689F38',
                    },
                    boxShadow: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  賃貸
                </Button>
              </Box>

              {/* Inactive Categories */}
              {[
                { main: 'マンションを買う', subs: ['新築', '中古'] },
                { main: '一戸建てを買う', subs: ['新築', '中古'] },
                { main: '建てる', subs: ['注文住宅', '土地'] },
                { main: 'リフォームする', subs: ['リフォーム'] },
                { main: '売る', subs: ['売却査定'] },
                { main: '住まいの相談', subs: ['講座/相談'] },
              ].map((category, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: category.subs.length > 1 ? '150px' : '110px',
                    borderLeft: '1px solid #E0E0E0',
                  }}
                >
                  {/* 第1階層: ラベル（小さく控えめ） */}
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.7rem',
                      color: '#999',
                      lineHeight: 1.2,
                      mb: 0.8,
                      fontWeight: 400,
                    }}
                  >
                    {category.main}
                  </Typography>

                  {/* 第2階層: ボタン（大きく目立つ） */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0.8,
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    {category.subs.map((sub, subIndex) => (
                      <Button
                        key={subIndex}
                        variant="outlined"
                        sx={{
                          color: '#666',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          px: 2,
                          py: 0.5,
                          borderRadius: '3px',
                          textTransform: 'none',
                          minWidth: 'auto',
                          border: '1px solid #CCC',
                          bgcolor: 'white',
                          whiteSpace: 'nowrap',
                          '&:hover': {
                            bgcolor: '#F5F5F5',
                            border: '1px solid #999',
                          },
                        }}
                      >
                        {sub}
                      </Button>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
}
