"use client";

import HeroSection from "@/components/home/HeroSection";
import BrandsCarousel from "@/components/home/BrandCarousel";
import NewArrivals from "@/components/home/NewArrivals";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import SpecialOffers from "@/components/home/SpecialOffers";
import ShopByCategory from "@/components/home/ShopByCategory";
import HomepageFeatured from "@/components/home/HomepageFeatured";
import AboutSection from "@/components/home/AboutSection";
import ShopByBrand from "@/components/home/ShopByBrand";

export default function HomePageContent() {
  return (
    <div>
      {/* Hero — full width, pull up to cancel Navbar's mb-12.5 */}
      <div className="-mt-12.5">
        <HeroSection />
      </div>

      {/* Brand marquee — full width, flush under the hero */}
      <BrandsCarousel />

      {/* Best Sellers — 70px below brands. ~15 products (see .home-grid-15) */}
      <div className="page-wrapper mt-17.5">
        <FeaturedProducts />
      </div>

      {/* Special Offers — 70px below best sellers */}
      <div className="page-wrapper mt-17.5">
        <SpecialOffers limit={5} />
      </div>

      {/* Homepage Featured ("Our best seller" card) — 20px below special offers */}
      <div className="mt-5">
        <HomepageFeatured />
      </div>

      {/* Shop by Brand — featured brands, 70px below the featured card */}
      <div className="page-wrapper mt-17.5">
        <ShopByBrand />
      </div>

      {/* New Arrivals — 70px below Shop by Brand. ~15 products */}
      <div className="page-wrapper mt-17.5">
        <NewArrivals limit={16} />
      </div>

      {/* About us — who we are, 70px below new arrivals */}
      <div className="page-wrapper mt-17.5">
        <AboutSection />
      </div>

      {/* Shop by Category — last, 70px below about us */}
      <div className="page-wrapper mt-17.5">
        <ShopByCategory />
      </div>
    </div>
  );
}
