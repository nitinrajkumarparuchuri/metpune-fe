import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, LayoutDashboard, LightbulbIcon, Award, Menu, X, Grid } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleSignIn = () => {
    sessionStorage.setItem('loginRedirect', '/hackathons');
    navigate('/login');
  };

  // Navigation links
  const navLinks = [
    { path: '/', label: 'Home', icon: <Home className="h-4 w-4 mr-2" /> },
    { path: '/index', label: 'Hub', icon: <Grid className="h-4 w-4 mr-2" /> },
    { path: '/hackathons', label: 'Hackathons', icon: <Award className="h-4 w-4 mr-2" /> },
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { path: '/insights', label: 'Insights', icon: <LightbulbIcon className="h-4 w-4 mr-2" /> },
  ];
  
  return (
    <header className="fixed w-full top-0 bg-white/80 backdrop-blur-sm z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              MetHack AI
            </span>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive(link.path) 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <Button 
              variant="ghost"
              className="text-xl font-bold ml-2 text-purple-600"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
          </nav>
          
          {/* Mobile menu trigger */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col py-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-4 top-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
                <div className="mt-8 flex flex-col space-y-2">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                        isActive(link.path) 
                          ? 'text-purple-600 bg-purple-50' 
                          : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                  <Button 
                    variant="ghost"
                    className="text-xl font-bold text-center text-purple-600 mt-4"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignIn();
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;