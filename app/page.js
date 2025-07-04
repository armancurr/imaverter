"use client";

import { useState } from "react";
import TopDock from "@/components/shared/tabs";
import CommandPalette from "@/components/shared/command-palette";
import ConvertInterface from "@/components/convert/convert-interface";
import CropInterface from "@/components/crop/crop-interface";
import CompressInterface from "@/components/compress/compress-interface";
import ColorPaletteInterface from "@/components/color-palette/color-palette-interface";
import MetadataEditor from "@/components/metadata/metadata-editor";

export default function Home() {
  const [activeTab, setActiveTab] = useState("crop");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const toggleCommandPalette = () => {
    setCommandPaletteOpen((prev) => !prev);
  };

  const renderActiveInterface = () => {
    return (
      <>
        <div style={{ display: activeTab === "convert" ? "block" : "none" }}>
          <ConvertInterface />
        </div>
        <div style={{ display: activeTab === "crop" ? "block" : "none" }}>
          <CropInterface />
        </div>
        <div style={{ display: activeTab === "compress" ? "block" : "none" }}>
          <CompressInterface />
        </div>
        <div
          style={{ display: activeTab === "color-palette" ? "block" : "none" }}
        >
          <ColorPaletteInterface />
        </div>
        <div
          style={{ display: activeTab === "metadata" ? "block" : "none" }}
        >
          <MetadataEditor />
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex">
      <TopDock
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleCommandPalette={toggleCommandPalette}
      />
      <CommandPalette
        open={commandPaletteOpen}
        setOpen={setCommandPaletteOpen}
      />
      <div className="flex-1">
        <div className="container mx-auto px-6 py-8 max-w-7xl pt-24">
          {renderActiveInterface()}
        </div>
      </div>
    </div>
  );
}
