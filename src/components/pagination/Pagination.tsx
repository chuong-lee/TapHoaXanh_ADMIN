import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationPageProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaginationPage: React.FC<PaginationPageProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous button */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePrev();
            }}
            className="bg-blue-500 text-white"
          />
        </PaginationItem>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => {
          const page = i + 1;
          return (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
                isActive={page === currentPage}
                className={page === currentPage ? "bg-blue-500 text-white" : ""}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Ellipsis (nếu muốn hiển thị kiểu rút gọn) */}
        {totalPages > 5 && <PaginationEllipsis />}

        {/* Next button */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="bg-blue-500 text-white"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
