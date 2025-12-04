'use client'

import { useMemo } from 'react'
import { useAppSelector } from './useAppDispatch'
import { MENU_ITEMS } from '@/assets/data/menu-items'
import { MenuItemType } from '@/types/menu'

type UserRole = 'admin' | 'vendor' | 'user'
type VendorService = 'film_trade' | 'events' | 'movie_watch'

export const useFilteredMenu = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  const filteredMenu = useMemo(() => {
    if (!isAuthenticated || !user) {
      return []
    }

    const userRole: UserRole = user.role || 'user'
    const vendorServices: VendorService[] = user.vendorServices || []

    // Helper to check if user has access to a menu item
    const hasAccess = (item: MenuItemType): boolean => {
      // If no role restriction, everyone has access
      if (!item.allowedRoles || item.allowedRoles.length === 0) {
        // But if it has service restrictions and user is vendor, check services
        if (item.allowedServices && item.allowedServices.length > 0 && userRole === 'vendor') {
          return item.allowedServices.some((service) => vendorServices.includes(service))
        }
        return true
      }

      // Check if user's role is allowed
      if (!item.allowedRoles.includes(userRole)) {
        return false
      }

      // If user is vendor and item has service restrictions, check services
      if (userRole === 'vendor' && item.allowedServices && item.allowedServices.length > 0) {
        return item.allowedServices.some((service) => vendorServices.includes(service))
      }

      return true
    }

    // Filter menu items recursively
    const filterItems = (items: MenuItemType[]): MenuItemType[] => {
      return items
        .filter((item) => {
          // For title items, check if any following items are accessible
          if (item.isTitle) {
            // Check next items until we hit another title or end
            const idx = items.indexOf(item)
            for (let i = idx + 1; i < items.length; i++) {
              if (items[i].isTitle) break
              if (hasAccess(items[i])) return true
            }
            return false
          }
          return hasAccess(item)
        })
        .map((item) => {
          // Filter children if they exist
          if (item.children && item.children.length > 0) {
            const filteredChildren = item.children.filter((child) => hasAccess(child))
            // Only include if there are accessible children
            if (filteredChildren.length === 0) {
              return null
            }
            return { ...item, children: filteredChildren }
          }
          return item
        })
        .filter((item): item is MenuItemType => item !== null)
    }

    return filterItems(MENU_ITEMS)
  }, [user, isAuthenticated])

  return { filteredMenu, user, isAuthenticated }
}

export default useFilteredMenu
