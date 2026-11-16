import CollectionSkeleton from "@/components/skeletons/CollectionSkeleton";

// Shown instantly on navigation while the page's products load on the server.
export default function Loading() {
  return <CollectionSkeleton />;
}
