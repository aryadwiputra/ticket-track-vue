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
    // ... (deleteTicket action)
  },
})
