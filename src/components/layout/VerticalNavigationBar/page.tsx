'use client'

import FallbackLoading from '@/components/FallbackLoading'
import LogoBox from '@/components/LogoBox'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import useFilteredMenu from '@/hooks/useFilteredMenu'
import { Suspense } from 'react'
import AppMenu from './components/AppMenu'
import HoverMenuToggle from './components/HoverMenuToggle'

const VerticalNavigationBarPage = () => {
  const { filteredMenu } = useFilteredMenu()
  
  return (
    <div className="main-nav">
      <LogoBox />
      <HoverMenuToggle />
      <SimplebarReactClient className="scrollbar" data-simplebar>
        <Suspense fallback={<FallbackLoading />}>
          <AppMenu menuItems={filteredMenu} />
        </Suspense>
      </SimplebarReactClient>
    </div>
  )
}

export default VerticalNavigationBarPage
