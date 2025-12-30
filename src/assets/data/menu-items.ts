import { MenuItemType } from '@/types/menu'

export const MENU_ITEMS: MenuItemType[] = [
  // ============ GENERAL (Everyone) ============
  {
    key: 'general',
    label: 'General',
    isTitle: true,
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'solar:widget-5-bold-duotone',
    url: '/dashboard',
  },

  // ============ ADMIN ONLY SECTIONS ============
  // {
  //   key: 'onboarding',
  //   label: 'OnBoarding',
  //   icon: 'solar:star-bold-duotone',
  //   allowedRoles: ['admin'],
  //   children: [
  //     {
  //       key: 'onboarding-add',
  //       label: 'Add Onboarding',
  //       url: '/onboarding/onboarding-add',
  //       parentKey: 'onboarding',
  //     },
  //     {
  //       key: 'onboarding-list',
  //       label: 'Onboarding List',
  //       url: '/onboarding/onboarding-list',
  //       parentKey: 'onboarding',
  //     },
  //   ],
  // },
  // {
  //   key: 'category',
  //   icon: 'solar:clipboard-list-bold-duotone',
  //   label: 'Category',
  //   allowedRoles: ['admin'],
  //   children: [
  //     {
  //       key: 'category-add',
  //       label: 'Create Category',
  //       url: '/category/category-add',
  //       parentKey: 'category',
  //     },
  //     {
  //       key: 'category-list',
  //       label: 'Category List',
  //       url: '/category/category-list',
  //       parentKey: 'category',
  //     },
  //   ],
  // },
  {
    key: 'home-banner',
    label: 'Home Banner',
    icon: 'solar:home-bold-duotone',
    url: '/home-banner',
    allowedRoles: ['admin'],
  },
  {
    key: 'section-settings',
    label: 'Section Settings',
    icon: 'solar:palette-bold-duotone',
    url: '/section-settings',
    allowedRoles: ['admin'],
  },



  // ============ MOVIES (Admin + Film Trade/Movie Watch Vendors) ============
  {
    key: 'filmtrade',
    icon: 'bx:movie',
    label: 'Film Trade',
    allowedRoles: ['admin', 'vendor'],
    allowedServices: ['film_trade', 'movie_watch'],
    children: [
      {
        key: 'movies-category-add',
        label: 'Create Category',
        url: '/movies/movies-category-add',
        parentKey: 'movies',
        allowedRoles: ['admin'],
      },
      {
        key: 'movies-category-list',
        label: 'Movies Category List',
        url: '/movies/movies-category-list',
        parentKey: 'movies',
        allowedRoles: ['admin'],
      },
      {
        key: 'movies-list-add',
        label: 'Add Movie',
        url: '/movies/movies-add',
        parentKey: 'movies',
      },
      {
        key: 'movies-list',
        label: 'My Movies',
        url: '/movies/movies-list',
        parentKey: 'movies',
      },
    ],
  },

  // ============ EVENTS (Admin + Events Vendors) ============
  {
    key: 'events',
    icon: 'bx:music',
    label: 'Events',
    allowedRoles: ['admin', 'vendor'],
    allowedServices: ['events'],
    children: [
      {
        key: 'events-category-add',
        label: 'Create Category',
        url: '/events/category-add',
        parentKey: 'events',
        allowedRoles: ['admin'],
      },
      {
        key: 'events-category-list',
        label: 'Category List',
        url: '/events/category-list',
        parentKey: 'events',
        allowedRoles: ['admin'],
      },
      {
        key: 'events-list-add',
        label: 'Add Event',
        url: '/events/events-add',
        parentKey: 'events',
      },
      {
        key: 'events-list',
        label: 'My Events',
        url: '/events/events-list',
        parentKey: 'events',
      },
    ],
  },

  // ============ TICKET SCANNER ACCESS (Events Vendors) ============
  {
    key: 'ticket-scanner',
    icon: 'solar:qr-code-bold-duotone',
    label: 'Ticket Scanner',
    allowedRoles: ['admin', 'vendor'],
    allowedServices: ['events'],
    children: [
      {
        key: 'scanner-access-add',
        label: 'Add Scanner Access',
        url: '/ticket-scanner/add',
        parentKey: 'ticket-scanner',
      },
      {
        key: 'scanner-access-list',
        label: 'Scanner Accounts',
        url: '/ticket-scanner/list',
        parentKey: 'ticket-scanner',
      },
      {
        key: 'scanner-logs',
        label: 'Scan Logs',
        url: '/ticket-scanner/logs',
        parentKey: 'ticket-scanner',
      },
    ],
  },

    // ============ BOOKINGS (Role + Service based) ============
  {
    key: 'bookings',
    icon: 'bx:list-check',
    label: 'Event Ticket Bookings',
    children: [
      // {
      //   key: 'movies-bookings',
      //   label: 'Movies Bookings',
      //   url: '/bookings/movies-bookings',
      //   parentKey: 'bookings',
      //   allowedRoles: ['admin', 'vendor'],
      //   allowedServices: ['film_trade', 'movie_watch'],
      // },
      {
        key: 'events-bookings',
        label: 'Events Bookings',
        url: '/bookings/events-bookings',
        parentKey: 'bookings',
        allowedRoles: ['admin', 'vendor'],
        allowedServices: ['events'],
      },
    ],
  },

  
  // ============ WATCH VIDEOS (Admin + Movie Watch Vendors) ============
  {
    key: 'watch-videos',
    icon: 'solar:play-bold-duotone',
    label: 'Watch Videos',
    allowedRoles: ['admin', 'vendor'],
    allowedServices: ['movie_watch'],
    children: [
      {
        key: 'watch-videos-category-add',
        label: 'Create Category',
        url: '/watch-videos/category-add',
        parentKey: 'watch-videos',
        allowedRoles: ['admin'],
      },
      {
        key: 'watch-videos-category-list',
        label: 'Category List',
        url: '/watch-videos/category-list',
        parentKey: 'watch-videos',
        allowedRoles: ['admin'],
      },
      {
        key: 'watch-videos-channels',
        label: 'Channels',
        url: '/watch-videos/channels-list',
        parentKey: 'watch-videos',
      },
      {
        key: 'watch-videos-add',
        label: 'Add Video',
        url: '/watch-videos/videos-add',
        parentKey: 'watch-videos',
      },
      {
        key: 'watch-videos-list',
        label: 'My Videos',
        url: '/watch-videos/videos-list',
        parentKey: 'watch-videos',
      },
      {
        key: 'watch-videos-purchases',
        label: 'Video Purchases',
        url: '/watch-videos/purchases',
        parentKey: 'watch-videos',
        allowedRoles: ['admin'],
      },
    ],
  },

  // ============ ADMIN ONLY ============
  {
    key: 'advertise',
    label: 'Advertise',
    icon: 'solar:box-bold-duotone',
    allowedRoles: ['admin'],
    children: [
      {
        key: 'advertise-add',
        label: 'Create Advertise',
        url: '/advertise/advertise-add',
        parentKey: 'advertise',
      },
      {
        key: 'advertise-list',
        label: 'Advertise List',
        url: '/advertise/advertise-list',
        parentKey: 'advertise',
      },
    ],
  },
  // {
  //   key: 'subscription',
  //   label: 'Subscription Plan',
  //   icon: 'solar:dollar-bold-duotone',
  //   allowedRoles: ['admin'],
  //   children: [
  //     {
  //       key: 'subscription-add',
  //       label: 'Create Plan',
  //       url: '/subscription/subscription-add',
  //       parentKey: 'subscription',
  //     },
  //     {
  //       key: 'subscription-list',
  //       label: 'Subscription List',
  //       url: '/subscription/subscription-list',
  //       parentKey: 'subscription',
  //     },
  //   ],
  // },
  // {
  //   key: 'cinema-hall',
  //   label: 'Cinema Hall',
  //   icon: 'solar:ticket-bold-duotone',
  //   children: [
  //     {
  //       key: 'cinema-hall-add',
  //       label: 'Add Cinema Hall',
  //       url: '/cinema-hall/cinema-hall-add',
  //       parentKey: 'cinema-hall',
  //     },
  //     {
  //       key: 'cinema-hall-list',
  //       label: 'Cinema Hall List',
  //       url: '/cinema-hall/cinema-hall-list',
  //       parentKey: 'cinema-hall',
  //     },
  //   ],
  // },

  // ============ VENDOR MANAGEMENT (Admin Only) ============
  {
    key: 'vendor-management',
    label: 'VENDOR MANAGEMENT',
    isTitle: true,
    allowedRoles: ['admin'],
  },
  {
    key: 'vendor-packages',
    label: 'Vendor Packages',
    icon: 'solar:box-bold-duotone',
    allowedRoles: ['admin'],
    children: [
      {
        key: 'vendor-packages-add',
        label: 'Add Package',
        url: '/vendor-packages/add',
        parentKey: 'vendor-packages',
      },
      {
        key: 'vendor-packages-list',
        label: 'Packages List',
        url: '/vendor-packages/list',
        parentKey: 'vendor-packages',
      },
    ],
  },
  {
    key: 'platform-settings',
    label: 'Platform Fees',
    icon: 'solar:settings-minimalistic-bold-duotone',
    url: '/vendor-settings/platform-fees',
    allowedRoles: ['admin'],
  },
  {
    key: 'vendor-applications',
    label: 'Vendor Applications',
    icon: 'solar:document-add-bold-duotone',
    allowedRoles: ['admin'],
    children: [
      {
        key: 'vendor-applications-pending',
        label: 'Pending Applications',
        url: '/vendor-applications/pending',
        parentKey: 'vendor-applications',
      },
      {
        key: 'vendor-applications-all',
        label: 'All Applications',
        url: '/vendor-applications/list',
        parentKey: 'vendor-applications',
      },
    ],
  },

  // ============ USERS (Admin Only) ============
  // {
  //   key: 'payment',
  //   label: 'Payment',
  //   isTitle: true,
  //   allowedRoles: ['admin'],
  // },
  // {
  //   key: 'vendors-list',
  //   label: 'Approved Vendors',
  //   icon: 'solar:user-check-bold-duotone',
  //   url: '/vendors/vendors-list',
  //   parentKey: 'users',
  //   allowedRoles: ['admin'],
  // },
  // {
  //   key: 'vendors-payment-history',
  //   label: 'Vendors Payment History',
  //   icon: 'solar:dollar-bold-duotone',
  //   url: '/vendors/vendors-payment-history',
  //   parentKey: 'users',
  //   allowedRoles: ['admin'],
  // },

  // ============ ROLES (Admin Only) ============
  // {
  //   key: 'role',
  //   label: 'ROLES',
  //   isTitle: true,
  //   allowedRoles: ['admin'],
  // },
  // {
  //   key: 'access-management',
  //   label: 'Roles Management',
  //   icon: 'solar:user-bold-duotone',
  //   allowedRoles: ['admin'],
  //   children: [
  //     {
  //       key: 'roles-add',
  //       label: 'Add Role',
  //       url: '/role/add-role',
  //       parentKey: 'role',
  //     },
  //     {
  //       key: 'roles-list',
  //       label: 'Roles List',
  //       url: '/role/role-list',
  //       parentKey: 'role',
  //     },
  //   ],
  // },

  // ============ PROFILE & SETTINGS ============
  {
    key: 'profile-title',
    label: 'ACCOUNT',
    isTitle: true,
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: 'solar:user-circle-bold-duotone',
    url: '/profile',
  },

  // ============ WALLET (Vendors) ============
  {
    key: 'wallet-title',
    label: 'WALLET',
    isTitle: true,
    allowedRoles: ['vendor'],
  },
  {
    key: 'wallet',
    label: 'Wallet',
    icon: 'solar:wallet-bold-duotone',
    allowedRoles: ['vendor'],
    children: [
      {
        key: 'wallet-dashboard',
        label: 'My Wallet',
        url: '/wallet',
        parentKey: 'wallet',
      },
      {
        key: 'wallet-withdrawals',
        label: 'Withdrawal History',
        url: '/wallet/withdrawals',
        parentKey: 'wallet',
      },
    ],
  },

  // ============ ADMIN WALLET (Admin Only) ============
  {
    key: 'admin-wallet-title',
    label: 'PLATFORM EARNINGS',
    isTitle: true,
    allowedRoles: ['admin'],
  },
  {
    key: 'admin-wallet',
    label: 'Platform Earnings',
    icon: 'solar:wallet-money-bold-duotone',
    url: '/admin-wallet',
    allowedRoles: ['admin'],
  },

  // ============ ENQUIRES (Everyone) ============
  {
    key: 'enquires',
    label: 'ENQUIRES',
    isTitle: true,
  },
  {
    key: 'enquires-list',
    label: 'Enquires',
    icon: 'solar:document-text-bold-duotone',
    url: '/enquires/enquires-list',
    parentKey: 'enquires',
  },

  // ============ SUPPORT (Admin Only) ============
  {
    key: 'support',
    label: 'SUPPORT',
    isTitle: true,
    allowedRoles: ['admin'],
  },
  {
    key: 'help-center',
    label: 'Help-Center',
    icon: 'solar:help-bold-duotone',
    url: '/support/help-center',
    parentKey: 'support',
    allowedRoles: ['admin'],
  },
  {
    key: 'faqs',
    label: 'FAQs',
    icon: 'solar:question-circle-bold-duotone',
    url: '/support/faqs',
    parentKey: 'support',
    allowedRoles: ['admin'],
  },
  {
    key: 'privacy-policy',
    label: 'Privacy Policy',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/privacy-policy',
    parentKey: 'support',
    allowedRoles: ['admin'],
  },
  {
    key: 'terms-conditions',
    label: 'Terms & Conditions',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/terms-conditions',
    parentKey: 'support',
    allowedRoles: ['admin'],
  },
  {
    key: 'cancellation-refund',
    label: 'Cancellation & Refund',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/cancellation-refund',
    parentKey: 'support',
    allowedRoles: ['admin'],
  },
  {
    key: 'partner-terms',
    label: 'Partner Terms & Conditions',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/partner-terms',
    parentKey: 'support',
    allowedRoles: ['admin'],
  },
  {
    key: 'about-us',
    label: 'About Us',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/about-us',
    parentKey: 'support',
    allowedRoles: ['admin'],
  },
  {
    key: 'contact-us',
    label: 'Contact Us',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/contact-us-content',
    parentKey: 'support',
    allowedRoles: ['admin'],
  },

  {
    key: 'settings-title',
    label: 'Settings',
    isTitle: true,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'solar:settings-bold-duotone',
    url: '/settings',
    parentKey: 'settings-title',
  },
]
