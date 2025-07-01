"use client";

import { useState, useEffect } from "react";
import { Command } from "cmdk";
import {
  ArrowsClockwise,
  Crop,
  Archive,
  Palette,
  Command as CommandIcon,
} from "@phosphor-icons/react";

export default function CommandPalette({ activeTab, setActiveTab }) {
  const [open, setOpen] = useState(false);

  // Toggle command palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const tabs = [
    {
      id: "crop",
      label: "Crop",
      icon: Crop,
      description: "Crop and resize images",
      keywords: ["crop", "resize", "cut", "trim"],
    },
    {
      id: "convert",
      label: "Convert",
      icon: ArrowsClockwise,
      description: "Convert image formats",
      keywords: [
        "convert",
        "format",
        "jpg",
        "png",
        "webp",
        "avif",
        "transform",
      ],
    },
    {
      id: "compress",
      label: "Compress",
      icon: Archive,
      description: "Compress image files",
      keywords: ["compress", "reduce", "optimize", "size", "quality"],
    },
    {
      id: "color-palette",
      label: "Color Palette",
      icon: Palette,
      description: "Extract color palette from images",
      keywords: ["color", "palette", "extract", "colors", "theme"],
    },
  ];

  const handleSelect = (tabId) => {
    setActiveTab(tabId);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Command palette */}
      <Command className="relative w-full max-w-lg mx-4 rounded-xl border shadow-2xl bg-neutral-900 border-neutral-800">
        <div className="flex items-center border-b px-4 border-neutral-800">
          <CommandIcon className="mr-2 h-4 w-4 text-neutral-400" />
          <Command.Input
            placeholder="Search tools..."
            className="flex-1 border-0 bg-transparent py-4 text-sm outline-none text-neutral-100 placeholder:text-neutral-400"
          />
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-neutral-400">
            No tools found.
          </Command.Empty>

          <Command.Group heading="Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <Command.Item
                  key={tab.id}
                  value={`${tab.label} ${tab.description} ${tab.keywords.join(" ")}`}
                  onSelect={() => handleSelect(tab.id)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "shadow-md bg-neutral-200 text-neutral-900"
                      : "hover:shadow-sm hover:bg-neutral-800 text-neutral-200"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      isActive ? "text-neutral-900" : "text-neutral-400"
                    }
                  />
                  <div className="flex-1">
                    <div
                      className={`font-medium ${isActive ? "text-neutral-900" : "text-neutral-100"}`}
                    >
                      {tab.label}
                    </div>
                    <div
                      className={`text-xs ${isActive ? "text-neutral-700" : "text-neutral-400"}`}
                    >
                      {tab.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="text-xs px-2 py-1 rounded bg-neutral-700 text-neutral-200">
                      Active
                    </div>
                  )}
                </Command.Item>
              );
            })}
          </Command.Group>
        </Command.List>

        <div className="border-t px-4 py-2 text-xs text-center border-neutral-800 text-neutral-400">
          Use ↑↓ to navigate, Enter to select, Esc to close
        </div>
      </Command>
    </div>
  );
}
