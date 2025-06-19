// src/store/tickets.js
import api from '@/plugins/axios' // Menggunakan instance axios yang sudah dikonfigurasi
import { defineStore } from 'pinia'

export const useTicketsStore = defineStore('tickets', {
  state: () => ({
    tickets: [],
    totalTickets: 0,
    currentPage: 1,
    perPage: 10,
    searchTerm: '',
    loading: false,
    error: null,
  }),

  actions: {
    async fetchTickets() {
      this.loading = true
      this.error = null
      try {
        const params = {
          page: this.currentPage,
          per_page: this.perPage,
        }

        if (this.searchTerm) {
          params.search = this.searchTerm
        }

        // Anda bisa menambahkan sort_by dan sort_order jika diperlukan
        // params.sort_by = 'created_at';
        // params.sort_order = 'desc';

        const response = await api.get('tickets', { params })

        // Asumsi struktur respons API mengikuti paginasi Laravel standar
        // data: { current_page, data: [...tickets], total, ... }
        this.tickets = response.data.data.data // Array tiket sebenarnya
        this.totalTickets = response.data.data.total // Total item untuk paginasi

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
      this.currentPage = 1 // Reset ke halaman 1 saat perPage berubah
    },

    setSearchTerm(term) {
      this.searchTerm = term
      this.currentPage = 1 // Reset ke halaman 1 saat search term berubah
    },

    // Aksi untuk menghapus tiket (contoh, jika diperlukan)
    async deleteTicket(id) {
      try {
        // await api.delete(`/tickets/${id}`);
        // this.tickets = this.tickets.filter(ticket => ticket.id !== id);
        // this.totalTickets--;
        // alert(`Ticket ${id} deleted successfully! (Simulated)`);
        console.log(`Deleting ticket with ID: ${id}`)
        alert(
          `Fungsi delete untuk tiket ID ${id} belum diimplementasikan sepenuhnya.`
        )
      } catch (error) {
        console.error('Error deleting ticket:', error)
        alert('Gagal menghapus tiket.')
      }
    },
  },
})
