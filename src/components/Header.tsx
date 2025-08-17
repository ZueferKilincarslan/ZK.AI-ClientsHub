import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:block">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search workflows, analytics..."
                className="block w-80 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">JD</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">john@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}