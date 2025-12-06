'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import { getPropertyById, createInquiry } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function InquiryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // フォーム入力
  const [inquiryType, setInquiryType] = useState<'vacancy' | 'viewing' | 'other'>('vacancy');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchProperty = async () => {
      setLoading(true);
      try {
        const data = await getPropertyById(Number(params.id));
        setProperty(data);
      } catch (error) {
        console.error('Failed to fetch property:', error);
        setError('物件情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // バリデーション
    if (!contactName || !contactEmail || !contactPhone) {
      setError('すべての連絡先情報を入力してください');
      setSubmitting(false);
      return;
    }

    if (inquiryType === 'other' && !message) {
      setError('その他の問い合わせの場合は、詳細内容を入力してください');
      setSubmitting(false);
      return;
    }

    try {
      await createInquiry({
        property_id: Number(params.id),
        inquiry_type: inquiryType,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        message: message || undefined,
      });

      setSuccess(true);

      // 3秒後に物件詳細ページに戻る
      setTimeout(() => {
        router.push(`/properties/${params.id}`);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '問い合わせの送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!property) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            物件が見つかりませんでした
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            問い合わせを送信しました
          </Alert>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            お問い合わせありがとうございます
          </Typography>
          <Typography variant="body1" color="text.secondary">
            担当者から折り返しご連絡いたします。
            <br />
            3秒後に物件詳細ページに戻ります...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
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
          <Link href="/properties" passHref legacyBehavior>
            <MuiLink underline="hover" color="inherit">
              物件一覧
            </MuiLink>
          </Link>
          <Link href={`/properties/${params.id}`} passHref legacyBehavior>
            <MuiLink underline="hover" color="inherit">
              {property.title}
            </MuiLink>
          </Link>
          <Typography color="text.primary">問い合わせ</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            物件に問い合わせる
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            以下のフォームに必要事項を入力して送信してください
          </Typography>

          {/* 物件情報サマリー */}
          <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              問い合わせ物件
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {property.title}
            </Typography>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 600, mt: 1 }}>
              賃料: {property.rent.toLocaleString()}円
            </Typography>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* 問い合わせ種別 */}
            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                お問い合わせ内容 <span style={{ color: 'red' }}>*</span>
              </FormLabel>
              <RadioGroup
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value as any)}
              >
                <FormControlLabel
                  value="vacancy"
                  control={<Radio />}
                  label="最新の空室状況を知りたい"
                />
                <FormControlLabel
                  value="viewing"
                  control={<Radio />}
                  label="実際に見学したい"
                />
                <FormControlLabel
                  value="other"
                  control={<Radio />}
                  label="その他の問い合わせ（※詳細記入必須）"
                />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ mb: 3 }} />

            {/* 連絡先情報 */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              連絡先情報
            </Typography>

            <TextField
              label="お名前"
              fullWidth
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="メールアドレス"
              type="email"
              fullWidth
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              sx={{ mb: 2 }}
              helperText="折り返しのご連絡先として使用します"
            />

            <TextField
              label="電話番号"
              fullWidth
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              sx={{ mb: 3 }}
              placeholder="090-1234-5678"
            />

            <Divider sx={{ mb: 3 }} />

            {/* メッセージ */}
            <TextField
              label={inquiryType === 'other' ? '詳細内容（必須）' : '詳細内容（任意）'}
              multiline
              rows={6}
              fullWidth
              required={inquiryType === 'other'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 3 }}
              helperText={
                inquiryType === 'other'
                  ? 'その他の問い合わせを選択した場合は、詳細を必ず記入してください'
                  : 'ご質問やご要望があればご記入ください'
              }
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => router.push(`/properties/${params.id}`)}
                disabled={submitting}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                size="large"
              >
                {submitting ? '送信中...' : '送信する'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
