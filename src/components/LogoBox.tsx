'use client'

import defaultLogo from '@/assets/images/logo.png'
import Image from 'next/image'
import Link from 'next/link'
import { useGetGeneralSettingsQuery } from '@/store/generalSettingsApi'

const LogoBox = () => {
  const { data: generalSettings } = useGetGeneralSettingsQuery()
  
  
  // Use dynamic logo from settings or fallback to default
  const logoUrl = generalSettings?.logo || defaultLogo
  const isExternal = typeof logoUrl === 'string' && (logoUrl.includes('cloudinary') || logoUrl.includes('http'))

  return (
    <div className="logo-box">
      {/* Dark Logo */}
      <Link href="/" className="logo-dark" aria-label="Home">
        <span className="logo-sm">
          <Image 
            src={logoUrl} 
            width={28} 
            height={26} 
            alt="Small Dark Logo" 
            unoptimized={isExternal}
          />
        </span>
        <span className="logo-lg object-cover">
          <Image 
            src={logoUrl} 
            width={60} 
            height={60} 
            alt="Large Dark Logo" 
            unoptimized={isExternal}
          />
        </span>
      </Link>

      {/* Light Logo */}
      <Link href="/" className="logo-light" aria-label="Home">
        <span className="logo-sm">
          <Image 
            src={logoUrl} 
            width={28} 
            height={26} 
            alt="Small Light Logo" 
            unoptimized={isExternal}
          />
        </span>
        <span className="logo-lg object-cover">
          <Image 
            src={logoUrl} 
            width={60} 
            height={60} 
            alt="Large Light Logo" 
            unoptimized={isExternal}
          />
        </span>
      </Link>
    </div>
  )
}

export default LogoBox
