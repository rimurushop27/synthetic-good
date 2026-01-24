import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 hover:border-neonBlue transition-all"
      >
        <ChevronLeft size={20} />
      </button>

      <span className="text-sm font-medium text-gray-400">
        Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 hover:border-neonBlue transition-all"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;