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
  type?: "date" | "month" | "year" | "dashboar-month"; // 👈 thêm type
  onChange?: flatpickr.Options.Hook | flatpickr.Options.Hook[];
  defaultDate?: flatpickr.Options.DateOption;
  label?: string;
  placeholder?: string;
  onClear?: () => void;
};

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
  const instanceRef = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    let options: flatpickr.Options.Options = {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate,
      onChange,
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

    // ✅ Nếu chỉ chọn năm
    if (type === "year") {
      options = {
        ...options,
        dateFormat: "Y",
        plugins: [
          monthSelectPlugin({
            shorthand: true,
            dateFormat: "Y",
            altFormat: "Y",
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
            Clear
          </button>
        </span>
      </div>
    </div>
  );
}
