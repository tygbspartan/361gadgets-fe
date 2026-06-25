"use client";

import { useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { setActiveCategorySlug } from "@/lib/redux/features/ui/uiSlice";
import { useGetProductBySlugQuery, useGetRelatedProductsQuery } from "@/lib/redux/features/products/productsApi";
import { useGetProductReviewsQuery } from "@/lib/redux/features/reviews/reviewsApi";
import { useGetUserOrdersQuery } from "@/lib/redux/features/orders/ordersApi";
import { ROUTES } from "@/constants/routes";
import Spinner from "@/components/ui/Spinner";
import ProductDetails from "@/components/productDetailPage/ProductDetails";
import SimilarProducts from "@/components/productDetailPage/SimilarProducts";
import ProductReviewsList from "@/components/productDetailPage/ProductReviewsList";
import WriteReview from "@/components/productDetailPage/WriteReview";

function ProductDetailContent() {
  const params = useParams();
  const slug = params.slug as string;
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const { data, isLoading, error } = useGetProductBySlugQuery(slug);
  const product = data?.data;

  const { data: reviewsData, refetch: refetchReviews } = useGetProductReviewsQuery(
    { productId: product?.id ?? 0 },
    { skip: !product?.id }
  );

  const l3CategoryId = product?.categoryId ?? 0;
  const parentCategoryId = product?.category?.parentId ?? 0;

  const { data: l3Products = [], isFetching: l3Fetching } = useGetRelatedProductsQuery(
    { categoryId: l3CategoryId, currentProductId: product?.id ?? 0, limit: 4 },
    { skip: !l3CategoryId }
  );

  const needsL2Fallback = !l3Fetching && l3Products.length === 0 && !!parentCategoryId;

  const { data: l2Products = [] } = useGetRelatedProductsQuery(
    { categoryId: parentCategoryId, currentProductId: product?.id ?? 0, limit: 4 },
    { skip: !needsL2Fallback }
  );

  const fbtProducts = l3Products.length > 0 ? l3Products : l2Products;

  const { data: ordersData } = useGetUserOrdersQuery(
    { page: 1, limit: 200 },
    { skip: !isAuthenticated || !product?.id }
  );

  const hasPurchased = ordersData?.orders.some((order) =>
    order.status !== "cancelled" &&
    order.items.some((item) => item.productId === product?.id)
  ) ?? false;

  useEffect(() => {
    if (product?.category?.slug) {
      dispatch(setActiveCategorySlug(product.category.slug));
    }
    return () => { dispatch(setActiveCategorySlug(null)); };
  }, [product?.category?.slug, dispatch]);

  if (isLoading) return <Spinner className="min-h-[60vh]" />;

  if (error || !product) {
    return (
      <div className="page-wrapper pb-16 text-center">
        <h1 className="font-montserrat text-2xl font-semibold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href={ROUTES.PRODUCTS}
          className="inline-block bg-black text-white font-inter font-medium px-8 py-3 rounded-[3px]"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  const hasReviewed =
    reviewsData?.reviews?.some((r) => r.userId === user?.id) ?? false;

  return (
    <div className="page-wrapper space-y-12.5">
      <ProductDetails
        product={product}
        summary={reviewsData?.summary}
      />

      <SimilarProducts
        products={fbtProducts}
      />

      <ProductReviewsList
        reviews={reviewsData?.reviews ?? []}
      />

      {hasPurchased && (
        <div id="write-review">
          <WriteReview
            productId={product.id}
            isAuthenticated={isAuthenticated}
            onReviewSubmitted={refetchReviews}
            hasReviewed={hasReviewed}
          />
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<Spinner className="min-h-[60vh]" />}>
      <ProductDetailContent />
    </Suspense>
  );
}
