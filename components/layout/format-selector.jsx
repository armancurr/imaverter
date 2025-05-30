"use client";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { memo, useState } from "react";
import {
  FilePng,
  FileJpg,
  Gif,
  FileSvg,
  FileImage,
  CaretUp,
  Question,
} from "@phosphor-icons/react";

const formatIcons = {
  png: FilePng,
  jpg: FileJpg,
  jpeg: FileJpg,
  webp: FileImage,
  gif: Gif,
  bmp: FileImage,
  tiff: FileImage,
  svg: FileSvg,
  ico: FileImage,
  avif: FileImage,
};

const formatDescriptions = {
  png: "Lossless, transparent, graphics.",
  jpg: "Compressed, small, best for photos.",
  jpeg: "Compressed, small, best for photos.",
  webp: "Modern, high quality, transparent.",
  gif: "Animated, transparent.",
  bmp: "Uncompressed, large, high quality.",
  tiff: "High quality, large, professional.",
  svg: "Vector, scalable, for icons.",
  ico: "Icons for apps, websites.",
  avif: "Next-gen, tiny, high quality.",
};

export default function FormatSelector({ format, setFormat, formatOptions }) {
  const [open, setOpen] = useState(false);

  const selectedOption = formatOptions.find(
    (option) => option.value === format,
  );
  const SelectedIcon = selectedOption
    ? formatIcons[selectedOption.value.toLowerCase()] || FileImage
    : FileImage;
  const selectedDescription = selectedOption
    ? formatDescriptions[selectedOption.value.toLowerCase()] ||
      "Standard format"
    : "";

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center space-x-1">
          <Question weight="bold" className="h-4 w-4 text-[#e6fda3]" />
          <Label className="text-sm font-medium text-neutral-300">
            Output Format
          </Label>
        </div>
        <p className="text-xs text-neutral-500">
          Select the desired file format for conversion
        </p>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            aria-expanded={open}
            className={`
              w-full justify-between h-auto p-4 shadow-none cursor-pointer
              ${selectedOption ? "bg-[#e6fda3]/8" : "bg-[#e6fda3]/8"}
              hover:bg-[#e6fda3]/8
            `}
            style={{ border: "none" }}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`
                  p-2 rounded-sm
                  ${selectedOption ? "bg-[#e6fda3]/20" : "bg-neutral-800"}
                `}
              >
                <SelectedIcon
                  className={`w-4 h-4 ${
                    selectedOption ? "text-[#e6fda3]" : "text-neutral-400"
                  }`}
                  weight="bold"
                />
              </div>
              <div className="text-left flex-1">
                <div
                  className={`
                    text-sm font-medium
                    ${selectedOption ? "text-[#e6fda3]" : "text-neutral-400"}
                  `}
                >
                  {selectedOption ? selectedOption.label : "Select format..."}
                </div>
                {selectedOption && (
                  <div
                    className={`
                      text-xs
                      ${selectedOption ? "text-[#e6fda3]/70" : "text-neutral-400"}
                    `}
                  >
                    {selectedDescription}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CaretUp
                className={`h-4 w-4 text-neutral-400 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
                weight="bold"
              />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-2 bg-neutral-900 border-none"
          align="start"
          style={{ border: "none" }}
        >
          <div className="grid grid-cols-2 gap-2">
            {formatOptions.map((option) => {
              const isSelected = format === option.value;
              const IconComponent =
                formatIcons[option.value.toLowerCase()] || FileImage;
              const description =
                formatDescriptions[option.value.toLowerCase()] ||
                "Standard format";

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setFormat(option.value);
                    setOpen(false);
                  }}
                  className={`
                    relative flex items-center justify-between w-full p-3 rounded-md shadow-none cursor-pointer
                    ${
                      isSelected
                        ? "bg-[#e6fda3]/8"
                        : "bg-neutral-800/50 hover:bg-neutral-800/70"
                    }
                  `}
                  style={{ border: "none" }}
                  type="button"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`
                        p-2 rounded-md
                        ${isSelected ? "bg-[#e6fda3]/20" : "bg-neutral-700"}
                      `}
                    >
                      <IconComponent
                        className={`w-4 h-4 ${
                          isSelected ? "text-[#e6fda3]" : "text-neutral-300"
                        }`}
                        weight="duotone"
                      />
                    </div>

                    <div className="text-left">
                      <div
                        className={`
                          text-sm font-medium
                          ${isSelected ? "text-[#e6fda3]" : "text-neutral-300"}
                        `}
                      >
                        {option.label}
                      </div>
                      <div
                        className={`
                          text-xs
                          ${isSelected ? "text-[#e6fda3]/70" : "text-neutral-500"}
                        `}
                      >
                        {description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
