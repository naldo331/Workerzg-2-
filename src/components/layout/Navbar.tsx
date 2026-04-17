
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, Users, ClipboardList, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Workers', href: '/workers', icon: Users },
  { name: 'Request', href: '/request', icon: Briefcase },
  { name: 'Join Us', href: '/join', icon: Users },
  { name: 'Admin', href: '/admin', icon: ClipboardList },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl guild-gradient text-white shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground sm:block hidden">
                Workers <span className="text-accent">Guild</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary/20 text-primary-foreground border border-primary/30"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Button asChild size="sm" className="guild-gradient font-bold shadow-md hover:opacity-90 transition-opacity">
                <Link href="/request">Request Worker</Link>
              </Button>
            </div>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-morphism border-t p-4 space-y-2 animate-in slide-in-from-top duration-300">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all",
                pathname === item.href
                  ? "bg-primary/20 text-primary-foreground border border-primary/30"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
          <Button asChild className="w-full guild-gradient mt-4">
            <Link href="/request" onClick={() => setIsOpen(false)}>
              Request Worker
            </Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
