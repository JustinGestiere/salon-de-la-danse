import { buildQrMatrix } from "@/features/badges/qr";

/// Noir sur blanc pur : le contraste maximal que les lecteurs attendent.
const QR_LIGHT_COLOR = "#ffffff";
const QR_DARK_COLOR = "#000000";

type QrCodeProps = {
  value: string;
  label: string;
  className?: string;
};

export function QrCode({ value, label, className = "" }: QrCodeProps) {
  const matrix = buildQrMatrix(value);

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${matrix.size} ${matrix.size}`}
      shapeRendering="crispEdges"
      className={className}
    >
      <rect width={matrix.size} height={matrix.size} fill={QR_LIGHT_COLOR} />
      <path d={matrix.path} fill={QR_DARK_COLOR} />
    </svg>
  );
}
