import React, { useEffect, useState } from 'react';

const PerformanceMonitor = () => {
  const [renderTime, setRenderTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
      
      // Get memory usage if available
      if (performance.memory) {
        setMemoryUsage(performance.memory.usedJSHeapSize / 1048576); // Convert to MB
      }
    };
  });

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-0 right-0 bg-black/80 text-white p-2 text-sm">
      <div>Render Time: {renderTime.toFixed(2)}ms</div>
      {memoryUsage > 0 && <div>Memory Usage: {memoryUsage.toFixed(2)}MB</div>}
    </div>
  );
};

export default PerformanceMonitor;