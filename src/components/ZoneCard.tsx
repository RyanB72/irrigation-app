interface ZoneCardProps {
  zoneNumber: number;
  zoneName: string;
  isActive?: boolean;
  onClick: () => void;
}

export function ZoneCard({ zoneNumber, zoneName, isActive = false, onClick }: ZoneCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        p-6 rounded-lg border-2 transition-all duration-200
        ${isActive
          ? 'bg-water-100 border-water-500 shadow-lg'
          : 'bg-white border-gray-200 hover:border-water-300 hover:shadow-md'
        }
      `}
    >
      <div className="text-sm text-gray-600 mb-1">Zone {zoneNumber}</div>
      <div className="text-xl font-semibold text-gray-800">{zoneName}</div>
      {isActive && (
        <div className="mt-2 flex items-center gap-2 text-water-600">
          <div className="w-2 h-2 rounded-full bg-water-500 animate-pulse" />
          <span className="text-sm font-medium">Active</span>
        </div>
      )}
      <div className="mt-3 text-sm text-gray-500">
        Click to configure
      </div>
    </button>
  );
}
