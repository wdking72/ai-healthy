import { ReactNode } from "react";
import SideImage from "@/components/auth/sideImage";
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SideImage />
      <div className="w-1/2 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}