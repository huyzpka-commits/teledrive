import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Media } from '../api';

export default function PlayerBar() {
  const [currentMedia, setCurrentMedia] = useState<Media | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handlePlay = (e: Event) => {
      const customEvent = e as CustomEvent;
      setCurrentMedia(customEvent.detail);
      setIsPlaying(true);
    };
    window.addEventListener('teledrive-play', handlePlay);
    return () => window.removeEventListener('teledrive-play', handlePlay);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play();
      else audioRef.current.pause();
    }
  }, [isPlaying, currentMedia]);

  if (!currentMedia) return null;

  return (
    <div className="h-20 bg-gray-900 border-t border-gray-800 px-6 flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-xs text-gray-500">{currentMedia.type === 'video' ? 'Vid' : 'Aud'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{currentMedia.title || currentMedia.file_name}</h4>
        <p className="text-xs text-gray-400 truncate">{currentMedia.artist || 'Unknown'}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 hover:text-white text-gray-400 transition-colors">
          <SkipBack size={18} />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <button className="p-2 hover:text-white text-gray-400 transition-colors">
          <SkipForward size={18} />
        </button>
      </div>
      <div className="hidden md:flex items-center gap-2 w-32">
        <Volume2 size={16} className="text-gray-400" />
        <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="w-2/3 h-full bg-white rounded-full" />
        </div>
      </div>
      <audio
        ref={audioRef}
        src={`/api/media/${currentMedia.id}/stream`}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
