import React from 'react';

const TreeLayout = ({ children }) => {
  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-50">
      <div className="w-full my-8 mx-4">
        <div className="h-[calc(100vh-8rem)] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TreeLayout;