"use client";

import {
  Scissors,
  Resize,
  Palette,
  GithubLogo,
  Recycle,
} from "@phosphor-icons/react";

export default function TopDock({ activeTab, setActiveTab }) {
  const tabs = [
    {
      id: "crop",
      label: "Crop",
      icon: Scissors,
      title: "Crop Image",
    },
    {
      id: "convert",
      label: "Convert",
      icon: Recycle,
      title: "Convert Image",
    },
    {
      id: "compress",
      label: "Compress",
      icon: Resize,
      title: "Compress Image",
    },
    {
      id: "color-palette",
      label: "Color-Palette",
      icon: Palette,
      title: "Color Palette Extractor",
    },
  ];

  const buttonWidth = 48;
  const gap = 8;
  const indicatorWidth = 40;
  const paddingLeft = 12;

  const buttonBaseClass = [
    "h-12 w-12 flex items-center justify-center appearance-none border-none bg-transparent outline-none",
    "transition-all duration-200 cursor-pointer text-neutral-200 rounded-lg relative",
    "focus-visible:ring-2 focus-visible:ring-neutral-700",
  ].join(" ");
  const buttonActiveClass = "text-neutral-200";

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const indicatorOffset =
    activeIndex * (buttonWidth + gap) +
    (buttonWidth - indicatorWidth) / 2 +
    paddingLeft;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-20 px-8 mt-2">
      <div className="flex items-center space-x-2 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 shadow-2xl backdrop-blur-sm relative">
        <div
          className="absolute bottom-1 h-0.5 w-10 bg-neutral-200 rounded-full transition-all duration-300 ease-out"
          style={{
            left: `${indicatorOffset}px`,
          }}
        />

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${buttonBaseClass} ${
                isActive ? buttonActiveClass : ""
              }`}
              title={tab.label}
              type="button"
            >
              <Icon size={20} />
            </button>
          );
        })}

        <div className="w-px h-10 bg-neutral-800 rounded-full" />

        <button
          onClick={() =>
            window.open("https://github.com/armancurr/imaverter.git", "_blank")
          }
          className={buttonBaseClass}
          title="View on GitHub"
          type="button"
        >
          <GithubLogo size={20} />
        </button>
      </div>
    </header>
  );
}
