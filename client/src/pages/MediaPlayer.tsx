import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { Media } from '../api';
import { ArrowLeft, Play, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MediaPlayer() {
  const { id } = useParams();
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/media/${id}`).then((res) => {
      setMedia(res.data);
      setLoading(false);
      if (res.data.type === 'audio') {
        window.dispatchEvent(new CustomEvent('teledrive-play', { detail: res.data }));
      }
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!media) return <div className="p-10 text-center">Media not found</div>;

  const streamUrl = `/api/media/${media.id}/stream`;

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} />
        Back
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{media.title || media.file_name}</h1>
            <p className="text-gray-400">{media.artist || media.category || 'Unknown Artist'}</p>
          </div>

          {media.type === 'video' ? (
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
              <video
                src={streamUrl}
                controls
                autoPlay
                className="w-full h-full"
                poster={media.thumbnail || undefined}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-8 flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play size={32} className="text-blue-400 ml-1" />
                </div>
                <p className="text-gray-400">Playing audio stream...</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Download size={16} />
              Open Stream
            </a>
            <span className="text-sm text-gray-500">
              {media.mime_type} • {(media.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
