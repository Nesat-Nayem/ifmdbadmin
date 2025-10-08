import { currency } from '@/context/constants'
import { PageType, StatType } from './types'

export const stateData: StatType[] = [
  {
    icon: 'bx:movie',
    name: 'Total Movies',
    amount: '13,647',
    variant: 'success',
    change: '2.3',
  },
  {
    icon: 'bx:user',
    name: 'Total Vendors',
    amount: '9,526',
    variant: 'success',
    change: '8.1',
  },
  {
    icon: 'bxs:music',
    name: 'Total Events',
    amount: '9,76,000',
    variant: 'danger',
    change: '0.3',
  },
  {
    icon: 'bx:award',
    name: 'Total Advertisements',
    amount: `123`,
    variant: 'danger',
    change: '10.6',
  },
  {
    icon: 'bx:movie',
    name: 'Total Cinema Halls',
    amount: `200`,
    variant: 'danger',
    change: '10.6',
  },
  {
    icon: 'bx:user',
    name: 'Total Enqueries',
    amount: `200`,
    variant: 'danger',
    change: '10.6',
  },
]

export const pagesList: PageType[] = [
  {
    path: 'larkon/ecommerce.html',
    views: 465,
    rate: '4.4',
    variant: 'success',
  },
  {
    path: 'larkon/dashboard.html',
    views: 426,
    rate: '20.4',
    variant: 'danger',
  },
  {
    path: 'larkon/chat.html',
    views: 254,
    rate: '12.25',
    variant: 'warning',
  },
  {
    path: 'larkon/auth-login.html',
    views: 3369,
    rate: '5.2',
    variant: 'success',
  },
  {
    path: 'larkon/email.html',
    views: 985,
    rate: '64.2',
    variant: 'danger',
  },
  {
    path: 'larkon/social.html',
    views: 653,
    rate: '2.4',
    variant: 'success',
  },
  {
    path: 'larkon/blog.html',
    views: 478,
    rate: '1.4',
    variant: 'danger',
  },
]
