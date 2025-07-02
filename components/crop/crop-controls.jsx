import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function CropControls({
  cornerRadius,
  setCornerRadius,
}) {
  return (
    <div className="w-full">
      <div className="w-full h-[97px] border-2 border-neutral-700 rounded-xl p-4">
        <div className="space-y-2">
          <Label className="text-xs text-neutral-300">Corner Radius</Label>
          <Slider
            value={[cornerRadius]}
            onValueChange={(vals) => setCornerRadius(vals[0])}
            min={0}
            max={100}
            step={1}
            className="
              w-full
              [&_[data-slot=slider-track]]:bg-neutral-700
              [&_[data-slot=slider-range]]:bg-neutral-200
            "
          />
          <div className="text-xs text-neutral-400 text-center">
            {cornerRadius >= 100 ? "Circle" : cornerRadius > 0 ? `${cornerRadius}px rounded` : "No rounding"}
          </div>
        </div>
      </div>
    </div>
  );
}
