export interface CategoryOption {
  value: number;
  label: string;
}

export interface Category {
  id?: number;
  name?: string;
  slug?: string;
  parentId?: string;
  image_url: string;}

export interface CategoryWithChildren {
  child_id?: number;
  child_name?: string;
  parent_name?: string;
}
