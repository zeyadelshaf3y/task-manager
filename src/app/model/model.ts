export interface BoardData {
  todo?: List[];
  inProgress?: List[];
  review?: List[];
  completed?: List[];
}

export interface List {
  id?: string;
  title?: string;
  date?: Date;
  description?: string;
  badge?: string;
  status?: boolean;
}

export interface UserData {
  id?: string;
  dateFormat?: string;
  username?: string;
}
