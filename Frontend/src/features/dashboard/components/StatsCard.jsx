const StatsCard = ({ label, value, accent, icon }) => (
  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${accent}`}>
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-2xl font-bold leading-tight text-gray-900">{value}</p>
      <p className="truncate text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default StatsCard;