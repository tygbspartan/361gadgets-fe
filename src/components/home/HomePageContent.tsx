"use client";

import HeroSection from "@/components/home/HeroSection";
import BrandsCarousel from "@/components/home/BrandCarousel";
import NewArrivals from "@/components/home/NewArrivals";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import SpecialOffers from "@/components/home/SpecialOffers";
import ShopByCategory from "@/components/home/ShopByCategory";
import HomepageFeatured from "@/components/home/HomepageFeatured";

export default function HomePageContent() {
  return (
    <div>
      {/* Hero — full width, pull up to cancel Navbar's mb-12.5 */}
      <div className="-mt-12.5">
        <HeroSection />
      </div>

      {/* Brand marquee — full width, flush under the hero */}
      <BrandsCarousel />

      {/* New Arrivals — 70px below brands */}
      <div className="page-wrapper mt-17.5">
        <NewArrivals limit={5} />
      </div>

      {/* Best Sellers — 70px below new arrivals */}
      <div className="page-wrapper mt-17.5">
        <FeaturedProducts />
      </div>

      {/* Special Offers — 70px below best sellers */}
      <div className="page-wrapper mt-17.5">
        <SpecialOffers limit={5} />
      </div>

      {/* Homepage Featured — 20px below special offers */}
      <div className="mt-5">
        <HomepageFeatured />
      </div>

      {/* Shop by Category — 70px below homepage featured */}
      <div className="page-wrapper mt-17.5">
        <ShopByCategory />
      </div>
    </div>
  );
}
