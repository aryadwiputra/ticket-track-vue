import auth from '@/middleware/auth'
import guest from '@/middleware/guest'

const routes = [
  {
    path: '/app',
    name: 'Layout',
    redirect: '/app/home',
    component: () => import('@/Layout/index.vue'),
    meta: { middleware: [auth], hide: true },
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/index.vue'),
      },
      {
        path: 'tickets',
        name: 'tickets',
        component: () => import('@/views/app/tickets/index.vue'),
      },
      {
        path: 'tickets/add',
        name: 'tickets-add',
        component: () => import('@/views/app/tickets/add.vue'),
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/app/users/index.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'Login', // Nama rute harus 'Login' sesuai middleware Anda
    component: () => import('@/views/auth/login.vue'), // Menggunakan login.vue yang sudah ada
    meta: { middleware: [guest] }, // Gunakan middleware guest
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/register.vue'), // Rute untuk halaman Register
    meta: { middleware: [guest] }, // Gunakan middleware guest
  },
  // Tambahkan rute 404 atau rute publik lainnya di sini
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'), // Contoh halaman 404
  },
]

export default routes
