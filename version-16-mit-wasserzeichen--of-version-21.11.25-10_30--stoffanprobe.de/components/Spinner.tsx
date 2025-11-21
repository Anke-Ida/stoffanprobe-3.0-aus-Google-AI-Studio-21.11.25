import React from 'react';

interface SpinnerProps {
    message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message = 'Wird geladen...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-t-4 border-[#FF954F] border-t-transparent rounded-full animate-spin"></div>
      {message && <p className="mt-4 text-lg font-semibold text-[#532418]">{message}</p>}
      <p className="mt-2 text-sm text-[#67534F]">Dies kann einen Moment dauern.</p>
    </div>
  );
};

export default Spinner;