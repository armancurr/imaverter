"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import ConvertInterface from "@/components/convert/convert-interface";
import CropInterface from "@/components/crop/crop-interface";
import CompressInterface from "@/components/compress/compress-interface";
import ColorPaletteInterface from "@/components/color-palette/color-palette-interface";

export default function Home() {
  const [activeTab, setActiveTab] = useState("crop");

  const renderActiveInterface = () => {
    switch (activeTab) {
      case "convert":
        return <ConvertInterface />;
      case "crop":
        return <CropInterface />;
      case "compress":
        return <CompressInterface />;
      case "color-palette":
        return <ColorPaletteInterface />;
      default:
        return <CropInterface />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FAF0E6" }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 ml-16">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {renderActiveInterface()}
        </div>
      </div>
    </div>
  );
}
