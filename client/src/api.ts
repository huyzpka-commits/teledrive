import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export default api;

export interface Media {
  id: number;
  telegram_file_id: string;
  file_name: string;
  title: string;
  artist: string | null;
  type: 'audio' | 'video';
  mime_type: string;
  size: number;
  duration: number;
  thumbnail: string;
  category: string;
  created_at: string;
}

export interface Playlist {
  id: number;
  name: string;
  created_at: string;
}
