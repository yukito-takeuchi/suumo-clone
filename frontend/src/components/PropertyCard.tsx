'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import Link from 'next/link';
import { Property } from '@/types';
import TrainIcon from '@mui/icons-material/Train';
import HomeIcon from '@mui/icons-material/Home';
import SquareFootIcon from '@mui/icons-material/SquareFoot';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.images?.[0]?.image_url || '/images/no-image.png';

  return (
    <Link href={`/properties/${property.id}`} style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          },
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={mainImage}
          alt={property.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          {/* 賃料 */}
          <Typography
            variant="h5"
            color="primary"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            {property.rent.toLocaleString()}円
          </Typography>

          {/* 物件タイトル */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '3em',
            }}
          >
            {property.title}
          </Typography>

          {/* 住所 */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {property.prefecture?.name} {property.address}
          </Typography>

          {/* 駅情報 */}
          {property.stations && property.stations.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {property.stations.slice(0, 2).map((ps, index) => (
                <Box
                  key={index}
                  sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
                >
                  <TrainIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {ps.railway_line_name} {ps.station_name} 徒歩{ps.walking_minutes}分
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* 物件詳細 */}
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip
              icon={<HomeIcon />}
              label={property.floor_plan_type?.name}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<SquareFootIcon />}
              label={`${property.area}m²`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={property.building_type?.name}
              size="small"
              variant="outlined"
            />
            {property.building_age && (
              <Chip
                label={`築${property.building_age}年`}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
}
