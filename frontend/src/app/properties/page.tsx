'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  CircularProgress,
  Pagination,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import { searchProperties } from '@/lib/api';
import { Property, PropertySearchParams } from '@/types';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        // URLパラメータから検索条件を構築
        const params: PropertySearchParams = {
          page,
          limit: 20,
        };

        const stationIds = searchParams.get('station_ids');
        if (stationIds) params.station_ids = stationIds.split(',').map(Number);

        const rentMin = searchParams.get('rent_min');
        if (rentMin) params.rent_min = Number(rentMin);

        const rentMax = searchParams.get('rent_max');
        if (rentMax) params.rent_max = Number(rentMax);

        const floorPlanTypeIds = searchParams.get('floor_plan_type_ids');
        if (floorPlanTypeIds) params.floor_plan_type_ids = floorPlanTypeIds.split(',').map(Number);

        const buildingTypeIds = searchParams.get('building_type_ids');
        if (buildingTypeIds) params.building_type_ids = buildingTypeIds.split(',').map(Number);

        const featureIds = searchParams.get('feature_ids');
        if (featureIds) params.feature_ids = featureIds.split(',').map(Number);

        const walkingMinutes = searchParams.get('walking_minutes');
        if (walkingMinutes) params.walking_minutes = Number(walkingMinutes);

        const areaMin = searchParams.get('area_min');
        if (areaMin) params.area_min = Number(areaMin);

        const areaMax = searchParams.get('area_max');
        if (areaMax) params.area_max = Number(areaMax);

        const buildingAge = searchParams.get('building_age');
        if (buildingAge) params.building_age = Number(buildingAge);

        const keyword = searchParams.get('keyword');
        if (keyword) params.keyword = keyword;

        const sortBy = searchParams.get('sort_by');
        if (sortBy) params.sort_by = sortBy as any;

        const result = await searchProperties(params);
        setProperties(result.properties);
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams, page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          <Typography color="text.primary">物件一覧</Typography>
        </Breadcrumbs>

        {/* 検索結果ヘッダー */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            物件検索結果
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {loading ? '検索中...' : `${total}件の物件が見つかりました`}
          </Typography>
        </Paper>

        {/* ローディング */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 検索結果なし */}
        {!loading && properties.length === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              条件に一致する物件が見つかりませんでした
            </Typography>
            <Typography variant="body2" color="text.secondary">
              検索条件を変更してお試しください
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Link href="/" passHref legacyBehavior>
                <MuiLink>
                  トップページに戻る
                </MuiLink>
              </Link>
            </Box>
          </Paper>
        )}

        {/* 物件一覧 */}
        {!loading && properties.length > 0 && (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </Box>

            {/* ページネーション */}
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
