export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center">
      <div className="w-fit">
        <h2 className="font-montserrat font-medium text-[18px] sm:text-[20px] lg:text-[24px] leading-none text-black text-center">
          {children}
        </h2>
        <div className="h-0.5 bg-primary mt-1.5" />
      </div>
    </div>
  );
}
