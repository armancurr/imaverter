"use client";

import { Button } from "@/components/ui/button";
import { ArrowsClockwise, Crop, Archive, Palette } from "@phosphor-icons/react"; // <-- Add Palette icon

export default function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    {
      id: "crop",
      label: "Crop",
      icon: Crop,
      description: "Crop and resize images",
    },
    {
      id: "convert",
      label: "Convert",
      icon: ArrowsClockwise,
      description: "Convert image formats",
    },
    {
      id: "compress",
      label: "Compress",
      icon: Archive,
      description: "Compress image files",
    },
    {
      id: "color-palette",
      label: "Color-Palette",
      icon: Palette, // <-- Use the Palette icon
      description: "Extract color palette from images",
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full z-50 flex flex-col bg-[#352F44]">
      {/* Navigation items */}
      <div className="flex flex-col space-y-4 p-3 flex-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab(tab.id)}
              className={`h-12 w-12 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive ? "shadow-lg" : "hover:shadow-md"
              }`}
              style={{
                backgroundColor: isActive ? "#FAF0E6" : "#5C5470",
                color: isActive ? "#352F44" : "#FAF0E6",
              }}
              title={tab.label} // Optional: show label on hover
            >
              <Icon size={20} />
            </Button>
          );
        })}
      </div>
    </div>
  );
}