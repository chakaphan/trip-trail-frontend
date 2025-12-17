'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Compass, PlusCircle, MapIcon, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'หน้าแรก' },
    { href: '/dashboard/explore', icon: Compass, label: 'สำรวจ' },
    { href: '/dashboard/create-memory', icon: PlusCircle, label: 'เพิ่ม', special: true },
    { href: '/dashboard/trips', icon: MapIcon, label: 'ทริป' },
    { href: '/dashboard/profile', icon: User, label: 'โปรไฟล์' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-foreground/10 z-50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.special) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-nature-green to-sky-blue rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-medium text-foreground/60 mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-nature-green' : 'text-foreground/60'
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? 'fill-nature-green/20' : ''}`} />
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
