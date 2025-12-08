'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import Link from 'next/link';
import { Property } from '@/types';
import { getImageUrl } from '@/lib/imageUtils';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.images?.[0]?.image_url
    ? getImageUrl(property.images[0].image_url)
    : '/images/no-image.png';

  // 駅情報の整形
  const stationInfo = property.stations?.[0]
    ? `${property.stations[0].railway_line_name}/${property.stations[0].station_name} 歩${property.stations[0].walking_minutes}分`
    : '';

  return (
    <Link href={`/properties/${property.id}`} style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
      <Card
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        }}
      >
        {/* 上段：物件（建物情報） */}
        <Box sx={{ display: 'flex', p: 2, gap: 2 }}>
          {/* 左：画像 */}
          <Box
            component="img"
            src={mainImage}
            alt={property.title}
            sx={{
              maxWidth: 200,
              height: 'auto',
              borderRadius: 1,
              flexShrink: 0,
            }}
          />

          {/* 右：建物情報 */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* カテゴリ */}
            <Chip
              label={`賃貸${property.building_type?.name || 'マンション'}`}
              size="small"
              sx={{ width: 'fit-content', bgcolor: 'grey.100' }}
            />

            {/* 物件名 */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.25rem',
              }}
            >
              {property.title}
            </Typography>

            {/* 住所 | 駅情報 | 建物情報（枠線付き3分割） */}
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
                bgcolor: 'grey.50',
                display: 'flex',
                minHeight: 60,
              }}
            >
              {/* 住所 */}
              <Box sx={{ px: 1.5, py: 0.75, flex: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {property.prefecture?.name} {property.address}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem />

              {/* 駅情報 */}
              <Box sx={{ px: 1.5, py: 0.75, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {property.stations && property.stations.length > 0 ? (
                  property.stations.slice(0, 3).map((ps, index) => (
                    <Typography key={index} variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {ps.railway_line_name}/{ps.station_name} 歩{ps.walking_minutes}分
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">-</Typography>
                )}
              </Box>

              <Divider orientation="vertical" flexItem />

              {/* 建物情報 */}
              <Box sx={{ px: 1.5, py: 0.75, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {property.building_age && (
                  <Typography variant="body2" color="text.secondary">
                    築{property.building_age}年
                  </Typography>
                )}
                {property.floor_number && (
                  <Typography variant="body2" color="text.secondary">
                    {property.floor_number}階建
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* 下段：号室 */}
        <Box sx={{ display: 'flex', p: 2, gap: 2, bgcolor: 'grey.50' }}>
          {/* 左：画像 */}
          <Box
            component="img"
            src={mainImage}
            alt={property.title}
            sx={{
              maxWidth: 120,
              height: 'auto',
              borderRadius: 1,
              flexShrink: 0,
            }}
          />

          {/* 右：号室情報（テーブル形式） */}
          <Box sx={{ flex: 1 }}>
            {/* カテゴリラベル（1行目） */}
            <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'grey.300', pb: 0.5, mb: 0.5 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  階
                </Typography>
              </Box>
              <Box sx={{ flex: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  賃料/管理費
                </Typography>
              </Box>
              <Box sx={{ flex: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  敷金/礼金
                </Typography>
              </Box>
              <Box sx={{ flex: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  間取り/専有面積
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  お気に入り
                </Typography>
              </Box>
            </Box>

            {/* 情報（2行目） */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  {property.floor_number ? `${property.floor_number}階` : '-'}
                </Typography>
              </Box>
              <Box sx={{ flex: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {property.rent.toLocaleString()}円
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  管理費 {property.management_fee?.toLocaleString() || 0}円
                </Typography>
              </Box>
              <Box sx={{ flex: 2 }}>
                <Typography variant="body2">
                  敷金 {property.deposit ? `${(property.deposit / property.rent).toFixed(1)}ヶ月` : '-'}
                </Typography>
                <Typography variant="body2">
                  礼金 {property.key_money ? `${(property.key_money / property.rent).toFixed(1)}ヶ月` : '-'}
                </Typography>
              </Box>
              <Box sx={{ flex: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {property.floor_plan_type?.name}
                </Typography>
                <Typography variant="body2">
                  {property.area}m²
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    // お気に入り機能は未実装
                  }}
                >
                  <FavoriteBorderIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>
    </Link>
  );
}
