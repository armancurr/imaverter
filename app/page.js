"use client";

import { useState } from "react";
import Header from "@/components/shared/header";
import ConvertInterface from "@/components/convert/convert-interface";
import CropInterface from "@/components/crop/crop-interface";
import CompressInterface from "@/components/compress/compress-interface";

export default function Home() {
  const [activeTab, setActiveTab] = useState("convert");

  const renderActiveInterface = () => {
    switch (activeTab) {
      case "convert":
        return <ConvertInterface />;
      case "crop":
        return <CropInterface />;
      case "compress":
        return <CompressInterface />;
      default:
        return <ConvertInterface />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300">
      <div>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="container mx-auto px-6 py-2">
        {renderActiveInterface()}
      </div>
    </div>
  );
}
