const SkeletonCard = () => (
  <div className="animate-pulse w-full h-full bg-zinc-800/40 border border-white/10 rounded-xl p-5 flex flex-col justify-end space-y-3">
    <div className="bg-white/10 h-6 w-3/4 rounded" />
    <div className="bg-white/10 h-4 w-full rounded" />
    <div className="bg-white/10 h-4 w-5/6 rounded" />
    <div className="flex flex-wrap gap-2 mt-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white/10 w-16 h-6 rounded-full"
        />
      ))}
    </div>
  </div>
);

export default SkeletonCard;

