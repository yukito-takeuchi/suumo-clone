'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
  Box,
  Typography,
  Chip,
  FormGroup,
  InputAdornment,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
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
  Property,
} from '@/types';
import { getImageUrl } from '@/lib/imageUtils';

interface PropertyFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  property?: Property | null;
  mode: 'create' | 'edit';
}

export default function PropertyFormDialog({
  open,
  onClose,
  onSubmit,
  property,
  mode,
}: PropertyFormDialogProps) {
  // Master data
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [floorPlanTypes, setFloorPlanTypes] = useState<FloorPlanType[]>([]);
  const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
  const [features, setFeatures] = useState<PropertyFeature[]>([]);

  // Form data
  const [title, setTitle] = useState('');
  const [prefectureId, setPrefectureId] = useState<number | ''>('');
  const [address, setAddress] = useState('');
  const [rent, setRent] = useState<number | ''>('');
  const [managementFee, setManagementFee] = useState<number | ''>('');
  const [deposit, setDeposit] = useState<number | ''>('');
  const [keyMoney, setKeyMoney] = useState<number | ''>('');
  const [floorPlanTypeId, setFloorPlanTypeId] = useState<number | ''>('');
  const [buildingTypeId, setBuildingTypeId] = useState<number | ''>('');
  const [area, setArea] = useState<number | ''>('');
  const [buildingAge, setBuildingAge] = useState<number | ''>('');
  const [floorNumber, setFloorNumber] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // Store original relative URLs

  // Station data (max 3 stations)
  const [stations, setStations] = useState<
    Array<{
      railwayLines: RailwayLine[];
      stationList: Station[];
      selectedRailwayLine: number | '';
      selectedStation: number | '';
      walkingMinutes: number | '';
    }>
  >([
    { railwayLines: [], stationList: [], selectedRailwayLine: '', selectedStation: '', walkingMinutes: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load master data
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [prefData, floorData, buildData, featData] = await Promise.all([
          getPrefectures(),
          getFloorPlanTypes(),
          getBuildingTypes(),
          getPropertyFeatures(),
        ]);
        setPrefectures(prefData);
        setFloorPlanTypes(floorData);
        setBuildingTypes(buildData);
        setFeatures(featData);
      } catch (err) {
        console.error('Failed to load master data:', err);
      }
    };

    if (open) {
      loadMasterData();
    }
  }, [open]);

  // Load property data for edit mode
  useEffect(() => {
    if (mode === 'edit' && property) {
      setTitle(property.title);
      setPrefectureId(property.prefecture_id);
      setAddress(property.address);
      setRent(property.rent);
      setManagementFee(property.management_fee || '');
      setDeposit(property.deposit || '');
      setKeyMoney(property.key_money || '');
      setFloorPlanTypeId(property.floor_plan_type_id);
      setBuildingTypeId(property.building_type_id);
      setArea(property.area);
      setBuildingAge(property.building_age || '');
      setFloorNumber(property.floor_number || '');
      setDescription(property.description || '');
      setIsPublished(property.is_published);
      setSelectedFeatures(property.features?.map((f) => f.feature_id || f.id) || []);
      // Load existing images
      if (property.images && property.images.length > 0) {
        // Store original relative URLs
        setExistingImageUrls(property.images.map((img) => img.image_url));
        // Store full URLs for preview display
        setImagePreviews(property.images.map((img) => getImageUrl(img.image_url)));
      } else {
        setExistingImageUrls([]);
        setImagePreviews([]);
      }
      setImageFiles([]);
    } else {
      // Reset form for create mode
      resetForm();
    }
  }, [mode, property, open]);

  const resetForm = () => {
    setTitle('');
    setPrefectureId('');
    setAddress('');
    setRent('');
    setManagementFee('');
    setDeposit('');
    setKeyMoney('');
    setFloorPlanTypeId('');
    setBuildingTypeId('');
    setArea('');
    setBuildingAge('');
    setFloorNumber('');
    setDescription('');
    setIsPublished(true);
    setSelectedFeatures([]);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImageUrls([]);
    setStations([
      { railwayLines: [], stationList: [], selectedRailwayLine: '', selectedStation: '', walkingMinutes: '' },
    ]);
    setError('');
  };

  const handlePrefectureChange = async (index: number, prefId: number) => {
    try {
      const lines = await getRailwayLines(prefId);
      const newStations = [...stations];
      newStations[index] = {
        ...newStations[index],
        railwayLines: lines,
        stationList: [],
        selectedRailwayLine: '',
        selectedStation: '',
      };
      setStations(newStations);
    } catch (err) {
      console.error('Failed to load railway lines:', err);
    }
  };

  const handleRailwayLineChange = async (index: number, lineId: number) => {
    try {
      const stationList = await getStations(lineId);
      const newStations = [...stations];
      newStations[index] = {
        ...newStations[index],
        selectedRailwayLine: lineId,
        stationList,
        selectedStation: '',
      };
      setStations(newStations);
    } catch (err) {
      console.error('Failed to load stations:', err);
    }
  };

  const addStation = () => {
    if (stations.length < 3) {
      setStations([
        ...stations,
        { railwayLines: [], stationList: [], selectedRailwayLine: '', selectedStation: '', walkingMinutes: '' },
      ]);
    }
  };

  const removeStation = (index: number) => {
    setStations(stations.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles([...imageFiles, ...files]);

      // Create previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    // Check if this is an existing image or new image
    const existingImageCount = existingImageUrls.length;

    if (index < existingImageCount) {
      // Removing an existing image
      setExistingImageUrls(existingImageUrls.filter((_, i) => i !== index));
    } else {
      // Removing a newly added image
      const newImageIndex = index - existingImageCount;
      setImageFiles(imageFiles.filter((_, i) => i !== newImageIndex));
    }

    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!title || !prefectureId || !address || !rent || !floorPlanTypeId || !buildingTypeId || !area) {
        setError('必須項目を入力してください');
        setLoading(false);
        return;
      }

      // Prepare station data
      const stationData = stations
        .filter((s) => s.selectedStation && s.walkingMinutes)
        .map((s) => ({
          station_id: s.selectedStation,
          walking_minutes: s.walkingMinutes,
        }));

      // Prepare images: combine existing URLs and new base64 images
      const newBase64Images = imagePreviews.slice(existingImageUrls.length);
      const allImages = [...existingImageUrls, ...newBase64Images];

      const formData = {
        title,
        prefecture_id: prefectureId,
        address,
        rent,
        management_fee: managementFee || null,
        deposit: deposit || null,
        key_money: keyMoney || null,
        floor_plan_type_id: floorPlanTypeId,
        building_type_id: buildingTypeId,
        area,
        building_age: buildingAge || null,
        floor_number: floorNumber || null,
        description: description || null,
        is_published: isPublished,
        stations: stationData,
        feature_ids: selectedFeatures,
        images: allImages, // Existing relative URLs + new base64 images
      };

      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || '保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? '新規物件登録' : '物件編集'}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Basic Info */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              基本情報
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="物件名"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>都道府県</InputLabel>
              <Select
                value={prefectureId}
                label="都道府県"
                onChange={(e) => setPrefectureId(e.target.value as number)}
              >
                {prefectures.map((pref) => (
                  <MenuItem key={pref.id} value={pref.id}>
                    {pref.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="住所"
              fullWidth
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="賃料"
              type="number"
              fullWidth
              required
              value={rent}
              onChange={(e) => setRent(Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">円</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="管理費"
              type="number"
              fullWidth
              value={managementFee}
              onChange={(e) => setManagementFee(Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">円</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="敷金"
              type="number"
              fullWidth
              value={deposit}
              onChange={(e) => setDeposit(Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">円</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="礼金"
              type="number"
              fullWidth
              value={keyMoney}
              onChange={(e) => setKeyMoney(Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">円</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>間取り</InputLabel>
              <Select
                value={floorPlanTypeId}
                label="間取り"
                onChange={(e) => setFloorPlanTypeId(e.target.value as number)}
              >
                {floorPlanTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>建物種別</InputLabel>
              <Select
                value={buildingTypeId}
                label="建物種別"
                onChange={(e) => setBuildingTypeId(e.target.value as number)}
              >
                {buildingTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="専有面積"
              type="number"
              fullWidth
              required
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">m²</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="築年数"
              type="number"
              fullWidth
              value={buildingAge}
              onChange={(e) => setBuildingAge(Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">年</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="階数"
              type="number"
              fullWidth
              value={floorNumber}
              onChange={(e) => setFloorNumber(Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">階</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="物件説明"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>

          {/* Station Info */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="h6">駅情報（最大3駅）</Typography>
              {stations.length < 3 && (
                <Button size="small" onClick={addStation}>
                  駅を追加
                </Button>
              )}
            </Box>
          </Grid>

          {stations.map((station, index) => (
            <Grid item xs={12} key={index}>
              <Box sx={{ p: 2, border: '1px solid #E0E0E0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">駅 {index + 1}</Typography>
                  {stations.length > 1 && (
                    <IconButton size="small" onClick={() => removeStation(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>都道府県</InputLabel>
                      <Select
                        value={station.selectedRailwayLine ? prefectureId : ''}
                        label="都道府県"
                        onChange={(e) => handlePrefectureChange(index, e.target.value as number)}
                      >
                        {prefectures.map((pref) => (
                          <MenuItem key={pref.id} value={pref.id}>
                            {pref.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>沿線</InputLabel>
                      <Select
                        value={station.selectedRailwayLine}
                        label="沿線"
                        onChange={(e) => handleRailwayLineChange(index, e.target.value as number)}
                        disabled={!station.railwayLines.length}
                      >
                        {station.railwayLines.map((line) => (
                          <MenuItem key={line.id} value={line.id}>
                            {line.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>駅</InputLabel>
                      <Select
                        value={station.selectedStation}
                        label="駅"
                        onChange={(e) => {
                          const newStations = [...stations];
                          newStations[index].selectedStation = e.target.value as number;
                          setStations(newStations);
                        }}
                        disabled={!station.stationList.length}
                      >
                        {station.stationList.map((st) => (
                          <MenuItem key={st.id} value={st.id}>
                            {st.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="徒歩分数"
                      type="number"
                      fullWidth
                      size="small"
                      value={station.walkingMinutes}
                      onChange={(e) => {
                        const newStations = [...stations];
                        newStations[index].walkingMinutes = Number(e.target.value);
                        setStations(newStations);
                      }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">分</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          ))}

          {/* Features */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              こだわり条件
            </Typography>
            <FormGroup row>
              {features.map((feature) => (
                <FormControlLabel
                  key={feature.id}
                  control={
                    <Checkbox
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFeatures([...selectedFeatures, feature.id]);
                        } else {
                          setSelectedFeatures(selectedFeatures.filter((id) => id !== feature.id));
                        }
                      }}
                    />
                  }
                  label={feature.name}
                />
              ))}
            </FormGroup>
          </Grid>

          {/* Images */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              物件画像
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AddPhotoAlternateIcon />}
            >
              画像を追加
              <input
                type="file"
                hidden
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
            </Button>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              {imagePreviews.map((preview, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'white',
                    }}
                    onClick={() => removeImage(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Published */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
              }
              label="公開する"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? '保存中...' : mode === 'create' ? '作成' : '更新'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
