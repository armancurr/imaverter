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
          <Question
            weight="bold"
            className="h-4 w-4"
            style={{ color: "#5C5470" }}
          />
          <Label className="text-sm font-medium" style={{ color: "#352F44" }}>
            Output Format
          </Label>
        </div>
        <p className="text-xs" style={{ color: "#5C5470" }}>
          Select the desired file format for conversion
        </p>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto p-4 shadow-none cursor-pointer hover:shadow-md transition-all duration-200"
            style={{
              backgroundColor: selectedOption ? "#FAF0E6" : "#FFFFFF",
              border: `1px solid ${selectedOption ? "#5C5470" : "#B9B4C7"}`,
              color: "#352F44",
            }}
          >
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-sm"
                style={{
                  backgroundColor: selectedOption ? "#B9B4C7" : "#FAF0E6",
                }}
              >
                <SelectedIcon
                  className="w-4 h-4"
                  style={{
                    color: selectedOption ? "#352F44" : "#5C5470",
                  }}
                  weight="bold"
                />
              </div>
              <div className="text-left flex-1">
                <div
                  className="text-sm font-medium"
                  style={{
                    color: selectedOption ? "#352F44" : "#5C5470",
                  }}
                >
                  {selectedOption ? selectedOption.label : "Select format..."}
                </div>
                {selectedOption && (
                  <div className="text-xs" style={{ color: "#5C5470" }}>
                    {selectedDescription}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CaretUp
                className={`h-4 w-4 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
                style={{ color: "#5C5470" }}
                weight="bold"
              />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-2 shadow-lg"
          align="start"
          style={{
            backgroundColor: "#FFFFFF",
            border: `1px solid #B9B4C7`,
          }}
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
                  className="relative flex items-center justify-between w-full p-3 rounded-md shadow-none cursor-pointer transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: isSelected ? "#FAF0E6" : "#FFFFFF",
                    border: `1px solid ${isSelected ? "#5C5470" : "#B9B4C7"}`,
                  }}
                  type="button"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="p-2 rounded-md"
                      style={{
                        backgroundColor: isSelected ? "#B9B4C7" : "#FAF0E6",
                      }}
                    >
                      <IconComponent
                        className="w-4 h-4"
                        style={{
                          color: isSelected ? "#352F44" : "#5C5470",
                        }}
                        weight="duotone"
                      />
                    </div>

                    <div className="text-left">
                      <div
                        className="text-sm font-medium"
                        style={{
                          color: isSelected ? "#352F44" : "#5C5470",
                        }}
                      >
                        {option.label}
                      </div>
                      <div
                        className="text-xs"
                        style={{
                          color: "#5C5470",
                        }}
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
