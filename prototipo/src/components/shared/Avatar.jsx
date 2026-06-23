export function Avatar({ color, iniciales, size = 'default' }) {
  const dims = size === 'small' ? 'w-7 h-7 text-[0.65rem]' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${dims} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: color }}
    >
      {iniciales}
    </div>
  );
}
