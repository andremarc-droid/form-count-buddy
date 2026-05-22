
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import logo from '@/assets/DICT-Malaybalay.png';

import { Button } from '@/components/ui/button';
import { dictAuth } from '@/lib/firebase-dict';
import { cn } from '@/lib/utils';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  FileText,
  LineChart,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Clock,
  Users,
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from './theme-provider';

const attendanceNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dict/admin/dashboard' },
  { label: 'Attendance', icon: Clock, path: '/dict/admin/attendance' },
  { label: 'Analytics', icon: LineChart, path: '/dict/admin/attendance/analytics' },
  { label: 'Reports', icon: FileText, path: '/dict/admin/attendance/reports' },
];

const visitorsNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dict/admin/dashboard' },
  { label: 'Visitors', icon: Users, path: '/dict/admin/visitors' },
  { label: 'Analytics', icon: LineChart, path: '/dict/admin/analytics' },
  { label: 'Reports', icon: FileText, path: '/dict/admin/reports' },
];

type Tab = 'attendance' | 'visitors';

const DictAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  // Tab is stored in URL query param so refresh preserves it
  const activeTab = (searchParams.get('tab') as Tab) || 'attendance';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(dictAuth, (user) => {
      if (!user) {
        navigate('/dict/admin/login');
      } else {
        // On first load after login, ensure tab query param is set
        if (!searchParams.has('tab')) {
          setSearchParams({ tab: 'attendance' });
        } else {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, searchParams, setSearchParams]);

  useEffect(() => {
    setLoading(false);
  }, [activeTab]);

  const handleLogout = async () => {
    await signOut(dictAuth);
    navigate('/dict/admin/login');
  };

  const switchTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    const newPath = `${location.pathname}?${params.toString()}`;
    navigate(newPath);
  };

  const currentNav = activeTab === 'attendance' ? attendanceNav : visitorsNav;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden relative">
      {/* Top Tab Bar */}
      <div className="w-full border-b border-border bg-background z-20">
        <div className="flex items-center h-12 px-4 md:px-8 max-w-screen-2xl mx-auto">
          {/* Logo */}
          <img
            src={logo}
            alt="DICT Logo"
            className="h-8 w-auto mr-auto md:mr-6 object-contain"
          />
          {/* Tab Tabs */}
          <div className="flex items-center">
            <button
              onClick={() => switchTab('attendance')}
              className={cn(
                'relative pb-2 px-2 text-sm font-semibold transition-colors duration-200',
                activeTab === 'attendance'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              style={{ marginRight: '24px' }}
            >
              Attendance
              {activeTab === 'attendance' && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-200"
                />
              )}
            </button>
            <button
              onClick={() => switchTab('visitors')}
              className={cn(
                'relative pb-2 px-2 text-sm font-semibold transition-colors duration-200',
                activeTab === 'visitors'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Visitors
              {activeTab === 'visitors' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar — emerald/green theme */}
      <aside className="hidden md:flex w-64 h-full bg-emerald-900 border-r border-emerald-800 flex-col shadow-2xl z-10 transition-all duration-300">
        <div className="px-2 py-2 border-b border-emerald-800">
          <div className="text-center py-3">
            <h2 className="font-heading font-bold text-emerald-50 text-xl tracking-tight">DICT Provincial</h2>
            <p className="text-[10px] text-emerald-300 font-medium leading-tight uppercase tracking-wider">Foot Traffic Monitor</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {currentNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 translate-x-1'
                    : 'text-emerald-200 hover:bg-emerald-800 hover:text-emerald-50 hover:translate-x-1'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-emerald-200')} />
                {item.label}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-md bg-white opacity-80" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-800 space-y-2 bg-emerald-900/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-emerald-200 hover:text-emerald-50 hover:bg-emerald-800 rounded-xl transition-all"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 mr-3" />
            ) : (
              <Moon className="h-5 w-5 mr-3" />
            )}
            <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-3 border-b bg-background z-10">
        <div className="flex items-center gap-1.5">
          <img src={logo} alt="DICT Logo" className="h-10 w-auto object-contain" />
          <div>
            <h2 className="font-heading font-bold text-[13px] leading-tight">DICT Provincial</h2>
            <p className="text-[9px] text-muted-foreground leading-tight">Foot Traffic Monitor</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-auto p-4 pb-20 md:p-8 md:pb-8">
          <Outlet />
        </div>

        {/* Mobile Bottom Tab Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-background border-t border-border p-2">
          {currentNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center w-full py-1 gap-1 text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-emerald-600'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-emerald-600')} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
};

export default DictAdminLayout;
