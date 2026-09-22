import type { ReactNode } from "react";

export default function PrintLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-2xl p-6 print:p-0">{children}</div>;
}
