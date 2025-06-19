<!-- src/views/tickets/TicketsPage.vue -->
<template>
  <div class="md:flex justify-between pb-6 md:space-y-0 space-y-3 items-center">
    <h5>Daftar Tiket</h5>
    <InputGroup
      v-model="ticketsStore.searchTerm"
      placeholder="Cari Tiket..."
      type="text"
      prependIcon="heroicons-outline:search"
      merged
    />
  </div>

  <div v-if="ticketsStore.loading" class="text-center py-8">
    <p class="text-lg text-slate-600 dark:text-slate-300">
      Memuat data tiket...
    </p>
    <!-- Anda bisa menambahkan spinner atau loading animation di sini -->
  </div>
  <div v-else-if="ticketsStore.error" class="text-center py-8 text-red-500">
    <p class="text-lg">Error: {{ ticketsStore.error }}</p>
  </div>
  <div v-else>
    <vue-good-table
      :columns="columns"
      styleClass=" vgt-table bordered centered"
      :rows="ticketsStore.tickets"
      :pagination-options="{
        enabled: true,
        perPage: ticketsStore.perPage,
        setCurrentPage: ticketsStore.currentPage,
        perPageDropdown: [5, 10, 20, 50], // Opsi per halaman
        dropdownAllowAll: false,
      }"
      :search-options="{
        enabled: false, // Pencarian ditangani secara eksternal melalui InputGroup dan Pinia
        externalQuery: ticketsStore.searchTerm,
      }"
      :select-options="{
        enabled: true,
        selectOnCheckboxOnly: true,
        selectioninfoClass: 'custom-class',
        selectionText: 'rows selected',
        clearSelectionText: 'clear',
        disableSelectinfo: true,
        selectAllByGroup: true,
      }"
    >
      <template v-slot:table-row="props">
        <span v-if="props.column.field == 'code'">
          {{ '#' + props.row.code }}
        </span>
        <span v-if="props.column.field == 'title'">
          {{ props.row.title }}
        </span>
        <span v-if="props.column.field == 'description'">
          {{ props.row.description }}
        </span>
        <span
          v-if="props.column.field == 'created_by.name'"
          class="flex items-center"
        >
          <!-- Gambar dikomentari karena tidak ada di API response -->
          <!-- <span class="w-7 h-7 rounded-full mr-3 flex-none">
            <img
              :src="props.row.created_by.image || defaultUserImage"
              :alt="props.row.created_by.name"
              class="object-cover w-full h-full rounded-full"
            />
          </span> -->
          <span class="text-sm text-slate-600 dark:text-slate-300 capitalize">{{
            props.row.created_by ? props.row.created_by.name : 'N/A'
          }}</span>
        </span>
        <span
          v-if="props.column.field == 'assigned_to.name'"
          class="flex items-center"
        >
          <span class="text-sm text-slate-600 dark:text-slate-300 capitalize">{{
            props.row.assigned_to ? props.row.assigned_to.name : 'N/A'
          }}</span>
        </span>
        <span
          v-if="props.column.field == 'created_at'"
          class="text-slate-500 dark:text-slate-300"
        >
          {{ formatDate(props.row.created_at) }}
        </span>
        <span v-if="props.column.field == 'status'" class="block w-full">
          <span
            class="inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 capitalize"
            :class="getStatusClass(props.row.status)"
          >
            {{ props.row.status.replace(/_/g, ' ') }}
          </span>
        </span>
        <span v-if="props.column.field == 'priority'" class="block w-full">
          <span
            class="inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 capitalize"
            :class="getPriorityClass(props.row.priority)"
          >
            {{ props.row.priority }}
          </span>
        </span>
        <span v-if="props.column.field == 'action'">
          <Dropdown classMenuItems=" w-[140px]">
            <span class="text-xl"
              ><Icon icon="heroicons-outline:dots-vertical"
            /></span>
            <template v-slot:menus>
              <MenuItem v-for="(item, i) in actions" :key="i">
                <div
                  :class="`
                  ${
                    item.name === 'delete'
                      ? 'bg-danger-500 text-danger-500 bg-opacity-30   hover:bg-opacity-100 hover:text-white'
                      : 'hover:bg-slate-900 hover:text-white dark:hover:bg-slate-600 dark:hover:bg-opacity-50'
                  }
                  w-full border-b border-b-gray-500 border-opacity-10 px-4 py-2 text-sm  last:mb-0 cursor-pointer first:rounded-t last:rounded-b flex  space-x-2 items-center `"
                  @click="handleAction(item.name, props.row)"
                >
                  <span class="text-base"><Icon :icon="item.icon" /></span>
                  <span>{{ item.name }}</span>
                </div>
              </MenuItem>
            </template>
          </Dropdown>
        </span>
      </template>
      <template #pagination-bottom="props">
        <div class="py-4 px-3">
          <Pagination
            :total="ticketsStore.totalTickets"
            :current="ticketsStore.currentPage"
            :per-page="ticketsStore.perPage"
            :pageRange="pageRange"
            @page-changed="ticketsStore.setPage($event)"
            @per-page-changed="ticketsStore.setPerPage($event)"
            enableSearch
            enableSelect
            :options="options"
          >
          </Pagination>
        </div>
      </template>
    </vue-good-table>
  </div>
</template>

<script setup>
import Dropdown from '@/components/Dropdown'
import Icon from '@/components/Icon'
import InputGroup from '@/components/InputGroup'
import Pagination from '@/components/Pagination'
import { useTicketsStore } from '@/store/ticket' // Import Pinia store
import { MenuItem } from '@headlessui/vue'
import { onMounted, watch } from 'vue'
// import defaultUserImage from '@/assets/images/all-img/user.png'; // Jika ingin menggunakan gambar default

const ticketsStore = useTicketsStore()

const pageRange = 5 // Jumlah halaman yang ditampilkan di pagination

// Actions for dropdown menu
const actions = [
  {
    name: 'view',
    icon: 'heroicons-outline:eye',
  },
  {
    name: 'edit',
    icon: 'heroicons:pencil-square',
  },
  {
    name: 'delete',
    icon: 'heroicons-outline:trash',
  },
]

// Options for per-page dropdown in pagination
const options = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
]

// Columns definition for vue-good-table, adjusted to API response
const columns = [
  {
    label: 'ID',
    field: 'id',
  },
  {
    label: 'Kode',
    field: 'code',
  },
  {
    label: 'Judul',
    field: 'title',
  },
  {
    label: 'Deskripsi',
    field: 'description',
  },
  {
    label: 'Dibuat Oleh',
    field: 'created_by.name', // Mengambil nama dari objek created_by
    sortable: false, // Biasanya tidak sortable untuk nested object
  },
  {
    label: 'Ditugaskan Ke',
    field: 'assigned_to.name', // Mengambil nama dari objek assigned_to
    sortable: false,
  },
  {
    label: 'Prioritas',
    field: 'priority',
  },
  {
    label: 'Status',
    field: 'status',
  },
  {
    label: 'Dibuat Pada',
    field: 'created_at',
  },
  {
    label: 'Aksi',
    field: 'action',
    sortable: false,
  },
]

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

// Helper function to get status class
const getStatusClass = (status) => {
  switch (status) {
    case 'open':
      return 'text-info-500 bg-info-500' // Contoh warna untuk 'open'
    case 'in_progress':
      return 'text-warning-500 bg-warning-500' // Contoh warna untuk 'in_progress'
    case 'closed':
      return 'text-success-500 bg-success-500' // Contoh warna untuk 'closed'
    case 'reopened':
      return 'text-primary-500 bg-primary-500' // Contoh warna untuk 'reopened'
    default:
      return 'text-slate-500 bg-slate-500' // Default
  }
}

// Helper function to get priority class
const getPriorityClass = (priority) => {
  switch (priority) {
    case 'low':
      return 'text-success-500 bg-success-500'
    case 'medium':
      return 'text-warning-500 bg-warning-500'
    case 'high':
      return 'text-danger-500 bg-danger-500'
    case 'urgent':
      return 'text-red-700 bg-red-700' // Warna lebih kuat untuk urgent
    default:
      return 'text-slate-500 bg-slate-500'
  }
}

// Handle action clicks (view, edit, delete)
const handleAction = (actionName, rowData) => {
  console.log(`Action: ${actionName} on Ticket ID: ${rowData.id}`)
  if (actionName === 'delete') {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus tiket dengan ID ${rowData.id}?`
      )
    ) {
      ticketsStore.deleteTicket(rowData.id)
      // Setelah delete, mungkin perlu refresh data
      ticketsStore.fetchTickets()
    }
  } else if (actionName === 'view') {
    alert(`Melihat detail tiket ID: ${rowData.id}`)
    // router.push(`/tickets/${rowData.id}`); // Contoh navigasi ke detail tiket
  } else if (actionName === 'edit') {
    alert(`Mengedit tiket ID: ${rowData.id}`)
    // router.push(`/tickets/${rowData.id}/edit`); // Contoh navigasi ke edit tiket
  }
}

// Fetch data on component mount
onMounted(() => {
  ticketsStore.fetchTickets()
})

// Watch for changes in pagination and search term to refetch data
watch(
  () => [
    ticketsStore.currentPage,
    ticketsStore.perPage,
    ticketsStore.searchTerm,
  ],
  () => {
    ticketsStore.fetchTickets()
  }
)
</script>

<style lang="scss"></style>
