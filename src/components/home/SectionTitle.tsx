export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center">
      <div className="w-fit">
        <h2 className="font-montserrat font-semibold uppercase tracking-[0.04em] text-[18px] sm:text-[20px] lg:text-[24px] leading-none text-foreground text-center">
          {children}
        </h2>
        {/* Neon underline with a bloom, sized to the heading. */}
        <div className="mt-2 h-0.5 rounded-full bg-primary shadow-(--elev-2)" />
      </div>
    </div>
  );
}
