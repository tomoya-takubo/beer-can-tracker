'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      icon: '🏠',
      label: 'ホーム',
      active: pathname === '/'
    },
    {
      href: '/records',
      icon: '📋',
      label: '記録',
      active: pathname === '/records'
    },
    {
      href: '/stats',
      icon: '📊',
      label: '統計',
      active: pathname === '/stats'
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 z-40 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors duration-200 ${
              item.active
                ? 'text-amber-600 bg-amber-50'
                : 'text-gray-600 hover:text-amber-600'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}