'use client';

import React, { useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            {user.role === 'individual' ? (
              <PersonIcon sx={{ fontSize: 48, mr: 2, color: 'primary.main' }} />
            ) : (
              <BusinessIcon sx={{ fontSize: 48, mr: 2, color: 'primary.main' }} />
            )}
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                プロフィール
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.role === 'individual' ? '個人ユーザー' : '企業ユーザー'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <List>
            <ListItem>
              <ListItemText
                primary="ユーザーID"
                secondary={user.id}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Firebase UID"
                secondary={user.firebaseUid}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary="メールアドレス"
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" />
                    {user.email}
                  </Box>
                }
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>

            {profile && user.role === 'individual' && 'name' in profile && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, px: 2, mb: 1 }}>
                  個人情報
                </Typography>
                <ListItem>
                  <ListItemText
                    primary="氏名"
                    secondary={profile.name || '未設定'}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="電話番号"
                    secondary={profile.phone || '未設定'}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
              </>
            )}

            {profile && user.role === 'corporate' && 'company_name' in profile && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, px: 2, mb: 1 }}>
                  企業情報
                </Typography>
                <ListItem>
                  <ListItemText
                    primary="企業名"
                    secondary={profile.company_name || '未設定'}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="担当者名"
                    secondary={profile.contact_name || '未設定'}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="電話番号"
                    secondary={profile.phone || '未設定'}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
              </>
            )}
          </List>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="error" onClick={handleLogout}>
              ログアウト
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
