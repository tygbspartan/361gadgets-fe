export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center">
      <div className="w-fit">
        <h2 className="font-montserrat font-semibold uppercase tracking-[0.04em] text-[18px] sm:text-[20px] lg:text-[24px] leading-none text-foreground text-center">
          {children}
        </h2>
        {/* Red underline with faded ends, running a little past the heading. */}
        <div className="heading-rule -mx-5 mt-2" />
      </div>
    </div>
  );
}
