export default function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${
        hover ? 'transition-all duration-200 hover:shadow-md' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
