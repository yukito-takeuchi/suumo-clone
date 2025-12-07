'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Pagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCorporateProperties } from '@/lib/api';
import { Property } from '@/types';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PropertyFormDialog from '@/components/PropertyFormDialog';
import axios from '@/lib/axios';

export default function CorporatePropertiesPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'corporate')) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user?.role === 'corporate') {
      fetchProperties();
    }
  }, [authLoading, isAuthenticated, user, page, router]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const result = await getMyCorporateProperties(page, 20);
      setProperties(result.properties);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateClick = () => {
    setDialogMode('create');
    setSelectedProperty(null);
    setDialogOpen(true);
  };

  const handleEditClick = (property: Property) => {
    setDialogMode('edit');
    setSelectedProperty(property);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedProperty(null);
  };

  const handlePropertySubmit = async (data: any) => {
    try {
      if (dialogMode === 'create') {
        await axios.post('/corporate/properties', data);
      } else {
        await axios.put(`/corporate/properties/${selectedProperty?.id}`, data);
      }
      await fetchProperties();
    } catch (error) {
      throw error;
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
            物件管理
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            新規物件登録
          </Button>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            登録物件数: {total}件
          </Typography>
        </Paper>

        {properties.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              登録されている物件がありません
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              新規物件登録ボタンから物件を登録してください
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              新規物件登録
            </Button>
          </Paper>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600 }}>物件名</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>賃料</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>間取り</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>住所</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>公開状態</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>登録日</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id} hover>
                      <TableCell>{property.title}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {property.rent.toLocaleString()}円
                        </Typography>
                      </TableCell>
                      <TableCell>{property.floor_plan_type?.name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {property.prefecture?.name} {property.address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={property.is_published ? '公開中' : '非公開'}
                          color={property.is_published ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(property.created_at).toLocaleDateString('ja-JP')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="詳細">
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/properties/${property.id}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="編集">
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(property)}
                            >
                              <EditIcon fontSize="small" />
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

        {/* Property Form Dialog */}
        <PropertyFormDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          onSubmit={handlePropertySubmit}
          property={selectedProperty}
          mode={dialogMode}
        />
      </Container>
    </Box>
  );
}
