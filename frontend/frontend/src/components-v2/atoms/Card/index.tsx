const Card = ({ children, className = '' }) => (
  <div className={`p-6 bg-white border border-[#EAECF0] rounded-lg shadow-card ${className}`}>{children}</div>
)

export default Card
