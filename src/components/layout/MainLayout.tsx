import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import NavBar from './NavBar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <NavBar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-zinc-950 border-t border-zinc-900 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-zinc-400 mb-6">
            <p>© {new Date().getFullYear()} Workers Guild Jamaica. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link to="/support" className="hover:text-yellow-400 transition-colors">Support</Link>
              <Link to="/help" className="hover:text-yellow-400 transition-colors">Help Center</Link>
              <Link to="/privacy" className="hover:text-yellow-400 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-yellow-400 transition-colors">Terms</Link>
            </div>
          </div>
          <div className="text-xs text-zinc-600 text-center max-w-4xl mx-auto">
            <p><strong>Disclaimer:</strong> Workers Guild connects clients with independent workers. We do not employ workers and are not responsible for the actions, quality of work, or outcomes of any job. Users engage services at their own risk.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
