// ユーザー関連
export interface User {
  id: number;
  firebaseUid: string;
  email: string;
  role: 'individual' | 'corporate';
}

export interface IndividualProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

export interface CorporateProfile {
  id: number;
  user_id: number;
  company_name: string;
  license_number: string;
  phone: string;
  address: string;
  description: string;
  email: string;
}

// 物件関連
export interface Property {
  id: number;
  corporate_user_id: number;
  title: string;
  description: string;
  prefecture_id: number;
  prefecture_name?: string;
  prefecture?: Prefecture;
  address: string;
  building_type_id: number;
  building_type_name?: string;
  building_type?: BuildingType;
  building_age: number;
  floor_number: number;
  floor_plan_type_id: number;
  floor_plan_name?: string;
  floor_plan_type_name?: string;
  floor_plan_type?: FloorPlanType;
  area: number;
  rent: number;
  management_fee: number;
  deposit: number;
  key_money: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  stations?: PropertyStation[];
  images?: PropertyImage[];
  features?: PropertyFeature[];
}

export interface PropertyStation {
  id: number;
  property_id?: number;
  station_id?: number;
  station_name?: string;
  name?: string;
  railway_line_id?: number;
  railway_line_name: string;
  walking_minutes: number;
  display_order: number;
}

export interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
  display_order: number;
}

export interface PropertyFeature {
  id: number;
  feature_id: number;
  feature_name: string;
  name?: string;
  icon?: string;
}

// 検索関連
export interface PropertySearchParams {
  prefecture_ids?: number[];
  railway_line_ids?: number[];
  station_ids?: number[];
  walking_minutes_max?: number;
  rent_min?: number;
  rent_max?: number;
  floor_plan_type_ids?: number[];
  building_type_ids?: number[];
  area_min?: number;
  area_max?: number;
  building_age_max?: number;
  feature_ids?: number[];
  keyword?: string;
  sort_by?: 'rent_asc' | 'rent_desc' | 'area_desc' | 'created_at_desc';
  page?: number;
  limit?: number;
}

export interface PropertySearchResult {
  properties: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// マスターデータ
export interface Prefecture {
  id: number;
  name: string;
}

export interface RailwayLine {
  id: number;
  prefecture_id: number;
  name: string;
}

export interface Station {
  id: number;
  railway_line_id: number;
  name: string;
}

export interface FloorPlanType {
  id: number;
  name: string;
}

export interface BuildingType {
  id: number;
  name: string;
}

// 問い合わせ関連
export interface Inquiry {
  id: number;
  property_id: number;
  individual_user_id: number;
  corporate_user_id: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  message: string;
  status: 'unread' | 'read' | 'responded';
  created_at: string;
  updated_at: string;
  property_title?: string;
  property_address?: string;
  property_rent?: number;
  prefecture_name?: string;
  company_name?: string;
  company_phone?: string;
  property?: Property;
}

export interface CreateInquiryParams {
  property_id: number;
  inquiry_type: 'vacancy' | 'viewing' | 'other';
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

// API レスポンス
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
