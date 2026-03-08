interface MonoProps {
  children?: React.ReactNode;
}

const Mono = ({children}: MonoProps) => {
  return (
    <code className="bg-[#c8a06022] border border-[#c8a06044] rounded-sm py-[0.05rem] px-1.5 font-mono text-[#c8a060] text-sm">
      {children}
    </code>
  )
}

export default Mono;