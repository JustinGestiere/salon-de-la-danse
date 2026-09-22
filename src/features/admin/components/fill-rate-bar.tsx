type FillRateBarProps = {
  label: string;
  capacity: number;
  filled: number;
};

export function FillRateBar({ label, capacity, filled }: FillRateBarProps) {
  const rate = capacity > 0 ? Math.round((filled / capacity) * 100) : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-gray-800">{label}</span>
        <span className="tabular-nums text-gray-500">
          {filled} / {capacity} ({rate} %)
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={rate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Taux de remplissage : ${label}`}
        className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
      >
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${rate}%` }} />
      </div>
    </div>
  );
}
