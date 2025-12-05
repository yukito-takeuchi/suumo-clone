export interface PropertySearchParams {
  // 地理条件
  prefecture_ids?: number[];
  railway_line_ids?: number[];
  station_ids?: number[];
  walking_minutes_max?: number;

  // 賃料条件
  rent_min?: number;
  rent_max?: number;

  // 物件条件
  floor_plan_type_ids?: number[];
  building_type_ids?: number[];
  area_min?: number;
  area_max?: number;
  building_age_max?: number;

  // こだわり条件
  feature_ids?: number[];

  // フリーワード
  keyword?: string;

  // ソート・ページネーション
  sort_by?: 'rent_asc' | 'rent_desc' | 'area_desc' | 'created_at_desc';
  page?: number;
  limit?: number;
}

export interface Property {
  id: number;
  corporate_user_id: number;
  title: string;
  description: string | null;
  prefecture_id: number;
  prefecture_name: string;
  address: string;
  building_type_id: number;
  building_type_name: string;
  building_name: string | null;
  building_age: number | null;
  floor_number: number | null;
  total_floors: number | null;
  floor_plan_type_id: number;
  floor_plan_type_name: string;
  area: number;
  rent: number;
  management_fee: number;
  deposit: number;
  key_money: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PropertyWithStations extends Property {
  stations: Array<{
    id: number;
    name: string;
    railway_line_name: string;
    walking_minutes: number;
    display_order: number;
  }>;
  images: Array<{
    id: number;
    image_url: string;
    display_order: number;
  }>;
  features: Array<{
    id: number;
    name: string;
  }>;
}

export interface PropertySearchResult {
  properties: PropertyWithStations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
