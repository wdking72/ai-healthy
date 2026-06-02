import { ReactNode } from "react";
import SideImage from "@/components/auth/sideImage";
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <SideImage />
      {children}
    </>
  )
}