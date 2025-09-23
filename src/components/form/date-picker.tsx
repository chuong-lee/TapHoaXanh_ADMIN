import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect/index";
import "flatpickr/dist/flatpickr.css";
import "flatpickr/dist/plugins/monthSelect/style.css"; // style cho month select

interface FlatpickrInputElement extends HTMLInputElement {
  _flatpickr?: flatpickr.Instance;
}

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  type?: "date" | "month" | "year" | "dashboar-month";
  onChange?:
    | flatpickr.Options.Hook
    | flatpickr.Options.Hook[]
    | ((dates: Date[], dateStr: string) => void);
  defaultDate?: flatpickr.Options.DateOption;
  label?: string;
  placeholder?: string;
  onClear?: () => void;
};

// ✅ Component riêng cho việc chọn năm
function YearPicker({
  id,
  label,
  placeholder,
  onChange,
  onClear,
  defaultDate,
}: {
  id: string;
  label?: string;
  placeholder?: string;
  onChange?: (dates: Date[], dateStr: string) => void;
  onClear?: () => void;
  defaultDate?: flatpickr.Options.DateOption;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 131 }, (_, i) => currentYear - 65 + i); // 1959-2030

  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <div className="relative">
        <select
          id={id}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
          onChange={(e) => {
            if (onChange) {
              const selectedYear = parseInt(e.target.value);
              const date = new Date(selectedYear, 0, 1);
              onChange([date], date.toISOString());
            }
          }}
          defaultValue={
            defaultDate
              ? new Date(defaultDate as string).getFullYear().toString()
              : ""
          }
        >
          <option value="">{placeholder || "Chọn năm"}</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <span className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 dark:text-gray-400">
          <button
            type="button"
            onClick={() => {
              const select = document.getElementById(id) as HTMLSelectElement;
              if (select) {
                select.value = "";
              }
              if (onClear) {
                onClear();
              }
            }}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Xóa
          </button>
        </span>
      </div>
    </div>
  );
}

// ✅ Component riêng cho flatpickr
function FlatpickrPicker({
  id,
  mode,
  type,
  onChange,
  label,
  defaultDate,
  placeholder,
  onClear,
}: {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  type: "date" | "month" | "dashboar-month";
  onChange?: flatpickr.Options.Hook | flatpickr.Options.Hook[];
  label?: string;
  defaultDate?: flatpickr.Options.DateOption;
  placeholder?: string;
  onClear?: () => void;
}) {
  const instanceRef = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    let options: flatpickr.Options.Options = {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate,
      onChange: onChange as flatpickr.Options.Hook,
    };

    // ✅ Nếu chỉ chọn tháng
    if (type === "month") {
      options = {
        ...options,
        dateFormat: "Y-m",
        plugins: [
          monthSelectPlugin({
            shorthand: true,
            dateFormat: "Y-m",
            altFormat: "F Y",
          }),
        ],
      };
    }

    if (type === "dashboar-month") {
      options = {
        ...options,
        dateFormat: "m",
        plugins: [
          monthSelectPlugin({
            shorthand: true,
            dateFormat: "m",
            altFormat: "F Y",
          }),
        ],
      };
    }

    const flatPickr = flatpickr(`#${id}`, options);

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, type, onChange, id, defaultDate]);

  useEffect(() => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el) return;
    const inst = (el as FlatpickrInputElement)._flatpickr as
      | flatpickr.Instance
      | undefined;
    instanceRef.current = inst || null;
  }, [id, defaultDate]);

  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 dark:text-gray-400">
          <button
            type="button"
            onClick={() => {
              if (instanceRef.current) {
                instanceRef.current.clear();
              }
              if (onClear) {
                onClear();
              }
            }}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Xóa
          </button>
        </span>
      </div>
    </div>
  );
}

export default function DatePicker({
  id,
  mode,
  type = "date",
  onChange,
  label,
  defaultDate,
  placeholder,
  onClear,
}: PropsType) {
  // ✅ Nếu chỉ chọn năm, render custom select
  if (type === "year") {
    return (
      <YearPicker
        id={id}
        label={label}
        placeholder={placeholder}
        onChange={onChange as (dates: Date[], dateStr: string) => void}
        onClear={onClear}
        defaultDate={defaultDate}
      />
    );
  }

  // ✅ Render flatpickr cho các type khác
  return (
    <FlatpickrPicker
      id={id}
      mode={mode}
      type={type as "date" | "month" | "dashboar-month"}
      onChange={onChange}
      label={label}
      defaultDate={defaultDate}
      placeholder={placeholder}
      onClear={onClear}
    />
  );
}
