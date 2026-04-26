import { ChevronDown } from "lucide-react";

interface Member {
  name: string;
  tickets: number;
}

interface Props {
  label: string;
  members: Member[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (name: string) => void;
  selected: string;
}

export default function TeamDropdown({
  label,
  members,
  isOpen,
  onToggle,
  onSelect,
  selected,
}: Props) {
  return (
    <div className="relative w-52">
      
      {/* Trigger */}
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center px-3 py-2 bg-white border rounded-lg shadow-sm hover:border-gray-400 transition"
      >
        <span className="text-sm text-gray-700">
          {selected || label}
        </span>
        <ChevronDown size={14} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {members.map((m) => (
            <div
              key={m.name}
              onClick={() => onSelect(m.name)}
              className="flex justify-between items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              <span>{m.name}</span>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {m.tickets}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}