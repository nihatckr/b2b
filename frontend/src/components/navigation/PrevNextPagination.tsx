import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface PaginationProps {
  orders: any[];
  prevText?: string;
  nextText?: string;
  skip: number;
  take: number;
  setSkip: (value: number) => void;
}

const PrevNextPagination = ({
  skip,
  take,
  orders,
  prevText,
  nextText,
  setSkip,
}: PaginationProps) => {
  return (
    <div className="flex justify-center gap-2">
      <Button
        variant="outline"
        onClick={() => setSkip(Math.max(0, skip - take))}
        disabled={skip === 0}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        {prevText}
      </Button>
      <Button
        variant="outline"
        onClick={() => setSkip(skip + take)}
        disabled={orders.length < take}
        className="flex items-center gap-2"
      >
        {nextText}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PrevNextPagination;
