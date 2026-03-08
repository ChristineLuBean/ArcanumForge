interface SectionProps {
  title: string;
  children?: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => {
  return (
    <section>
      <div
        className="max-w-180 md:w-180 border border-bleached-cedar-950 rounded-lg p-6 mb-6"
        style={{
          background: "linear-gradient(135deg, #130f18 0%, #0f0c14 100%)",
          boxShadow:
            "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div className="flex justify-center items-center text-center gap-3 mb-4">
          <div
            className="h-px w-6"
            style={{
              background: "linear-gradient(90deg, transparent, #5a3e22)",
            }}
          />
          <h3 className="font-trajan-pro text-sm tracking-widest uppercase text-[#8b6535] m-0 whitespace-nowrap">
            {title}
          </h3>
          <div
            className="h-px w-6 flex-1"
            style={{
              background: "linear-gradient(-90deg, transparent, #5a3e22)",
            }}
          />
        </div>
        <div className="text-sm leading-[1.75] text-[#b0a090]">
          {children}
        </div>
      </div>
    </section>
  );
};

export default Section;
