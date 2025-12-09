import axios from './axios';
import {
  ApiResponse,
  Property,
  PropertySearchParams,
  PropertySearchResult,
  Prefecture,
  RailwayLine,
  Station,
  FloorPlanType,
  BuildingType,
  PropertyFeature,
  CreateInquiryParams,
  Inquiry,
} from '@/types';

// マスターデータ取得
export const getPrefectures = async (): Promise<Prefecture[]> => {
  const response = await axios.get<ApiResponse<Prefecture[]>>('/prefectures');
  return response.data.data || [];
};

export const getRailwayLines = async (prefectureId?: number): Promise<RailwayLine[]> => {
  const params = prefectureId ? { prefecture_id: prefectureId } : {};
  const response = await axios.get<ApiResponse<RailwayLine[]>>('/railway-lines', { params });
  return response.data.data || [];
};

export const getStations = async (railwayLineId?: number): Promise<Station[]> => {
  const params = railwayLineId ? { railway_line_id: railwayLineId } : {};
  const response = await axios.get<ApiResponse<Station[]>>('/stations', { params });
  return response.data.data || [];
};

export const getFloorPlanTypes = async (): Promise<FloorPlanType[]> => {
  const response = await axios.get<ApiResponse<FloorPlanType[]>>('/floor-plans');
  return response.data.data || [];
};

export const getBuildingTypes = async (): Promise<BuildingType[]> => {
  const response = await axios.get<ApiResponse<BuildingType[]>>('/building-types');
  return response.data.data || [];
};

export const getPropertyFeatures = async (): Promise<PropertyFeature[]> => {
  const response = await axios.get<ApiResponse<PropertyFeature[]>>('/features');
  return response.data.data || [];
};

// 物件検索
export const searchProperties = async (
  params: PropertySearchParams
): Promise<PropertySearchResult> => {
  const response = await axios.get<ApiResponse<any>>('/properties', { params });
  const data = response.data.data;

  if (!data) {
    return { properties: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }

  // バックエンドのフラット構造をネスト構造に変換
  return {
    properties: data.properties || [],
    pagination: {
      page: data.page || 1,
      limit: data.limit || 20,
      total: data.total || 0,
      totalPages: data.totalPages || 0,
    },
  };
};

// 物件詳細取得
export const getPropertyById = async (id: number): Promise<Property> => {
  const response = await axios.get<ApiResponse<Property>>(`/properties/${id}`);
  if (!response.data.data) {
    throw new Error('Property not found');
  }
  return response.data.data;
};

// 問い合わせ送信
export const createInquiry = async (params: CreateInquiryParams): Promise<Inquiry> => {
  const response = await axios.post<ApiResponse<{ inquiry: Inquiry }>>('/inquiries', params);
  if (!response.data.data) {
    throw new Error('Failed to create inquiry');
  }
  return response.data.data.inquiry;
};

// 自分の問い合わせ一覧取得
export const getMyInquiries = async (page: number = 1, limit: number = 20) => {
  const response = await axios.get<ApiResponse<{
    inquiries: Inquiry[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>>('/inquiries', { params: { page, limit } });
  return response.data.data || { inquiries: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
};

// 企業ユーザー向け: 自社物件一覧
export const getMyCorporateProperties = async (page: number = 1, limit: number = 20) => {
  const response = await axios.get<ApiResponse<{
    properties: Property[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>>('/corporate/properties', { params: { page, limit } });
  return response.data.data || { properties: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
};

// 企業ユーザー向け: 物件詳細取得
export const getCorporatePropertyById = async (id: number): Promise<Property> => {
  const response = await axios.get<ApiResponse<{ property: Property }>>(`/corporate/properties/${id}`);
  return response.data.data.property;
};

// 企業ユーザー向け: 受信した問い合わせ一覧
export const getCorporateInquiries = async (page: number = 1, limit: number = 20, status?: string) => {
  const params: any = { page, limit };
  if (status) params.status = status;
  const response = await axios.get<ApiResponse<{
    inquiries: Inquiry[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>>('/corporate/inquiries', { params });
  return response.data.data || { inquiries: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
};

// 企業ユーザー向け: 問い合わせ詳細取得
export const getCorporateInquiryById = async (id: number): Promise<Inquiry> => {
  const response = await axios.get<ApiResponse<Inquiry>>(`/corporate/inquiries/${id}`);
  if (!response.data.data) {
    throw new Error('Inquiry not found');
  }
  return response.data.data;
};

// 企業ユーザー向け: 問い合わせステータス更新
export const updateInquiryStatus = async (id: number, status: 'unread' | 'read' | 'responded'): Promise<Inquiry> => {
  const response = await axios.patch<ApiResponse<Inquiry>>(`/corporate/inquiries/${id}/status`, { status });
  if (!response.data.data) {
    throw new Error('Failed to update inquiry status');
  }
  return response.data.data;
};
