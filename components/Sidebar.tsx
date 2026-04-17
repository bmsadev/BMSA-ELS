'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { MailIcon, UsersIcon, TemplateIcon, ClockIcon, ChartIcon, GearIcon, LogoutIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Compose', icon: MailIcon },
  { href: '/members', label: 'Members', icon: UsersIcon },
  { href: '/templates', label: 'Templates', icon: TemplateIcon },
  { href: '/scheduled', label: 'Scheduled', icon: ClockIcon },
  { href: '/history', label: 'History', icon: ChartIcon },
  { href: '/settings', label: 'Settings', icon: GearIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('bmsa_auth_token');
    router.push('/');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white shadow-sidebar border-r border-bmsa-gray-200 z-40 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Logo Header */}
      <div className="p-5 border-b border-bmsa-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img src="/BMSA Logo Vertical.png" alt="BMSA" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold text-bmsa-red leading-tight">BMSA</h1>
              <p className="text-[10px] text-bmsa-text-light leading-tight">Email Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-bmsa-gray-200 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-link w-full justify-center"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRightIcon size={18} /> : <ChevronLeftIcon size={18} />}
          {!collapsed && <span className="animate-fade-in">Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          title="Logout"
        >
          <LogoutIcon size={18} />
          {!collapsed && <span className="animate-fade-in">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
