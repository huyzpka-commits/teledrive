import { Play } from 'lucide-react';
import { Media } from '../api';
import { Link } from 'react-router-dom';

function formatDuration(seconds: number) {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MediaCard({ media }: { media: Media }) {
  const isVideo = media.type === 'video';
  const isImage = media.type === 'image';
  const isAudio = media.type === 'audio';
  return (
    <Link to={`/player/${media.id}`} className="group block">
      <div className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden mb-3">
        {media.thumbnail ? (
          <img src={media.thumbnail} alt={media.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <span className="text-gray-600">
              {isVideo ? 'Video' : isImage ? 'Image' : isAudio ? 'Audio' : 'File'}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Play size={20} fill="white" className="text-white ml-1" />
          </div>
        </div>
        {(isVideo || isAudio) && media.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-medium">
            {formatDuration(media.duration)}
          </div>
        )}
      </div>
      <h3 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
        {media.title || media.file_name}
      </h3>
      <p className="text-sm text-gray-400 truncate">{media.artist || media.category || 'Unknown'}</p>
    </Link>
  );
}
