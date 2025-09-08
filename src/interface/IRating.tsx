export interface Rating {
  id?: number;
  users: {
    name: string;
  };
  product: {
    name: string;
  };
  comment: string;
  rating: number;
}
