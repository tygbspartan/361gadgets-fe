import ProfileNav from "@/components/profile/ProfileNav";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-wrapper">
      <div className="flex gap-9">
        <aside className="hidden lg:block w-1/5 shrink-0">
          <ProfileNav />
        </aside>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
