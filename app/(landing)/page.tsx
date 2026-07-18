import { Heading } from "./_components/Heading";
import { Heroes } from "./_components/Heroes";
import { Features } from "./_components/Features";

export default function LandingPage() {
  return (
    <div className="dark:bg-dark flex min-h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-y-8 px-6 pb-10 text-center md:justify-start">
        <Heading />
        <Heroes />
        <Features />
      </div>
    </div>
  );
}
