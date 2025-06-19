import { useAuthStore } from '@/store/auth' // Import Pinia store

export default function auth({ next }) {
  const authStore = useAuthStore()
  // Gunakan isAuthenticated dari Pinia, yang juga mengelola localStorage.activeUser
  if (authStore.isAuthenticated) {
    return next()
  }
  // Jika tidak terautentikasi, pastikan localStorage.activeUser dihapus
  localStorage.removeItem('activeUser')
  return next({ name: 'Login' })
}
