"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetHeroImagesQuery } from "@/lib/redux/features/hero/heroApi";
import Spinner from "@/components/ui/Spinner";

export default function HeroSlider() {
  const { data, isLoading } = useGetHeroImagesQuery();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = data?.data ?? [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoading) return <Spinner className="h-50 md:h-100 lg:h-150" />;
  if (slides.length === 0) return null;

  // Single slide — static banner, no controls
  if (slides.length === 1) {
    const slide = slides[0];
    const inner = (
      <div className="relative w-full h-50 md:h-100 lg:h-150 bg-gray-100 overflow-hidden">
        <Image
          src={slide.imageUrl}
          alt={slide.altText ?? "Banner"}
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>
    );
    return slide.linkUrl ? <Link href={slide.linkUrl}>{inner}</Link> : inner;
  }

  const goToPrevious = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNext = () =>
    setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <div className="relative w-full h-50 md:h-100 lg:h-150 bg-gray-100 rounded-lg overflow-hidden group">
      {slides.map((slide, index) => {
        const inner = (
          <div className="relative w-full h-full">
            <Image
              src={slide.imageUrl}
              alt={slide.altText ?? "Banner"}
              fill
              className="object-cover"
              priority={index === 0}
              unoptimized
            />
          </div>
        );

        return slide.linkUrl ? (
          <Link
            key={slide.id}
            href={slide.linkUrl}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {inner}
          </Link>
        ) : (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {inner}
          </div>
        );
      })}

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "w-8 bg-red-600"
                : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
