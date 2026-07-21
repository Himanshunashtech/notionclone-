import { Logo } from "./Logo";
import Link from "next/link";
import { Github, Twitter, Youtube, Globe, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full border-t bg-background dark:bg-dark text-muted-foreground transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 pt-6 pb-12 md:pt-8 md:pb-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-5">
          {/* Brand Column */}
          <div className="md:col-span-2 flex flex-col gap-y-4">
            <Logo />
            <p className="mt-2 text-sm max-w-xs leading-relaxed text-muted-foreground/80">
              The connected workspace where better, faster work happens. Plan, write, collaborate, and get organized.
            </p>
            <div className="flex gap-x-3 mt-4">
              <Link href="https://github.com" target="_blank" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-200 hover:text-foreground">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" target="_blank" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-200 hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://youtube.com" target="_blank" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-200 hover:text-foreground">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="#" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-200 hover:text-foreground">
                <Globe className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product links */}
          <div className="flex flex-col gap-y-3">
            <h3 className="font-semibold text-foreground text-sm tracking-wider uppercase">Product</h3>
            <Link href="/overview" className="text-sm hover:text-foreground transition duration-200">Overview</Link>
            <Link href="/pricing" className="text-sm hover:text-foreground transition duration-200">Pricing</Link>
            <Link href="/integrations" className="text-sm hover:text-foreground transition duration-200">Integrations</Link>
            <Link href="/changelog" className="text-sm hover:text-foreground transition duration-200">Changelog</Link>
            <Link href="/roadmap" className="text-sm hover:text-foreground transition duration-200">Roadmap</Link>
          </div>

          {/* Company links */}
          <div className="flex flex-col gap-y-3">
            <h3 className="font-semibold text-foreground text-sm tracking-wider uppercase">Company</h3>
            <Link href="/about" className="text-sm hover:text-foreground transition duration-200">About Us</Link>
            <Link href="/careers" className="text-sm hover:text-foreground transition duration-200">Careers</Link>
            <Link href="/press" className="text-sm hover:text-foreground transition duration-200">Press</Link>
            <Link href="/blog" className="text-sm hover:text-foreground transition duration-200">Blog</Link>
            <Link href="/culture" className="text-sm hover:text-foreground transition duration-200">Culture</Link>
          </div>

          {/* Legal links */}
          <div className="flex flex-col gap-y-3">
            <h3 className="font-semibold text-foreground text-sm tracking-wider uppercase">Legal</h3>
            <Link href="/privacy" className="text-sm hover:text-foreground transition duration-200">Privacy Policy</Link>
            <Link href="/terms" className="text-sm hover:text-foreground transition duration-200">Terms of Service</Link>
            <Link href="/security" className="text-sm hover:text-foreground transition duration-200">Security</Link>
            <Link href="/cookies" className="text-sm hover:text-foreground transition duration-200">Cookies Settings</Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-y-4">
          <p className="text-xs text-muted-foreground/70">
            &copy; {new Date().getFullYear()} Zotion Inc. All rights reserved.
          </p>
          <p className="text-xs flex items-center gap-x-1 text-muted-foreground/70">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> for organizers.
          </p>
        </div>
      </div>
    </footer>
  );
};

