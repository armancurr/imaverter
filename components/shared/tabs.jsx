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
    },
    {
      id: "convert",
      label: "Convert",
      icon: Recycle,
    },
    {
      id: "compress",
      label: "Compress",
      icon: Resize,
    },
    {
      id: "color-palette",
      label: "Color-Palette",
      icon: Palette,
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

  // Calculate the position of the active indicator
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const indicatorOffset =
    activeIndex * (buttonWidth + gap) +
    (buttonWidth - indicatorWidth) / 2 +
    paddingLeft;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center space-x-2 bg-neutral-900 border-2 border-neutral-800 rounded-xl px-3 py-2 shadow-2xl backdrop-blur-sm relative">
        {/* Sliding indicator */}
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
    </div>
  );
}
