"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { RootState } from "@/lib/redux/store";
import { logout } from "@/lib/redux/features/auth/authSlice";
import { useGetCategoriesQuery } from "@/lib/redux/features/categories/categoriesApi";
import { useSearchProductsQuery } from "@/lib/redux/features/products/productsApi";
import { useCart } from "@/lib/redux/features/cart/useCart";
import { useWishlist } from "@/lib/redux/features/wishlist/useWishlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, Menu, X } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import SearchDropdown from "@/components/search/SearchDropdown";
import { BRAND } from "@/config/brand";
import WishlistFlyout from "@/components/wishlist/WishlistFlyout";
import CartFlyout from "@/components/cart/CartFlyout";

interface Category {
  id: number;
  name: string;
  slug: string;
  level: number;
  parentId: number | null;
  children?: Category[];
}

// Returns true if targetSlug appears anywhere in this category's subtree
function isCategoryActive(cat: Category, targetSlug: string | null): boolean {
  if (!targetSlug) return false;
  if (cat.slug === targetSlug) return true;
  return (cat.children ?? []).some(
    (c) => c.slug === targetSlug || (c.children ?? []).some((gc) => gc.slug === targetSlug)
  );
}

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const activeCategorySlug = useSelector((state: RootState) => state.ui.activeCategorySlug);
  const { data: categoriesData } = useGetCategoriesQuery();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistCount = wishlistItems.length || 0;

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [openCat, setOpenCat] = useState<number | null>(null);
  const catBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categoriesData?.data) {
      const level1 = categoriesData.data
        .filter((cat) => cat.level === 1)
        .map((cat) => ({
          ...cat,
          children: categoriesData.data
            .filter((c) => c.parentId === cat.id && c.level === 2)
            .map((level2) => ({
              ...level2,
              children: categoriesData.data.filter(
                (c) => c.parentId === level2.id && c.level === 3
              ),
            })),
        }));
      setCategories(level1);
    }
  }, [categoriesData]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setDebouncedQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close the (click-opened) category mega menu when clicking outside it.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catBarRef.current && !catBarRef.current.contains(e.target as Node)) {
        setOpenCat(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: searchResults, isFetching: searchFetching } = useSearchProductsQuery(
    { query: debouncedQuery, limit: 6 },
    { skip: debouncedQuery.length < 3 }
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setDebouncedQuery("");
      setSearchOpen(false);
    }
  };

  const closeSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSearchOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push(ROUTES.LOGIN);
  };

  const getUserDisplayName = () => {
    if (!user) return "Account";
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.email.split("@")[0];
  };

  return (
    <>
      <nav className="bg-white sticky top-0 z-50 mb-12.5">

        {/* ── Top Bar ── 91px via .nav-top-bar */}
        <div className="nav-top-bar">
          <div className="page-wrapper h-full">
            <div className="grid grid-cols-3 items-center h-full">

              {/* Left: burger (mobile) + search */}
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden shrink-0"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
                <div ref={searchContainerRef} className="hidden lg:flex items-center relative">
                {searchOpen ? (
                  <div className="flex items-center gap-2 w-112.5 h-10 border border-black rounded-[20px] px-3 bg-white">
                    <Icon icon="ic:outline-search" width={18} height={18} className="text-black shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Type here to search"
                      className="flex-1 outline-none text-sm text-black bg-transparent placeholder:text-gray-400"
                    />
                    <button
                      onClick={closeSearch}
                      className="shrink-0 hover:opacity-60 transition-opacity"
                      aria-label="Close search"
                    >
                      <X className="h-4 w-4 text-black" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 -ml-2 hover:opacity-60 transition-opacity"
                    aria-label="Search"
                  >
                    <Icon icon="ic:outline-search" width={24} height={24} />
                  </button>
                )}

                {/* Search dropdown */}
                {searchOpen && debouncedQuery.length >= 3 && (
                  <div className="absolute top-full left-0 mt-2 w-112.5 bg-white rounded-lg shadow-lg border border-[#E2E4E5] overflow-hidden z-50">
                    {searchFetching ? (
                      <div className="flex items-center justify-center p-6">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : searchResults && searchResults.length > 0 ? (
                      <>
                        <div className="max-h-100 overflow-y-auto search-dropdown">
                          {searchResults.map((product) => {
                            const primaryImg =
                              product.images?.find((img) => img.isPrimary)?.imageUrl ??
                              product.images?.[0]?.imageUrl;
                            return (
                              <Link
                                key={product.id}
                                href={`${ROUTES.PRODUCT}/${product.slug}`}
                                onClick={closeSearch}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-[#F0F0F0] last:border-0"
                              >
                                <div className="relative shrink-0 w-10 h-10 border border-[#E2E4E5] bg-[#F8F8F8] overflow-hidden rounded">
                                  {primaryImg ? (
                                    <Image src={primaryImg} alt={product.name} fill className="object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gray-100" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-inter font-medium text-[13px] leading-none text-black line-clamp-1">
                                    {product.name}
                                  </p>
                                  {product.brand && (
                                    <p className="font-inter font-normal text-[11px] leading-none text-[#575F6E] mt-1">
                                      {product.brand.name}
                                    </p>
                                  )}
                                </div>
                                <span className="font-montserrat font-semibold text-[13px] leading-none text-black shrink-0">
                                  Rs. {Number(product.price).toLocaleString("en-NP")}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => {
                            router.push(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(searchQuery.trim())}`);
                            closeSearch();
                          }}
                          className="w-full px-4 py-3 text-center font-inter font-medium text-[13px] text-primary hover:bg-gray-50 transition-colors border-t border-[#F0F0F0]"
                        >
                          See all results for &ldquo;{searchQuery}&rdquo;
                        </button>
                      </>
                    ) : (
                      <div className="p-6 text-center">
                        <p className="font-inter text-[13px] text-gray-500">
                          No products found for &ldquo;{debouncedQuery}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )}
                </div>
              </div>

              {/* Center: Logo */}
              <div className="flex justify-center items-center">
                <Link href={ROUTES.HOME}>
                  <Image
                    src={BRAND.logo.primary}
                    alt={BRAND.name}
                    height={55}
                    width={200}
                    className="w-20 h-auto lg:w-auto lg:h-11.5"
                    priority
                  />
                </Link>
              </div>

              {/* Right: Wishlist · Cart · User · Mobile toggle */}
              <div className="flex items-center justify-end gap-2.5 lg:gap-5">

                {/* Wishlist — opens flyout */}
                <button
                  onClick={() => setWishlistOpen(true)}
                  aria-label="Wishlist"
                  data-fly-target="wishlist"
                  className="flex items-center text-primary relative"
                >
                  <Icon icon="mdi:heart-outline" className="w-5.5 h-5.5 lg:w-6 lg:h-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center leading-none">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </button>

                {/* Cart — opens flyout */}
                <button
                  onClick={() => setCartOpen(true)}
                  aria-label="Cart"
                  data-fly-target="cart"
                  className="relative flex items-center"
                >
                  <Icon icon="mdi:shopping-outline" className="w-5.5 h-5.5 lg:w-6 lg:h-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center leading-none">
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center outline-none hover:opacity-60 transition-opacity" aria-label="Account">
                      <Icon icon="boxicons:user-filled" className="w-5.5 h-5.5 lg:w-6 lg:h-6" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {isAuthenticated ? (
                        <>
                          <DropdownMenuLabel>Hello, {getUserDisplayName()}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(ROUTES.ORDERS_HISTORY)} className="cursor-pointer">
                            My Orders
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(ROUTES.MY_REVIEWS)} className="cursor-pointer">
                            My Reviews
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(ROUTES.PROFILE)} className="cursor-pointer">
                            Profile Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout} className="text-primary cursor-pointer">
                            Logout
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuLabel>My Account</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(ROUTES.LOGIN)} className="cursor-pointer">
                            Login
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(ROUTES.REGISTER)} className="cursor-pointer">
                            Sign Up
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Nav — Categories ── desktop only */}
        <div ref={catBarRef} className="hidden lg:block bg-white navbar-shadow">
          <div className="page-wrapper">
            <div className="flex justify-center h-15.5 gap-5">
              {categories.map((level1, idx) => {
                const isActive = isCategoryActive(level1, activeCategorySlug);
                const n = categories.length;
                // Left third drops right (left-0), right third drops left
                // (right-0), middle third stays centered.
                const align =
                  idx < n / 3
                    ? "left-0"
                    : idx >= (2 * n) / 3
                    ? "right-0"
                    : "left-1/2 -translate-x-1/2";
                return (
                <div key={level1.id} className="relative group nav-cat-item">

                  {/* Wrapper so underline sizes to text width, not full item width.
                      Clicking toggles the menu (works on touch devices). */}
                  <div
                    onClick={() =>
                      setOpenCat(openCat === level1.id ? null : level1.id)
                    }
                    className="relative cursor-pointer"
                  >
                    <span className={`font-inter font-medium text-sm leading-none tracking-normal transition-colors uppercase ${isActive || openCat === level1.id ? "text-black" : "text-[#484848] group-hover:text-black"}`}>
                      {level1.name}
                    </span>
                    {/* Underline: active/open stays visible; inactive emerges left-to-right on hover */}
                    <div className={`absolute -bottom-1.5 -left-2.5 -right-2.5 h-0.5 bg-primary origin-left transition-transform duration-300 ${isActive || openCat === level1.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                  </div>

                  {/* Mega dropdown */}
                  {level1.children && level1.children.length > 0 && (
                    <div
                      onClick={() => setOpenCat(null)}
                      className={`absolute ${align} top-full transition-all duration-200 pt-1 z-50 ${
                        openCat === level1.id
                          ? "opacity-100 visible"
                          : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                      }`}
                    >
                      <div className="bg-white shadow-lg rounded-md border border-gray-200 w-160 p-6 max-h-[calc(100vh-180px)] overflow-y-auto search-dropdown">
                        <div className="grid grid-cols-2 gap-6">
                          {level1.children.map((level2) => (
                            <div key={level2.id} className="space-y-3">
                              <Link
                                href={`${ROUTES.PRODUCTS}?category=${level2.slug}`}
                                className="font-semibold text-sm text-black flex items-center gap-1 hover:text-primary transition-colors"
                              >
                                {level2.name}
                                <ChevronRight className="h-3 w-3" />
                              </Link>
                              {level2.children && level2.children.length > 0 && (
                                <ul className="space-y-2 ml-2">
                                  {level2.children.map((level3) => (
                                    <li key={level3.id}>
                                      <Link
                                        href={`${ROUTES.PRODUCTS}?category=${level3.slug}`}
                                        className="text-sm text-gray-600 hover:text-primary transition-colors block"
                                      >
                                        {level3.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="page-wrapper py-4 space-y-4">
              <SearchDropdown isMobile />

              <div className="pt-2 border-t">
                <h3 className="font-semibold text-sm mb-2 px-1 text-gray-500 uppercase tracking-wide">
                  Categories
                </h3>
                <div className="space-y-1">
                  {categories.map((level1) => (
                    <details key={level1.id} className="group">
                      <summary className="flex items-center justify-between cursor-pointer px-3 py-2 hover:bg-gray-50 rounded-md text-sm font-medium text-gray-800">
                        <span>{level1.name}</span>
                        <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="ml-4 mt-1 space-y-1">
                        {level1.children?.map((level2) => (
                          <details key={level2.id} className="group/sub">
                            <summary className="flex items-center justify-between cursor-pointer px-3 py-2 hover:bg-gray-50 rounded-md text-sm text-gray-700">
                              <span>{level2.name}</span>
                              <ChevronRight className="h-3 w-3 group-open/sub:rotate-90 transition-transform" />
                            </summary>
                            <div className="ml-4 mt-1 space-y-1">
                              {level2.children?.map((level3) => (
                                <Link
                                  key={level3.id}
                                  href={`${ROUTES.PRODUCTS}?category=${level3.slug}`}
                                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {level3.name}
                                </Link>
                              ))}
                            </div>
                          </details>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Flyouts — rendered outside <nav> to avoid stacking context issues */}
      <WishlistFlyout open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      <CartFlyout open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
