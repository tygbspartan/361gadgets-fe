"use client";

import HeroSection from "@/components/home/HeroSection";
import BrandsCarousel from "@/components/home/BrandCarousel";
import NewArrivals from "@/components/home/NewArrivals";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import SpecialOffers from "@/components/home/SpecialOffers";
import ShopByCategory from "@/components/home/ShopByCategory";
import HomepageFeatured from "@/components/home/HomepageFeatured";

export default function HomePage() {
  return (
    <div>
      {/* Hero — full width, pull up to cancel Navbar's mb-12.5 */}
      <div className="-mt-12.5">
        <HeroSection />
      </div>

      {/* Brand marquee — full width, flush under the hero */}
      <BrandsCarousel />

      {/* New Arrivals — 50px below brands */}
      <div className="page-wrapper mt-12.5">
        <NewArrivals limit={5} />
      </div>

      {/* Best Sellers — 50px below new arrivals */}
      <div className="page-wrapper mt-12.5">
        <FeaturedProducts />
      </div>

      {/* Special Offers — 50px below best sellers */}
      <div className="page-wrapper mt-12.5">
        <SpecialOffers limit={5} />
      </div>

      {/* Homepage Featured */}
      <div>
        <HomepageFeatured />
      </div>

      {/* Shop by Category — 50px below homepage featured */}
      <div className="page-wrapper mt-12.5">
        <ShopByCategory />
      </div>
    </div>
  );
}
