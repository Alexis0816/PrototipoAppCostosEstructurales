export function NavBar({ children }) {
  return (
    <div className="bg-navy-950/95 backdrop-blur-xl border-b border-navy-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">{children}</div>
    </div>
  );
}
