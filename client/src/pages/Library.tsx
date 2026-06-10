import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { Media } from '../api';
import MediaGrid from '../components/MediaGrid';
import SearchBar from '../components/SearchBar';

export default function Library() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || '';
  const [media, setMedia] = useState<Media[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (search) params.append('search', search);
    params.append('limit', '50');
    api.get(`/media?${params.toString()}`).then((res) => setMedia(res.data.data));
  }, [type, search]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        {type === 'audio' ? 'Music Library' : type === 'video' ? 'Movie Library' : 'All Media'}
      </h2>
      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} />
      </div>
      <MediaGrid title="" media={media} />
    </div>
  );
}
