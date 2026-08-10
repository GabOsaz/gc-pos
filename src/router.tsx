import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Login from './app/auth/login/page.tsx'
import { Slide, ToastContainer } from 'react-toastify'
import PlaceOrderPage from './app/place-order/page.tsx'
import BookingsPage from './app/bookings/page.tsx'
import OrderHistoryPage from './app/order-history/page.tsx'
import TodaysPickupPage from './app/pickup/page.tsx'
import PickupDetailsPage from './app/pickup/details/page.tsx'

function RootLayout() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer theme="colored" transition={Slide} />
    </>
  )
}

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Login,
})

const PlaceOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/place-order',
  component: PlaceOrderPage,
})

const BookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bookings',
  component: BookingsPage,
})

const OrderHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-history',
  component: OrderHistoryPage,
})

const TodaysPickupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pickup',
  component: TodaysPickupPage,
})

const PickupDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pickup/$id',
  component: PickupDetailsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  PlaceOrderRoute,
  BookingsRoute,
  OrderHistoryRoute,
  TodaysPickupRoute,
  PickupDetailsRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}