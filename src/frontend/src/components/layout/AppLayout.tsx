import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  DoorOpen,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const navItems = userProfile?.userType === 'FlatOwner' ? [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: CreditCard, label: 'Maintenance', path: '/maintenance' },
    { icon: FileText, label: 'Expenditures', path: '/expenditures' },
    { icon: MessageSquare, label: 'Complaints', path: '/complaints' },
    { icon: Bell, label: 'Notices', path: '/notices' },
    { icon: DoorOpen, label: 'Visitor Requests', path: '/my-visitor-requests' },
    { icon: User, label: 'Profile', path: '/profile' },
  ] : userProfile?.userType === 'Secretary' ? [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: AlertCircle, label: 'Overdue', path: '/overdue' },
    { icon: FileText, label: 'Expenditures', path: '/expenditures/admin' },
    { icon: MessageSquare, label: 'Complaints', path: '/complaints/admin' },
    { icon: Bell, label: 'Notices', path: '/notices' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ] : [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: DoorOpen, label: 'Visitor Requests', path: '/visitor-requests' },
    { icon: Bell, label: 'Notices', path: '/notices' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/vision-galaxy-logo.dim_512x512.png" 
              alt="Vision Galaxy Society" 
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-lg font-bold">Vision Galaxy Society</h1>
              {userProfile && (
                <p className="text-xs text-muted-foreground">
                  {userProfile.userType === 'FlatOwner' && userProfile.flatNumber 
                    ? `Flat ${userProfile.flatNumber}` 
                    : userProfile.userType}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/change-password' })}
              className="hidden sm:flex"
            >
              Change Password
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t sm:hidden">
            <nav className="container px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate({ to: item.path });
                    setMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate({ to: '/change-password' });
                  setMobileMenuOpen(false);
                }}
              >
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Navigation */}
      <div className="hidden sm:block border-b bg-muted/30">
        <nav className="container px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: item.path })}
                className="shrink-0"
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="container px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container px-4 py-6 text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
