import { policiesContent } from "@/content/policies";

export default function PoliciesPage() {
  return (
    <div className="page-wrapper">
      <h1 className="font-montserrat font-semibold text-[28px] leading-[130%] tracking-[-0.01em] text-center text-black">
        Policies
      </h1>

      <div className="mt-5 flex flex-col gap-4">
        {policiesContent.map((item, i) => (
          <p key={i} className="font-montserrat text-[12px] lg:text-[16px] leading-[31px] text-justify text-[#2D2D2D]">
            <span className="font-semibold">{i + 1}. {item.key}: </span>
            <span className="font-normal">{item.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
