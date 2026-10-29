"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
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

/*
 * Whether the footer has scrolled up to the navbar. The footer is a full
 * screen tall, so once it reaches the bar the navbar steps aside rather than
 * sitting on top of it; scrolling back up brings it straight back.
 */
const subscribeToScroll = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
};
/* Once the footer has reached the top of the window it is all that's behind
   the bar. Not earlier: the bar goes see-through with a white logo, and with
   the white page still behind it the logo would vanish. */
let footerUnder = false;
const isFooterUnderNavbar = () => {
  const footer = document.getElementById("site-footer");
  if (!footer) return (footerUnder = false);
  // A little hysteresis: step aside at the very bottom, but only come back
  // once the page has scrolled up past 16px, so a trackpad's bounce at the
  // end of the page can't flicker the bar back and forth.
  const top = footer.getBoundingClientRect().top;
  footerUnder = footerUnder ? top <= 16 : top <= 1;
  return footerUnder;
};

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

  // Counts come from client-only state (persisted guest items or an auth-gated
  // query), so they differ between SSR and the first client render. Gate the
  // badges on mount to keep hydration consistent.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [openCat, setOpenCat] = useState<number | null>(null);
  /*
   * Which category the mega panel is *rendering*. Distinct from openCat because
   * there is now a single shared panel: on close, openCat goes null but the
   * content has to stay mounted for the slide-up to have anything to animate.
   * shownCat therefore only ever advances, never clears.
   */
  const [shownCat, setShownCat] = useState<number | null>(null);

  /*
   * shownCat only advances to categories that have something to render. Moving
   * onto a childless one therefore leaves the previous content in place while
   * the panel slides away, instead of blanking it mid-animation.
   */
  const openMenu = (cat: Category) => {
    if (cat.children && cat.children.length > 0) setShownCat(cat.id);
    setOpenCat(cat.id);
  };

  const shownCategory = categories.find((c) => c.id === shownCat);
  /* Driven by the *hovered* category, not the rendered one: hovering something
     childless must close the panel even though old content is still mounted. */
  const megaOpen =
    (categories.find((c) => c.id === openCat)?.children?.length ?? 0) > 0;

  const catBarRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);

  /*
   * Publish the real height of both bars (top bar + category strip) as
   * --nav-h, so the hero ends exactly at the fold. The values in globals.css
   * are only the pre-hydration fallback: the rendered height drifts from them
   * with fonts, zoom and logo size. Only the two bars are measured — the
   * mobile menu opens in-flow inside <nav> and must not resize the hero.
   */
  useEffect(() => {
    const top = topBarRef.current;
    if (!top) return;
    const cat = catBarRef.current;
    const root = document.documentElement;
    const update = () => {
      const h = top.getBoundingClientRect().height + (cat?.getBoundingClientRect().height ?? 0);
      root.style.setProperty("--nav-h", `${h}px`);
    };
    const ro = new ResizeObserver(update);
    ro.observe(top);
    if (cat) ro.observe(cat); /* display:none below lg, so it measures 0 there */
    update();
    return () => {
      ro.disconnect();
      root.style.removeProperty("--nav-h");
    };
  }, []);

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

  /*
   * Over the footer the bar steps back: its background, the category strip
   * and every control fade away, leaving just the logo — in white, on the
   * dark footer. Not while the user is in the middle of something in the bar.
   */
  const inFooter = useSyncExternalStore(subscribeToScroll, isFooterUnderNavbar, () => false);
  const stepAside = inFooter && !mobileMenuOpen && !searchOpen && openCat === null;
  /*
   * The hand-off is staggered so it reads as one gentle motion rather than a
   * switch: controls and the category strip go first, then the bar's
   * background, then the logo turns white. A long ease-out (fast start, slow
   * settle) on everything. Coming back, there's no stagger — the bar returns
   * at once when you scroll up.
   */
  const STEP_EASE = "ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
  const stepBack = `transition-[opacity,translate] duration-500 ${STEP_EASE} ${
    stepAside ? "pointer-events-none opacity-0" : "opacity-100"
  }`;
  const stepDelay = (ms: "delay-150" | "delay-250") => (stepAside ? ms : "delay-0");

  return (
    <>
      {/* No bottom border: it rendered as a 1px #e7e7e7 line between the black
          category bar and the black hero. The category strip is its own edge. */}
      <nav
        className={`sticky top-0 z-50 mb-12.5 transition-[background-color,backdrop-filter] duration-700 ${STEP_EASE} ${stepDelay(
          "delay-150",
        )} ${stepAside ? "bg-transparent" : "glass"}`}
      >

        {/* ── Top Bar ── 91px via .nav-top-bar */}
        <div ref={topBarRef} className="nav-top-bar">
          <div className="page-wrapper h-full">
            <div className="grid grid-cols-3 items-center h-full">

              {/* Left: burger (mobile) + search */}
              <div inert={stepAside} className={`flex items-center gap-3 ${stepBack}`}>
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
                {/* Black logo, with the white one stacked on top that fades in
                    over the footer. */}
                <Link href={ROUTES.HOME} className="relative block">
                  <Image
                    src={BRAND.logo.primary}
                    alt={BRAND.name}
                    height={55}
                    width={200}
                    className={`w-20 h-auto lg:w-auto lg:h-11.5 transition-opacity duration-700 ${STEP_EASE} ${stepDelay(
                      "delay-250",
                    )} ${stepAside ? "opacity-0" : "opacity-100"}`}
                    priority
                  />
                  <Image
                    src={BRAND.logo.secondary}
                    alt=""
                    aria-hidden
                    height={55}
                    width={200}
                    className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${STEP_EASE} ${stepDelay(
                      "delay-250",
                    )} ${stepAside ? "opacity-100" : "opacity-0"}`}
                  />
                </Link>
              </div>

              {/* Right: Wishlist · Cart · User · Mobile toggle */}
              <div inert={stepAside} className={`flex items-center justify-end gap-2.5 lg:gap-5 ${stepBack}`}>

                {/* Wishlist — opens flyout */}
                <button
                  onClick={() => setWishlistOpen(true)}
                  aria-label="Wishlist"
                  data-cursor="Wishlist"
                  data-fly-target="wishlist"
                  className="flex items-center text-primary relative"
                >
                  <Icon icon="mdi:heart-outline" className="w-5.5 h-5.5 lg:w-6 lg:h-6" />
                  {mounted && wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center leading-none">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </button>

                {/* Cart — opens flyout */}
                <button
                  onClick={() => setCartOpen(true)}
                  aria-label="Cart"
                  data-cursor="Cart"
                  data-fly-target="cart"
                  className="relative flex items-center"
                >
                  <Icon icon="mdi:shopping-outline" className="w-5.5 h-5.5 lg:w-6 lg:h-6" />
                  {mounted && cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center leading-none">
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
        {/* The one dark band in the chrome. Ink is inverted inside it, so
            `primary` (near-black) must not be used for text or the underline. */}
        {/* `relative` anchors the full-bleed mega panel below; the leave handler
            closes it once the pointer exits the bar *and* the panel, both of
            which live inside this element. */}
        <div
          ref={catBarRef}
          onMouseLeave={() => setOpenCat(null)}
          inert={stepAside}
          className={`relative hidden lg:block bg-(--chrome-dark) navbar-shadow ${stepBack} ${
            stepAside ? "-translate-y-2" : "translate-y-0"
          }`}
        >
          <div className="page-wrapper">
            <div className="flex justify-center h-15.5 gap-5">
              {categories.map((level1) => {
                const isActive = isCategoryActive(level1, activeCategorySlug);
                const isOpen = openCat === level1.id;
                return (
                <div
                  key={level1.id}
                  onMouseEnter={() => openMenu(level1)}
                  className="relative group nav-cat-item"
                >

                  {/* Wrapper so underline sizes to text width, not full item width.
                      Clicking toggles the menu (works on touch devices). */}
                  <div
                    onClick={() =>
                      isOpen ? setOpenCat(null) : openMenu(level1)
                    }
                    data-cursor="Browse"
                    className="relative cursor-pointer"
                  >
                    {/* All labels are white; the underline alone carries
                        active/hover state. */}
                    <span className="font-inter font-medium text-sm leading-none tracking-normal uppercase text-white">
                      {level1.name}
                    </span>
                    {/* Underline: active/open stays visible; inactive emerges left-to-right on hover */}
                    <div className={`absolute -bottom-1.5 -left-2.5 -right-2.5 h-0.5 bg-white origin-left transition-transform duration-300 ${isActive || isOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                  </div>

                </div>
              );
              })}
            </div>
          </div>

          {/*
           * Full-bleed mega panel — one shared instance, anchored to the bar
           * rather than to any single item, which is what lets it span the
           * viewport edge to edge.
           *
           * The outer box clips; the panel inside starts translated fully above
           * it and slides down, so it unrolls out from under the bar and rolls
           * back up on exit. It is never unmounted or set `invisible` — either
           * would cut the closing half of the animation off instantly, since
           * visibility is not interpolable.
           *
           * The clip box still occupies its area while closed, hence
           * pointer-events-none so it cannot swallow clicks on the hero below.
           */}
          <div
            className={`absolute inset-x-0 top-full z-50 overflow-hidden ${
              megaOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            <div
              onClick={() => setOpenCat(null)}
              className={`max-h-[calc(100vh-var(--nav-h)-2rem)] overflow-y-auto border-t border-white/10 bg-(--chrome-dark) transition-transform duration-300 ease-out ${
                megaOpen ? "translate-y-0" : "-translate-y-full"
              }`}
            >
              <div className="page-wrapper py-11">
                {/*
                 * Extra inset on top of .page-wrapper rather than replacing it:
                 * the wrapper keeps the panel aligned with the rest of the page,
                 * and this adds the additional breathing room. It has to sit on
                 * a child — .page-wrapper is unlayered CSS, so it would beat a
                 * px-* utility applied to the same element.
                 */}
                <div className="px-4 xl:px-10">
                  {/*
                   * Flex-wrap rather than a grid: fr columns always stretch to
                   * fill, so a category with fewer children than columns left a
                   * gap on the right. Fixed-width items that wrap can be
                   * centred as a group, and short and long categories both sit
                   * in the middle. Text stays left-aligned inside each column —
                   * ragged-left lists are harder to scan.
                   */}
                  <div className="flex flex-wrap justify-center gap-x-12 gap-y-9">
                    {shownCategory?.children?.map((level2) => (
                      <div key={level2.id} className="w-48">
                        <Link
                          href={`${ROUTES.CATEGORY}/${level2.slug}`}
                          className="group/col inline-flex items-center gap-1.5 text-[15px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:text-white/60"
                        >
                          {level2.name}
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover/col:translate-x-0.5" />
                        </Link>
                        {level2.children && level2.children.length > 0 && (
                          <ul className="mt-4 space-y-3">
                            {level2.children.map((level3) => (
                              <li key={level3.id}>
                                <Link
                                  href={`${ROUTES.CATEGORY}/${level3.slug}`}
                                  className="block text-[14px] text-white/55 transition-colors hover:text-white"
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
                                  href={`${ROUTES.CATEGORY}/${level3.slug}`}
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
