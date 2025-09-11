export interface News {
  id?: number;
  name: string;
  description: string;
  images?: string[];
  type: string;
  likes?: number;
  views?: number;
}

export const defaultNews: News = {
  name: "",
  description: "",
  images: [],
  type: "",
  likes: 0,
  views: 0,
};
