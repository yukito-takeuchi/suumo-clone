'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Stack,
  ImageList,
  ImageListItem,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import { getPropertyById } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/lib/imageUtils';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TrainIcon from '@mui/icons-material/Train';
import HomeIcon from '@mui/icons-material/Home';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        console.log('Fetching property with ID:', params.id);
        const data = await getPropertyById(Number(params.id));
        console.log('Property data received:', data);
        setProperty(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0].image_url);
        }
      } catch (error) {
        console.error('Failed to fetch property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id]);

  const handleInquiry = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/properties/${params.id}/inquiry`);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!property) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="lg">
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              物件が見つかりませんでした
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
          <Link href="/properties" passHref legacyBehavior>
            <MuiLink underline="hover" color="inherit">
              物件一覧
            </MuiLink>
          </Link>
          <Typography color="text.primary">{property.title}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* 左カラム: 画像 */}
          <Box sx={{ flex: { md: 2 } }}>
            <Paper sx={{ p: 0, overflow: 'hidden' }}>
              {/* メイン画像 */}
              <Box
                component="img"
                src={selectedImage ? getImageUrl(selectedImage) : '/images/no-image.png'}
                alt={property.title}
                sx={{
                  width: '100%',
                  height: 500,
                  objectFit: 'cover',
                }}
              />

              {/* サムネイル画像リスト */}
              {property.images && property.images.length > 1 && (
                <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                  <ImageList cols={5} gap={8} sx={{ margin: 0 }}>
                    {property.images.map((image, index) => (
                      <ImageListItem
                        key={index}
                        sx={{
                          cursor: 'pointer',
                          border:
                            selectedImage === image.image_url
                              ? '3px solid'
                              : '1px solid',
                          borderColor:
                            selectedImage === image.image_url
                              ? 'primary.main'
                              : 'divider',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                        onClick={() => setSelectedImage(image.image_url)}
                      >
                        <img
                          src={getImageUrl(image.image_url)}
                          alt={`${property.title} ${index + 1}`}
                          style={{ width: '100%', height: 80, objectFit: 'cover' }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
            </Paper>

            {/* 物件詳細情報 */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                物件詳細
              </Typography>

              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: '30%' }}>賃料</TableCell>
                    <TableCell>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                        {property.rent.toLocaleString()}円
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>管理費</TableCell>
                    <TableCell>{property.management_fee?.toLocaleString() || 0}円</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>敷金</TableCell>
                    <TableCell>{property.deposit?.toLocaleString() || 0}円</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>礼金</TableCell>
                    <TableCell>{property.key_money?.toLocaleString() || 0}円</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>間取り</TableCell>
                    <TableCell>{property.floor_plan_type?.name || property.floor_plan_type_name || property.floor_plan_name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>専有面積</TableCell>
                    <TableCell>{property.area}m²</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>建物種別</TableCell>
                    <TableCell>{property.building_type?.name || property.building_type_name}</TableCell>
                  </TableRow>
                  {property.building_age && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>築年数</TableCell>
                      <TableCell>築{property.building_age}年</TableCell>
                    </TableRow>
                  )}
                  {property.floor_number && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>階数</TableCell>
                      <TableCell>{property.floor_number}階</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                住所・アクセス
              </Typography>

              <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOnIcon color="action" />
                <Typography>
                  {property.prefecture?.name || property.prefecture_name} {property.address}
                </Typography>
              </Box>

              {property.stations && property.stations.length > 0 && (
                <Box>
                  {property.stations.map((ps, index) => (
                    <Box
                      key={index}
                      sx={{ display: 'flex', alignItems: 'center', mb: 1, ml: 4 }}
                    >
                      <TrainIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                      <Typography>
                        {ps.railway_line_name} {ps.name || ps.station_name} 徒歩{ps.walking_minutes}分
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* こだわり条件 */}
              {property.features && property.features.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    こだわり条件
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {property.features.map((feature, index) => (
                      <Chip key={index} label={feature.feature_name || feature.name} color="primary" variant="outlined" />
                    ))}
                  </Stack>
                  <Divider sx={{ my: 3 }} />
                </>
              )}

              {/* 物件説明 */}
              {property.description && (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    物件説明
                  </Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    {property.description}
                  </Typography>
                </>
              )}
            </Paper>
          </Box>

          {/* 右カラム: 物件情報サマリー・問い合わせボタン */}
          <Box sx={{ flex: { md: 1 } }}>
            <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {property.title}
              </Typography>

              <Typography
                variant="h4"
                color="primary"
                sx={{ fontWeight: 700, mb: 2 }}
              >
                {property.rent.toLocaleString()}円
              </Typography>

              <Stack spacing={1.5} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {property.floor_plan_type?.name || property.floor_plan_type_name || property.floor_plan_name} / {property.building_type?.name || property.building_type_name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SquareFootIcon fontSize="small" color="action" />
                  <Typography variant="body2">{property.area}m²</Typography>
                </Box>
                {property.building_age && (
                  <Typography variant="body2" color="text.secondary">
                    築{property.building_age}年
                  </Typography>
                )}
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleInquiry}
                sx={{ mb: 2 }}
              >
                この物件に問い合わせる
              </Button>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                {isAuthenticated
                  ? '問い合わせフォームに進みます'
                  : 'ログインが必要です'}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
