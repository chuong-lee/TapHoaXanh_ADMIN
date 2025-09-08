"use client";
import { useState } from "react";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";

const RatingComponent = ({ rating }: { rating: number }) => {
  const [rating3] = useState(rating);
  return (
    <div className="flex flex-col items-center gap-8 p-8">
      {/* Read-only */}
      <div className="flex flex-col items-center gap-3">
        <Rating value={rating3} readOnly>
          {Array.from({ length: 5 }).map((_, index) => (
            <RatingButton className="text-yellow-500" key={index} />
          ))}
        </Rating>
      </div>
    </div>
  );
};
export default RatingComponent;
