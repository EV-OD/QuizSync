"use client";

import DottedMap from "dotted-map";
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Pin {
  lat: number;
  lng: number;
  label?: string;
}

interface Logo {
  imageUrl: string;
  lat: number;
  lng: number;
}

interface MapProps {
  pins?: Pin[];
  logo?: Logo;
  pinColor?: string;
  dotColor?: string;
}

export default function WorldMap({
  pins = [],
  logo,
  pinColor = "hsl(var(--primary))",
  dotColor = "#FFFFFF40", // Changed for dark mode visibility
}: MapProps) {
  const map = new DottedMap({ height: 100, grid: "diagonal" });
  const [viewBox, setViewBox] = useState("0 0 800 400");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (isMobileView) {
        // Zoom in on Nepal: x, y, width, height
        setViewBox("450 80 300 150");
      } else {
        setViewBox("0 0 800 400");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const svgMap = map.getSVG({
    radius: 0.22,
    color: dotColor,
    shape: "circle",
    backgroundColor: "transparent",
  });

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  return (
    <div className="w-full h-full absolute top-0 md:top-20 left-0 right-0 bottom-0">
      <div className="w-full h-full relative">
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          className="h-full w-full object-cover object-center md:object-contain [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
          alt="world map"
          height="495"
          width="1056"
          draggable={false}
        />
        <svg
          viewBox={viewBox}
          className="w-full h-full absolute z-10 inset-0 pointer-events-none select-none"
          preserveAspectRatio="xMidYMid slice"
        >
          {!isMobile && pins.map((pin, i) => {
            const point = projectPoint(pin.lat, pin.lng);
            return (
              <g key={`pin-group-${i}`} transform={`translate(${point.x}, ${point.y})`}>
                <circle
                  className="pulse"
                  r="4"
                  fill={pinColor}
                  fillOpacity="0.4"
                />
                <circle r="2" fill={pinColor} />
                {pin.label && (
                  <text
                    x="5"
                    y="2"
                    fontSize="7"
                    fill="hsl(var(--foreground))"
                  >
                    {pin.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {logo && !isMobile && (() => {
          const point = projectPoint(logo.lat, logo.lng);
          return (
             <div
              style={{
                position: 'absolute',
                left: `${(point.x / 800) * 100}%`,
                top: `calc(${(point.y / 400) * 100}% + 50px)`,
                transform: `translate(-50%, -50%)`,
                 visibility: isMobile ? 'hidden' : 'visible'
              }}
              className="pointer-events-auto transition-all z-10"
            >
              <div className="w-16 h-16 rounded-full bg-background/50 backdrop-blur-sm border border-primary/50 flex items-center justify-center p-2 shadow-lg">
                <Image src={logo.imageUrl} alt="Logo" width={48} height={48} className="object-contain dark:[filter:invert(1)_hue-rotate(189deg)_brightness(2)]"/>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  );
}
