'use client';

import { Container, Box, Typography } from '@mui/material';
import SearchForm from '@/components/SearchForm';

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            あなたにピッタリの賃貸物件を探そう
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            豊富な検索条件で理想の物件が見つかる
          </Typography>
        </Box>

        <SearchForm />

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            現在 30 件の物件が登録されています
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
