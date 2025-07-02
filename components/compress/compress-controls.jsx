import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function CompressControls({
  quality,
  setQuality,
  formatFileSize,
  estimatedSize,
  sizeMarkers,
}) {
  return (
    <div className="border-2 border-neutral-700 rounded-xl p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-neutral-300">Target File Size</Label>
          <div className="text-xs text-neutral-400">
            ~{formatFileSize(estimatedSize)}
          </div>
        </div>

        <div className="relative">
          <Slider
            value={[quality]}
            onValueChange={(values) => setQuality(values[0])}
            min={10}
            max={95}
            step={1}
            className="
              w-full
              [&_[data-slot=slider-track]]:bg-neutral-700
              [&_[data-slot=slider-range]]:bg-neutral-200
            "
          />

          <div className="relative mt-2 h-5 overflow-hidden">
            {sizeMarkers.map((marker, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${marker.position}%` }}
              >
                <div className="w-0.5 h-1.5 bg-neutral-500 mx-auto"></div>
                <div className="text-[10px] text-neutral-500 mt-0.5 whitespace-nowrap">
                  {marker.size}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
