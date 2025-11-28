import { MenuItemType } from '@/types/menu'

export const MENU_ITEMS: MenuItemType[] = [
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
  {
    key: 'onboarding',
    label: 'OnBoarding',
    icon: 'solar:star-bold-duotone',
    children: [
      {
        key: 'onboarding-add',
        label: 'Add Onboarding',
        url: '/onboarding/onboarding-add',
        parentKey: 'onboarding',
      },
      {
        key: 'onboarding-list',
        label: 'Onboarding List',
        url: '/onboarding/onboarding-list',
        parentKey: 'onboarding',
      },
    ],
  },
  {
    key: 'category',
    icon: 'solar:clipboard-list-bold-duotone',
    label: 'Category',
    children: [
      {
        key: 'category-add',
        label: 'Create Category',
        url: '/category/category-add',
        parentKey: 'category',
      },
      {
        key: 'category-list',
        label: 'Category List',
        url: '/category/category-list',
        parentKey: 'category',
      },
    ],
  },
  {
    key: 'home-banner',
    label: 'Home Banner',
    icon: 'solar:home-bold-duotone',
    url: '/home-banner',
  },

  {
    key: 'bookings',
    icon: 'bx:list-check',
    label: 'Bookings',
    children: [
      {
        key: 'movies-bookings',
        label: 'Movies Bookings',
        url: '/bookings/movies-bookings',
        parentKey: 'bookings',
      },
      {
        key: 'events-bookings',
        label: 'Events Bookings',
        url: '/bookings/events-bookings',
        parentKey: 'bookings',
      },
    ],
  },
  {
    key: 'movies',
    icon: 'bx:movie',
    label: 'Movies',
    children: [
      {
        key: 'movies-category-add',
        label: 'Create Category',
        url: '/movies/movies-category-add',
        parentKey: 'movies',
      },
      {
        key: 'movies-category-list',
        label: 'Movies Category List',
        url: '/movies/movies-category-list',
        parentKey: 'movies',
      },
      {
        key: 'movies-list-add',
        label: 'Movies Add',
        url: '/movies/movies-add',
        parentKey: 'movies',
      },
      {
        key: 'movies-list',
        label: 'Movies List',
        url: '/movies/movies-list',
        parentKey: 'movies',
      },
    ],
  },
  {
    key: 'events',
    icon: 'bx:music',
    label: 'Events',
    children: [
      {
        key: 'events-category-add',
        label: 'Create Category',
        url: '/events/category-add',
        parentKey: 'events',
      },
      {
        key: 'events-category-list',
        label: 'Category List',
        url: '/events/category-list',
        parentKey: 'events',
      },
      {
        key: 'events-list-add',
        label: 'Events Add',
        url: '/events/events-add',
        parentKey: 'events',
      },
      {
        key: 'events-list',
        label: 'Events List',
        url: '/events/events-list',
        parentKey: 'events',
      },
    ],
  },
  {
    key: 'advertise',
    label: 'Advertise',
    icon: 'solar:box-bold-duotone',
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
  {
    key: 'subscription',
    label: 'Subscription Plan',
    icon: 'solar:dollar-bold-duotone',
    children: [
      {
        key: 'subscription-add',
        label: 'Create Plan',
        url: '/subscription/subscription-add',
        parentKey: 'subscription',
      },
      {
        key: 'subscription-list',
        label: 'Subscription List',
        url: '/subscription/subscription-list',
        parentKey: 'subscription',
      },
    ],
  },
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

  {
    key: 'users',
    label: 'USERS',
    isTitle: true,
  },
  {
    key: 'vendors-list',
    label: 'Vendors List',
    icon: 'solar:user-bold-duotone',
    url: '/vendors/vendors-list',
    parentKey: 'users',
  },
  {
    key: 'vendors-payment-history',
    label: 'Vendors Payment History',
    icon: 'solar:dollar-bold-duotone',
    url: '/vendors/vendors-payment-history',
    parentKey: 'users',
  },

  {
    key: 'role',
    label: 'ROLES',
    isTitle: true,
  },

  {
    key: 'access-management',
    label: 'Roles Management',
    icon: 'solar:user-bold-duotone',
    children: [
      {
        key: 'roles-add',
        label: 'Add Role',
        url: '/role/add-role',
        parentKey: 'role',
      },
      {
        key: 'roles-list',
        label: 'Roles List',
        url: '/role/role-list',
        parentKey: 'role',
      },
    ],
  },

  {
    key: 'enquires',
    label: 'ENQUIRES',
    isTitle: true,
  },
  {
    key: 'enquires-list',
    label: 'Enquires List',
    icon: 'solar:document-text-bold-duotone',
    url: '/enquires/enquires-list',
    parentKey: 'enquires',
  },
  // {
  //   key: 'contact-us',
  //   label: 'Contact Us Enquiries',
  //   icon: 'solar:phone-bold-duotone',
  //   url: '/support/contact-us',
  //   parentKey: 'enquires',
  // },

  {
    key: 'support',
    label: 'SUPPORT',
    isTitle: true,
  },
  {
    key: 'help-center',
    label: 'Help-Center',
    icon: 'solar:help-bold-duotone',
    url: '/support/help-center',
    parentKey: 'support',
  },
  {
    key: 'faqs',
    label: 'FAQs',
    icon: 'solar:question-circle-bold-duotone',
    url: '/support/faqs',
    parentKey: 'support',
  },
  {
    key: 'privacy-policy',
    label: 'Privacy Policy',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/privacy-policy',
    parentKey: 'support',
  },
  {
    key: 'terms-conditions',
    label: 'Terms & Conditions',
    icon: 'solar:document-text-bold-duotone',
    url: '/support/terms-conditions',
    parentKey: 'support',
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
