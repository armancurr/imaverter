import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function ColorPaletteResult({ palette, onCopyHex }) {
  if (palette.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-16 justify-items-center max-w-md mx-auto">
      {palette.map((swatch, i) => (
        <Tooltip key={i}>
          <TooltipTrigger asChild>
            <div
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => onCopyHex(swatch.hex)}
            >
              <div
                style={{
                  width: 85,
                  height: 85,
                  background: swatch.hex,
                  border: "1px solid #525252",
                  transition: "box-shadow 0.2s",
                }}
                className="group-hover:shadow-lg rounded-lg"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{swatch.hex}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
