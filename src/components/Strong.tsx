interface StrongProps {
  children?: React.ReactNode;
}

const Strong = ({children}: StrongProps) => {
  return (
    <strong className="text-raffia-200">
      {children}
    </strong>
  )
}

export default Strong;