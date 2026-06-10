import MediaCard from './MediaCard';
import { Media } from '../api';

export default function MediaGrid({ title, media }: { title: string; media: Media[] }) {
  if (!media.length) return null;
  return (
    <section className="mb-8">
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {media.map((item) => (
          <MediaCard key={item.id} media={item} />
        ))}
      </div>
    </section>
  );
}
