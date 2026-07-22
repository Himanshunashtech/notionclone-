import { Logo } from "./Logo";
import Link from "next/link";
import { Github, Twitter, Youtube, Linkedin, Instagram, MessageSquare, Facebook, Share2, AtSign, Globe, Heart } from "lucide-react";

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
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href="https://github.com/zotion-app" target="_blank" title="GitHub" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-200 hover:text-foreground">
                <Github className="h-4 w-4" />
              </Link>
              <Link href="https://x.com/zotion_app" target="_blank" title="Twitter / X" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-200 hover:text-foreground">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="https://linkedin.com/company/zotion" target="_blank" title="LinkedIn" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-200 hover:text-foreground">
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link href="https://youtube.com/@zotion" target="_blank" title="YouTube" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-200 hover:text-foreground">
                <Youtube className="h-4 w-4" />
              </Link>
              <Link href="https://discord.gg/zotion" target="_blank" title="Discord" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-200 hover:text-foreground">
                <MessageSquare className="h-4 w-4" />
              </Link>
              <Link href="https://instagram.com/zotionapp" target="_blank" title="Instagram" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-200 hover:text-foreground">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="https://reddit.com/r/zotion" target="_blank" title="Reddit" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-200 hover:text-foreground">
                <Share2 className="h-4 w-4" />
              </Link>
              <Link href="https://facebook.com/zotionapp" target="_blank" title="Facebook" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-200 hover:text-foreground">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="https://threads.net/@zotionapp" target="_blank" title="Threads" className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-200 hover:text-foreground">
                <AtSign className="h-4 w-4" />
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

