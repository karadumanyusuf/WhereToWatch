import { motion } from 'framer-motion';

export const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-xl overflow-hidden gradient-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            delay: i * 0.05,
            ease: 'easeOut'
          }}
        >
          <div className="aspect-[2/3] animate-shimmer" />
          <div className="p-4 space-y-2 bg-card">
            <div className="h-5 w-3/4 rounded animate-shimmer" />
            <div className="h-4 w-1/3 rounded animate-shimmer" />
            <div className="h-12 w-full rounded animate-shimmer" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
