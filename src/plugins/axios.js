// plugins/axios.js
import router from '@/router' // Import router
import { useAuthStore } from '@/store/auth' // Import Pinia store
import axios from 'axios'

const baseURL = 'https://ticket-track-api.test/api/v1/' // Pastikan ini URL yang benar
const api = axios.create({
  baseURL,
  timeout: 10000,
})

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore() // Dapatkan instance store
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor untuk menangani respons error global (misal: 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()
      // Jika token tidak valid atau expired, lakukan logout
      if (authStore.isAuthenticated) {
        // Pastikan hanya logout jika memang ada token sebelumnya
        authStore.logout()
        // Opsional: Tampilkan pesan ke user
        alert('Sesi Anda telah berakhir. Silakan login kembali.')
      }
      // Redirect ke login jika belum di halaman login
      if (router.currentRoute.value.name !== 'Login') {
        router.push({ name: 'Login' })
      }
    }
    return Promise.reject(error)
  }
)

export default api
