
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="fixed w-full top-0 bg-white/80 backdrop-blur-sm z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              HackInsight AI
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-purple-600 transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-purple-600 transition-colors">
              Dashboard
            </Link>
            <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
              Sign In
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
