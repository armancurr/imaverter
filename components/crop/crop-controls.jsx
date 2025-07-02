import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function CropControls({
  cornerRadius,
  setCornerRadius,
  zoom,
  setZoom,
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-1 h-[97px] border-2 border-neutral-700 rounded-xl p-4">
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
            {cornerRadius >= 100 ? "Circle" : `${cornerRadius}px`}
          </div>
        </div>
      </div>

      <div className="flex-1 h-[97px] border-2 border-neutral-700 rounded-xl p-4">
        <div className="space-y-2">
          <Label className="text-xs text-neutral-300">Zoom Level</Label>
          <Slider
            value={[zoom]}
            onValueChange={(vals) => setZoom(vals[0])}
            min={1}
            max={3}
            step={0.1}
            className="
              w-full
              [&_[data-slot=slider-track]]:bg-neutral-700
              [&_[data-slot=slider-range]]:bg-neutral-200
            "
          />
          <div className="text-xs text-neutral-400 text-center">
            {zoom.toFixed(1)}x
          </div>
        </div>
      </div>
    </div>
  );
}
