import { Slider } from "@/components/ui/slider";

export default function ColorPaletteControls({ numColors, setNumColors }) {
  return (
    <div className="border-2 border-neutral-700 rounded-xl p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs text-neutral-300">Number of Colors</label>
          <div className="text-xs text-neutral-400">{numColors} colors</div>
        </div>

        <div className="relative">
          <Slider
            value={[numColors]}
            onValueChange={(values) => setNumColors(values[0])}
            min={2}
            max={10}
            step={1}
            className="
              w-full
              [&_[data-slot=slider-track]]:bg-neutral-700
              [&_[data-slot=slider-range]]:bg-neutral-200
            "
          />

          {/* Color count markers */}
          <div className="relative mt-2 h-5 overflow-hidden">
            {[2, 4, 6, 8, 10].map((count, index) => {
              const position = ((count - 2) / (10 - 2)) * 100;
              return (
                <div
                  key={count}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${position}%` }}
                >
                  <div className="w-0.5 h-1.5 bg-neutral-500 mx-auto"></div>
                  <div className="text-[10px] text-neutral-500 mt-0.5 whitespace-nowrap">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
