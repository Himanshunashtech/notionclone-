import { Navbar } from "./_components/Navbar";
import { Footer } from "./_components/Footer";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="dark:bg-dark min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
};
export default LandingLayout;
