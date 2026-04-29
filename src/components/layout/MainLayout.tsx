import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <NavBar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-zinc-950 border-t border-zinc-900 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-400">
          <p>© {new Date().getFullYear()} Workers Guild Jamaica. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="/support" className="hover:text-yellow-400 transition-colors">Support</a>
            <a href="/help" className="hover:text-yellow-400 transition-colors">Help Center</a>
            <a href="/privacy" className="hover:text-yellow-400 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-yellow-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
