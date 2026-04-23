import { Info } from 'lucide-react'

export default function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative group ml-1 inline-flex items-center">
      <Info size={14} className="text-gray-400 cursor-help" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[11px] text-white
        bg-gray-700 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {text}
      </span>
    </span>
  )
}
