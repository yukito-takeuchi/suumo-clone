'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Card,
  CardContent,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getCorporateInquiryById, updateInquiryStatus } from '@/lib/api';
import { Inquiry } from '@/types';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';

export default function CorporateInquiryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'unread' | 'read' | 'responded'>('read');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'corporate')) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.role === 'corporate') {
      fetchInquiry();
    }
  }, [authLoading, isAuthenticated, user, params.id, router]);

  const fetchInquiry = async () => {
    setLoading(true);
    try {
      const data = await getCorporateInquiryById(Number(params.id));
      setInquiry(data);
      setSelectedStatus(data.status as 'unread' | 'read' | 'responded');
    } catch (error) {
      console.error('Failed to fetch inquiry:', error);
      setError('問い合わせの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateInquiryStatus(Number(params.id), selectedStatus);
      setInquiry(updated);
      setSuccess('ステータスを更新しました');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'ステータスの更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'unread':
        return '未読';
      case 'read':
        return '既読';
      case 'responded':
        return '対応済';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): 'error' | 'warning' | 'success' | 'default' => {
    switch (status) {
      case 'unread':
        return 'error';
      case 'read':
        return 'warning';
      case 'responded':
        return 'success';
      default:
        return 'default';
    }
  };

  const getInquiryTypeLabel = (type: string) => {
    switch (type) {
      case 'vacancy':
        return '最新の空室状況を知りたい';
      case 'viewing':
        return '実際に見学したい';
      case 'other':
        return 'その他の問い合わせ';
      default:
        return type;
    }
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || user?.role !== 'corporate') {
    return null;
  }

  if (!inquiry) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="lg">
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              問い合わせが見つかりませんでした
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        {/* パンくずリスト */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link href="/" passHref legacyBehavior>
            <MuiLink underline="hover" color="inherit">
              トップ
            </MuiLink>
          </Link>
          <Link href="/corporate/inquiries" passHref legacyBehavior>
            <MuiLink underline="hover" color="inherit">
              問い合わせ管理
            </MuiLink>
          </Link>
          <Typography color="text.primary">問い合わせ詳細</Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          問い合わせ詳細
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: { md: 2 } }}>
            {/* 問い合わせ内容 */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Chip
                  label={getStatusLabel(inquiry.status)}
                  color={getStatusColor(inquiry.status)}
                />
              </Box>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                受信日時
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {new Date(inquiry.created_at).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                問い合わせ内容
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                {inquiry.message || '（メッセージなし）'}
              </Typography>
            </Paper>

            {/* 対象物件 */}
            {inquiry.property_title && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <HomeIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      対象物件
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      label={`賃貸${inquiry.building_type_name || ''}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={inquiry.floor_plan_type_name || ''}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {inquiry.property_title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {inquiry.prefecture_name} {inquiry.property_address}
                  </Typography>
                  <Typography variant="body1" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                    賃料: {inquiry.property_rent?.toLocaleString()}円 / 管理費: {inquiry.property_management_fee?.toLocaleString() || 0}円
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    専有面積: {inquiry.area}㎡ / 築{inquiry.building_age}年
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => router.push(`/properties/${inquiry.property_id}`)}
                  >
                    物件詳細を見る
                  </Button>
                </CardContent>
              </Card>
            )}
          </Box>

          <Box sx={{ flex: { md: 1 } }}>
            {/* ステータス更新 */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                ステータス管理
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>ステータス</InputLabel>
                <Select
                  value={selectedStatus}
                  label="ステータス"
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                >
                  <MenuItem value="unread">未読</MenuItem>
                  <MenuItem value="read">既読</MenuItem>
                  <MenuItem value="responded">対応済</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                fullWidth
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === inquiry.status}
              >
                {updating ? '更新中...' : 'ステータスを更新'}
              </Button>
            </Paper>

            {/* 連絡先情報 */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                連絡先情報
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" color="text.secondary">
                    お名前
                  </Typography>
                </Box>
                <Typography variant="body1">{inquiry.contact_name}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" color="text.secondary">
                    メールアドレス
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  <a href={`mailto:${inquiry.contact_email}`} style={{ color: 'inherit' }}>
                    {inquiry.contact_email}
                  </a>
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" color="text.secondary">
                    電話番号
                  </Typography>
                </Box>
                <Typography variant="body1">
                  <a href={`tel:${inquiry.contact_phone}`} style={{ color: 'inherit' }}>
                    {inquiry.contact_phone}
                  </a>
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
