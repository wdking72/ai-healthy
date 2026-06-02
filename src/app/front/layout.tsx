import Header from "@/components/home/header";
import Footer from "@/components/home/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header/>
      {children}
      <Footer/>
    </>
  );
}