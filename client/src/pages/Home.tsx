import { useEffect, useState } from 'react';
import api, { Media } from '../api';
import MediaGrid from '../components/MediaGrid';
import SearchBar from '../components/SearchBar';

export default function Home() {
  const [recent, setRecent] = useState<Media[]>([]);
  const [audio, setAudio] = useState<Media[]>([]);
  const [video, setVideo] = useState<Media[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/media?limit=5').then((res) => setRecent(res.data.data));
    api.get('/media?type=audio&limit=5').then((res) => setAudio(res.data.data));
    api.get('/media?type=video&limit=5').then((res) => setVideo(res.data.data));
  }, []);

  useEffect(() => {
    if (!search) {
      api.get('/media?limit=5').then((res) => setRecent(res.data.data));
      return;
    }
    const timeout = setTimeout(() => {
      api.get(`/media?search=${encodeURIComponent(search)}&limit=20`).then((res) => {
        setRecent(res.data.data);
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div>
      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} />
      </div>
      <MediaGrid title={search ? 'Search Results' : 'Recently Added'} media={recent} />
      {!search && (
        <>
          <MediaGrid title="Music" media={audio} />
          <MediaGrid title="Movies" media={video} />
        </>
      )}
    </div>
  );
}
