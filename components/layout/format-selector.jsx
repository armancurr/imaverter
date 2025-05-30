import { Label } from "@/components/ui/label";
import { memo } from "react";

const FormatSelector = memo(function FormatSelector({
  format,
  setFormat,
  formatOptions,
}) {
  return (
    <div className="space-y-4">
      <Label
        id="format-grid-label"
        className="text-sm font-semibold text-neutral-200 mb-1"
      >
        Convert to format
      </Label>
      <p className="text-xs text-neutral-400">
        Choose the file type you want to convert your image to.
      </p>

      <div
        role="radiogroup"
        aria-labelledby="format-grid-label"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {formatOptions.map((option) => {
          const isSelected = format === option.value;
          const labelId = `format-option-label-${option.value}`;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-labelledby={labelId}
              onClick={() => setFormat(option.value)}
              className={`
                group relative w-full rounded-xl p-4 text-center
                transition-all duration-200 ease-out
                focus:outline-none focus-visible:ring-2
                focus-visible:ring-[#e6fda3] focus-visible:ring-offset-2
                focus-visible:ring-offset-neutral-950
                ${
                  isSelected
                    ? "bg-[#e6fda3]/10 text-[#e6fda3]"
                    : "bg-neutral-800/50 hover:bg-neutral-700/70 text-white"
                }
              `}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  id={labelId}
                  className={`text-lg font-bold transition-colors duration-200 ${
                    isSelected
                      ? "text-[#e6fda3]"
                      : "text-white group-hover:text-neutral-100"
                  }`}
                >
                  {option.label}
                </span>
                <span
                  className={`
                    flex h-5 w-5 items-center justify-center rounded-full
                    transition-all duration-200
                    ${isSelected ? "bg-[#e6fda3]" : "bg-neutral-700"}
                  `}
                >
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-neutral-900" />
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default FormatSelector;
