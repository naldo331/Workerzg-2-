
import Link from 'next/link';
import { Shield, Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg guild-gradient text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">Workers Guild</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Connecting trusted local workers with on-demand service requests. Quality work, guaranteed by the Guild.
            </p>
            <div className="flex space-x-4">
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
              <Github className="h-5 w-5 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/workers" className="text-muted-foreground hover:text-accent transition-colors">Browse Workers</Link></li>
              <li><Link href="/request" className="text-muted-foreground hover:text-accent transition-colors">Post a Job</Link></li>
              <li><Link href="/join" className="text-muted-foreground hover:text-accent transition-colors">Apply to Join</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-accent transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-xs text-muted-foreground mb-4">Get the latest updates from the Guild.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-background border border-border rounded-md px-3 py-1.5 text-sm w-full outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="bg-primary px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-primary/90">Join</button>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Workers Guild. All rights reserved. Built for professional local services.
        </div>
      </div>
    </footer>
  );
}
