// src/store/auth.js
import api from '@/plugins/axios' // Import instance axios yang sudah dikonfigurasi
import router from '@/router' // Import router untuk redirect
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('authToken') || null,
    user: JSON.parse(localStorage.getItem('authUser')) || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    getUser: (state) => state.user,
  },

  actions: {
    // Fungsi untuk menyinkronkan localStorage.activeUser
    _syncLocalStorageActiveUser() {
      if (this.isAuthenticated) {
        localStorage.setItem('activeUser', 'true') // Atau simpan token/user ID jika diperlukan
      } else {
        localStorage.removeItem('activeUser')
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/login', credentials)
        // Struktur respons sukses login:
        // { "message": { "token": "...", "user": {...} }, "data": "LOGIN_SUCCESS" }
        const { token, user } = response.data.message

        this.token = token
        this.user = user
        localStorage.setItem('authToken', token)
        localStorage.setItem('authUser', JSON.stringify(user))
        this._syncLocalStorageActiveUser() // Sinkronkan activeUser

        this.loading = false
        // Router redirect akan ditangani oleh middleware guest setelah login
        return true // Indikasi sukses
      } catch (error) {
        this.loading = false
        if (error.response) {
          // Error dari server
          if (error.response.data.message === 'CREDENTIALS_NOT_MATCH') {
            this.error = 'Email atau password salah.'
          } else {
            this.error =
              error.response.data.message || 'Terjadi kesalahan saat login.'
          }
        } else {
          // Error jaringan atau lainnya
          this.error = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.'
        }
        console.error('Login error:', error)
        return false // Indikasi gagal
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/register', userData)
        // Struktur respons sukses register:
        // { "data": "REGISTER_SUCCESS" }
        this.loading = false
        // Tidak perlu menyimpan token/user karena register hanya membuat akun, belum login
        // Redirect ke halaman login setelah register sukses
        router.push({ name: 'Login' })
        return { success: true, message: 'Registrasi berhasil! Silakan login.' }
      } catch (error) {
        this.loading = false
        if (error.response) {
          // Error dari server
          if (error.response.data.message === 'ERROR_VALIDATION') {
            // Error validasi dari backend
            const errors = error.response.data.errors
            let errorMessage = 'Validasi gagal:'
            for (const key in errors) {
              errorMessage += `\n- ${errors[key].join(', ')}`
            }
            this.error = errorMessage
          } else {
            this.error =
              error.response.data.message ||
              'Terjadi kesalahan saat registrasi.'
          }
        } else {
          // Error jaringan atau lainnya
          this.error = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.'
        }
        console.error('Register error:', error)
        return { success: false, message: this.error } // Indikasi gagal
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      this._syncLocalStorageActiveUser() // Sinkronkan activeUser
      router.push({ name: 'Login' }) // Redirect ke halaman login setelah logout
    },

    // Inisialisasi store saat aplikasi dimuat
    initialize() {
      this._syncLocalStorageActiveUser()
    },
  },
})

// Panggil initialize saat store dibuat (opsional, bisa juga di main.js)
// const authStore = useAuthStore();
// authStore.initialize();
