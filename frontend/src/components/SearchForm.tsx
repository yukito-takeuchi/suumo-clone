'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Paper,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';
import {
  getPrefectures,
  getRailwayLines,
  getStations,
  getFloorPlanTypes,
  getBuildingTypes,
  getPropertyFeatures,
} from '@/lib/api';
import {
  Prefecture,
  RailwayLine,
  Station,
  FloorPlanType,
  BuildingType,
  PropertyFeature,
} from '@/types';

export default function SearchForm() {
  const router = useRouter();

  // マスターデータ
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [railwayLines, setRailwayLines] = useState<RailwayLine[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [floorPlanTypes, setFloorPlanTypes] = useState<FloorPlanType[]>([]);
  const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
  const [features, setFeatures] = useState<PropertyFeature[]>([]);

  // 検索条件
  const [selectedPrefecture, setSelectedPrefecture] = useState<number | ''>('');
  const [selectedRailwayLine, setSelectedRailwayLine] = useState<number | ''>('');
  const [selectedStations, setSelectedStations] = useState<number[]>([]);
  const [rentMin, setRentMin] = useState<string>('');
  const [rentMax, setRentMax] = useState<string>('');
  const [selectedFloorPlans, setSelectedFloorPlans] = useState<number[]>([]);
  const [selectedBuildingTypes, setSelectedBuildingTypes] = useState<number[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);

  // マスターデータ取得
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [prefs, floorPlans, buildings, feats] = await Promise.all([
          getPrefectures(),
          getFloorPlanTypes(),
          getBuildingTypes(),
          getPropertyFeatures(),
        ]);
        setPrefectures(prefs);
        setFloorPlanTypes(floorPlans);
        setBuildingTypes(buildings);
        setFeatures(feats);
      } catch (error) {
        console.error('Failed to fetch master data:', error);
      }
    };
    fetchMasterData();
  }, []);

  // 都道府県変更時
  useEffect(() => {
    if (selectedPrefecture) {
      getRailwayLines(selectedPrefecture as number).then(setRailwayLines);
      setSelectedRailwayLine('');
      setStations([]);
      setSelectedStations([]);
    }
  }, [selectedPrefecture]);

  // 沿線変更時
  useEffect(() => {
    if (selectedRailwayLine) {
      getStations(selectedRailwayLine as number).then(setStations);
      setSelectedStations([]);
    }
  }, [selectedRailwayLine]);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selectedStations.length > 0) {
      params.append('station_ids', selectedStations.join(','));
    }
    if (rentMin) params.append('rent_min', rentMin);
    if (rentMax) params.append('rent_max', rentMax);
    if (selectedFloorPlans.length > 0) {
      params.append('floor_plan_type_ids', selectedFloorPlans.join(','));
    }
    if (selectedBuildingTypes.length > 0) {
      params.append('building_type_ids', selectedBuildingTypes.join(','));
    }
    if (selectedFeatures.length > 0) {
      params.append('feature_ids', selectedFeatures.join(','));
    }

    router.push(`/properties?${params.toString()}`);
  };

  const handleFloorPlansChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setSelectedFloorPlans(typeof value === 'string' ? [] : value);
  };

  const handleBuildingTypesChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setSelectedBuildingTypes(typeof value === 'string' ? [] : value);
  };

  const handleStationsChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setSelectedStations(typeof value === 'string' ? [] : value);
  };

  const handleFeaturesChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setSelectedFeatures(typeof value === 'string' ? [] : value);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        賃貸物件を探す
      </Typography>

      <Grid container spacing={3}>
        {/* 都道府県 */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>都道府県</InputLabel>
            <Select
              value={selectedPrefecture}
              label="都道府県"
              onChange={(e) => setSelectedPrefecture(e.target.value as number)}
            >
              <MenuItem value="">選択してください</MenuItem>
              {prefectures.map((pref) => (
                <MenuItem key={pref.id} value={pref.id}>
                  {pref.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 沿線 */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth disabled={!selectedPrefecture}>
            <InputLabel>沿線</InputLabel>
            <Select
              value={selectedRailwayLine}
              label="沿線"
              onChange={(e) => setSelectedRailwayLine(e.target.value as number)}
            >
              <MenuItem value="">選択してください</MenuItem>
              {railwayLines.map((line) => (
                <MenuItem key={line.id} value={line.id}>
                  {line.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 駅 */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth disabled={!selectedRailwayLine}>
            <InputLabel>駅（複数選択可）</InputLabel>
            <Select
              multiple
              value={selectedStations}
              label="駅（複数選択可）"
              onChange={handleStationsChange}
              input={<OutlinedInput label="駅（複数選択可）" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const station = stations.find((s) => s.id === value);
                    return <Chip key={value} label={station?.name} size="small" />;
                  })}
                </Box>
              )}
            >
              {stations.map((station) => (
                <MenuItem key={station.id} value={station.id}>
                  {station.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 賃料 */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              fullWidth
              label="賃料（下限）"
              type="number"
              value={rentMin}
              onChange={(e) => setRentMin(e.target.value)}
              InputProps={{ endAdornment: '円' }}
            />
            <Typography>〜</Typography>
            <TextField
              fullWidth
              label="賃料（上限）"
              type="number"
              value={rentMax}
              onChange={(e) => setRentMax(e.target.value)}
              InputProps={{ endAdornment: '円' }}
            />
          </Box>
        </Grid>

        {/* 間取り */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>間取り（複数選択可）</InputLabel>
            <Select
              multiple
              value={selectedFloorPlans}
              label="間取り（複数選択可）"
              onChange={handleFloorPlansChange}
              input={<OutlinedInput label="間取り（複数選択可）" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const plan = floorPlanTypes.find((p) => p.id === value);
                    return <Chip key={value} label={plan?.name} size="small" />;
                  })}
                </Box>
              )}
            >
              {floorPlanTypes.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 建物種類 */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>建物種類（複数選択可）</InputLabel>
            <Select
              multiple
              value={selectedBuildingTypes}
              label="建物種類（複数選択可）"
              onChange={handleBuildingTypesChange}
              input={<OutlinedInput label="建物種類（複数選択可）" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const building = buildingTypes.find((b) => b.id === value);
                    return <Chip key={value} label={building?.name} size="small" />;
                  })}
                </Box>
              )}
            >
              {buildingTypes.map((building) => (
                <MenuItem key={building.id} value={building.id}>
                  {building.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* こだわり条件 */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>こだわり条件（複数選択可）</InputLabel>
            <Select
              multiple
              value={selectedFeatures}
              label="こだわり条件（複数選択可）"
              onChange={handleFeaturesChange}
              input={<OutlinedInput label="こだわり条件（複数選択可）" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const feature = features.find((f) => f.id === value);
                    return <Chip key={value} label={feature?.name} size="small" />;
                  })}
                </Box>
              )}
            >
              {features.map((feature) => (
                <MenuItem key={feature.id} value={feature.id}>
                  {feature.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 検索ボタン */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ py: 1.5, fontSize: '1.1rem' }}
          >
            この条件で検索
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
