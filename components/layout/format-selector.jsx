import { Label } from "@/components/ui/label";

export default function FormatSelector({ format, setFormat, formatOptions }) {
  return (
    <div className="space-y-3">
      <Label id="format-grid-label" className="text-neutral-300">
        Convert to format
      </Label>
      <div
        role="radiogroup"
        aria-labelledby="format-grid-label"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3"
      >
        {formatOptions.map((option) => {
          const isSelected = format === option.value;
          const labelId = `format-option-label-${option.value}`;
          const descriptionId = `format-option-desc-${option.value}`;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-labelledby={labelId}
              aria-describedby={descriptionId}
              onClick={() => setFormat(option.value)}
              className={`
                w-full rounded-lg border p-3 text-left 
                transition-all duration-150 ease-in-out 
                focus:outline-none focus-visible:ring-2 
                focus-visible:ring-offset-2 focus-visible:ring-[#e6fda3] 
                focus-visible:ring-offset-neutral-950 
                sm:p-4 
                ${
                  isSelected
                    ? "border-3 border-[#e6fda3] bg-neutral-700 text-white shadow-md"
                    : "border-neutral-700 bg-neutral-800 text-white hover:border-neutral-600 hover:bg-neutral-700"
                }
              `}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  id={labelId}
                  className="font-medium text-sm sm:text-base"
                >
                  {option.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}