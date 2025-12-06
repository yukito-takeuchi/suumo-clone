'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Pagination,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getCorporateInquiries } from '@/lib/api';
import { Inquiry } from '@/types';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MailIcon from '@mui/icons-material/Mail';

export default function CorporateInquiriesPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'corporate')) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.role === 'corporate') {
      fetchInquiries();
    }
  }, [authLoading, isAuthenticated, user, page, statusFilter, router]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const result = await getCorporateInquiries(page, 20, statusFilter || undefined);
      setInquiries(result.inquiries);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setStatusFilter(newValue);
    setPage(1);
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
        return '空室確認';
      case 'viewing':
        return '見学希望';
      case 'other':
        return 'その他';
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            問い合わせ管理
          </Typography>
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={statusFilter}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="すべて" value="" />
            <Tab label="未読" value="unread" />
            <Tab label="既読" value="read" />
            <Tab label="対応済" value="responded" />
          </Tabs>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            問い合わせ件数: {total}件
          </Typography>
        </Paper>

        {inquiries.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <MailIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              問い合わせがありません
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {statusFilter ? '該当するステータスの問い合わせがありません' : '問い合わせを受信すると、ここに表示されます'}
            </Typography>
          </Paper>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600 }}>ステータス</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>種別</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>物件名</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>お名前</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>メール</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>電話番号</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>受信日時</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id} hover>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(inquiry.status)}
                          color={getStatusColor(inquiry.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getInquiryTypeLabel(inquiry.inquiry_type)}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {inquiry.property?.title || '物件情報なし'}
                        </Typography>
                      </TableCell>
                      <TableCell>{inquiry.contact_name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {inquiry.contact_email}
                        </Typography>
                      </TableCell>
                      <TableCell>{inquiry.contact_phone}</TableCell>
                      <TableCell>
                        {new Date(inquiry.created_at).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="詳細">
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/corporate/inquiries/${inquiry.id}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
