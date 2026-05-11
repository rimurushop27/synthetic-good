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
        className="p-2 rounded bg-[var(--surface)] border-2 border-[var(--border-color)] text-[#111] shadow-[2px_2px_0_0_#111] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-[2px] disabled:translate-x-[2px] hover:bg-[var(--accent-yellow)] hover:-translate-y-1 hover:shadow-[3px_3px_0_0_#111] transition-all active:translate-y-0 active:translate-x-0 active:shadow-none"
      >
        <ChevronLeft size={20} />
      </button>

      <span className="text-sm font-bold text-[#111] bg-white px-4 py-2 border-2 border-[#111] shadow-[2px_2px_0_0_#111] rounded">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded bg-[var(--surface)] border-2 border-[var(--border-color)] text-[#111] shadow-[2px_2px_0_0_#111] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-[2px] disabled:translate-x-[2px] hover:bg-[var(--accent-yellow)] hover:-translate-y-1 hover:shadow-[3px_3px_0_0_#111] transition-all active:translate-y-0 active:translate-x-0 active:shadow-none"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;