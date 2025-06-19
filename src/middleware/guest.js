import { useAuthStore } from '@/store/auth' // Import Pinia store

export default function guest({ next }) {
  const authStore = useAuthStore()
  // Gunakan isAuthenticated dari Pinia, yang juga mengelola localStorage.activeUser
  if (authStore.isAuthenticated) {
    return next({ name: 'home' })
  }
  return next()
}
