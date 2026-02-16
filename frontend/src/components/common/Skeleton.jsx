import React from 'react';

const Skeleton = ({ className, repeat = 1 }) => {
  return (
    <>
      {[...Array(repeat)].map((_, i) => (
        <div 
          key={i} 
          className={`animate-pulse bg-gray-200 rounded-lg ${className}`} 
        />
      ))}
    </>
  );
};

export default Skeleton;
