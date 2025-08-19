import Link from "next/link";
import React from "react";
import Select, { Option } from "../form/Select";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { FaMagnifyingGlass } from "react-icons/fa6";

interface FilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
}
interface ComponentCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  hrefLink?: string;
  filters?: FilterProps[]; // Optional filter prop
  search?: SearchProps; // Optional search prop
  onSubmit?: () => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  hrefLink = "",
  filters,
  search,
  onSubmit,
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit && onSubmit();
        }}
        className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 px-6 py-5"
      >
        {title && (
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            {title}
          </h3>
        )}

        {filters && filters.length > 0 && (
          <div className="flex flex-wrap gap-4 w-full xl:w-auto">
            {filters.map((filter, idx) => (
              <div key={idx} className="w-full xl:w-auto">
                <Label>{filter.label}</Label>
                <Select
                  onChange={filter.onChange}
                  options={filter.options}
                  className="h-11 w-full xl:w-[200px]"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col xl:flex-row xl:items-stretch xl:justify-center gap-4">
          {search && (
            <div className="w-full xl:w-auto">
              <Label>Tìm Kiếm:</Label>
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full xl:w-[500px]"
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
              />
            </div>
          )}

          {onSubmit && (
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl gap-3 flex items-center justify-center"
            >
              <FaMagnifyingGlass />{" "}
              <span className="xl:hidden"> Tìm kiếm </span>
            </button>
          )}
        </div>

        {desc && (
          <Link
            className="w-full xl:w-auto bg-blue-500 px-3 py-3 rounded-xl text-white flex items-center justify-center gap-3"
            href={hrefLink}
          >
            <span className="font-bold text-2xl">+</span>
            {desc}
          </Link>
        )}
      </form>

      {/* Card Body */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
