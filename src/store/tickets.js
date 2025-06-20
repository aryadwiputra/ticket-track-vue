// src/store/tickets.js (Modifikasi)
import api from '@/plugins/axios'
import { defineStore } from 'pinia'

export const useTicketsStore = defineStore('tickets', {
  state: () => ({
    tickets: [],
    totalTickets: 0,
    currentPage: 1,
    perPage: 10, // Kembali ke 10 atau sesuaikan
    searchTerm: '',
    loading: false,
    error: null,
    sortBy: 'id',
    sortOrder: 'desc',
    // --- State baru untuk filter spesifik ---
    filterStatus: null, // null atau string kosong untuk tidak ada filter
    filterPriority: null, // null atau string kosong untuk tidak ada filter
  }),
  actions: {
    async fetchTickets() {
      this.loading = true
      this.error = null
      try {
        const params = {
          page: this.currentPage,
          per_page: this.perPage,
          sort_by: this.sortBy,
          sort_order: this.sortOrder,
        }
        if (this.searchTerm) {
          params.search = this.searchTerm
        }
        // --- Tambahkan filter spesifik ke params ---
        if (this.filterStatus) {
          params.status = this.filterStatus
        }
        if (this.filterPriority) {
          params.priority = this.filterPriority
        }

        const response = await api.get('/tickets', { params })
        this.tickets = response.data.data.data
        this.totalTickets = response.data.data.total
        this.loading = false
      } catch (error) {
        this.loading = false
        if (error.response) {
          this.error =
            error.response.data.message || 'Gagal mengambil data tiket.'
        } else {
          this.error = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.'
        }
        console.error('Error fetching tickets:', error)
      }
    },

    // --- Aksi baru: Mengambil daftar pengguna ---
    async fetchUsers() {
      this.usersLoading = true
      this.usersError = null
      try {
        const response = await api.get('/users') // Asumsi endpoint /users
        this.users = response.data.data.map((user) => ({
          value: user.id,
          label: user.name,
        }))
        this.usersLoading = false
      } catch (error) {
        this.usersLoading = false
        this.usersError =
          error.response?.data?.message || 'Gagal mengambil daftar pengguna.'
        console.error('Error fetching users:', error)
      }
    },

    async createTicket(ticketData) {
      this.formLoading = true
      this.formError = null
      try {
        const response = await api.post('/tickets', ticketData) // Asumsi endpoint POST /tickets
        this.formLoading = false
        // Opsional: Tampilkan toast sukses
        // useToast().success('Tiket berhasil dibuat!');
        router.push({ name: 'tickets' }) // Redirect ke halaman daftar tiket
        return {
          success: true,
          message: response.data.message || 'Tiket berhasil dibuat!',
        }
      } catch (error) {
        this.formLoading = false
        if (error.response) {
          if (error.response.data.errors) {
            // Error validasi dari backend
            const errors = error.response.data.errors
            let errorMessage = 'Validasi gagal:'
            for (const key in errors) {
              errorMessage += `\n- ${errors[key].join(', ')}`
            }
            this.formError = errorMessage
          } else {
            this.formError =
              error.response.data.message ||
              'Terjadi kesalahan saat membuat tiket.'
          }
        } else {
          this.formError =
            'Tidak dapat terhubung ke server. Periksa koneksi Anda.'
        }
        console.error('Error creating ticket:', error)
        return { success: false, message: this.formError }
      }
    },

    async deleteTicket(id) {
      try {
        // await api.delete(`/tickets/${id}`);
        console.log(`Deleting ticket with ID: ${id}`)
        alert(
          `Fungsi delete untuk tiket ID ${id} belum diimplementasikan sepenuhnya.`
        )
        this.fetchTickets()
      } catch (error) {
        console.error('Error deleting ticket:', error)
        alert('Gagal menghapus tiket.')
      }
    },

    setPage(page) {
      this.currentPage = page
    },
    setPerPage(perPage) {
      this.perPage = perPage
      this.currentPage = 1
    },
    setSearchTerm(term) {
      this.searchTerm = term
      this.currentPage = 1
    },
    setSort(sortDetails) {
      if (sortDetails && sortDetails.length > 0) {
        const { field, type } = sortDetails[0]
        this.sortBy = field
        this.sortOrder = type
      }
    },
    // --- Aksi baru untuk filter spesifik ---
    setFilterStatus(status) {
      this.filterStatus = status
      this.currentPage = 1 // Reset ke halaman 1 saat filter berubah
    },
    setFilterPriority(priority) {
      this.filterPriority = priority
      this.currentPage = 1 // Reset ke halaman 1 saat filter berubah
    },
    // Aksi untuk mereset semua filter (opsional)
    resetFilters() {
      this.searchTerm = ''
      this.filterStatus = null
      this.filterPriority = null
      this.currentPage = 1
      this.sortBy = 'id' // Kembali ke default sort
      this.sortOrder = 'desc' // Kembali ke default sort
    },
  },
})
