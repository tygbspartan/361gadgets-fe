import HomeSkeleton from "@/components/skeletons/HomeSkeleton";

// Homepage only (this route group exists to scope it): shown instantly on
// navigation back to "/" while the sections load on the server.
export default function Loading() {
  return <HomeSkeleton />;
}
