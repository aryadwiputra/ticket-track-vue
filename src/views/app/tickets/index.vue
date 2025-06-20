<!-- src/views/tickets/TicketsPage.vue -->
<template>
  <div>
    <div
      class="md:flex justify-between pb-6 md:space-y-0 space-y-3 items-center"
    >
      <h5>Daftar Tiket</h5>
      <div class="flex items-center space-x-3">
        <!-- Input Pencarian Global -->
        <InputGroup
          v-model="ticketsStore.searchTerm"
          placeholder="Cari Tiket..."
          type="text"
          classInput="h-[52px]"
          prependIcon="heroicons-outline:search"
          merged
        />

        <!-- Dropdown Filter Status -->
        <Dropdown classMenuItems="w-[180px]">
          <button class="btn btn-outline-secondary flex items-center space-x-2">
            <span>Status: {{ ticketsStore.filterStatus || 'Semua' }}</span>
            <Icon icon="heroicons-outline:chevron-down" />
          </button>
          <template #menus>
            <MenuItem @click="ticketsStore.setFilterStatus(null)">
              <div
                class="px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Semua Status
              </div>
            </MenuItem>
            <MenuItem
              v-for="status in statusOptions"
              :key="status.value"
              @click="ticketsStore.setFilterStatus(status.value)"
            >
              <div
                class="px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 capitalize"
              >
                {{ status.label }}
              </div>
            </MenuItem>
          </template>
        </Dropdown>

        <!-- Dropdown Filter Prioritas -->
        <Dropdown classMenuItems="w-[180px]">
          <button class="btn btn-outline-secondary flex items-center space-x-2">
            <span>Prioritas: {{ ticketsStore.filterPriority || 'Semua' }}</span>
            <Icon icon="heroicons-outline:chevron-down" />
          </button>
          <template #menus>
            <MenuItem @click="ticketsStore.setFilterPriority(null)">
              <div
                class="px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Semua Prioritas
              </div>
            </MenuItem>
            <MenuItem
              v-for="priority in priorityOptions"
              :key="priority.value"
              @click="ticketsStore.setFilterPriority(priority.value)"
            >
              <div
                class="px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 capitalize"
              >
                {{ priority.label }}
              </div>
            </MenuItem>
          </template>
        </Dropdown>

        <!-- Tombol Reset Filter (Opsional) -->
        <Button
          v-if="
            ticketsStore.searchTerm ||
            ticketsStore.filterStatus ||
            ticketsStore.filterPriority
          "
          text="Reset Filter"
          btnClass="btn-outline-danger"
          @click="ticketsStore.resetFilters()"
        />

        <!-- Tombol Add Data -->
        <router-link class="btn btn-dark" to="/app/tickets/add">
          Add Data
        </router-link>
      </div>
    </div>

    <div class="relative">
      <vue-good-table
        :columns="columns"
        styleClass="vgt-table bordered centered"
        :rows="ticketsStore.tickets"
        :pagination-options="{
          enabled: true,
          perPage: ticketsStore.perPage,
          setCurrentPage: ticketsStore.currentPage,
          perPageDropdown: [5, 10, 20, 50],
          dropdownAllowAll: false,
        }"
        :search-options="{
          enabled: false, // Pencarian ditangani secara eksternal melalui InputGroup dan Pinia
          externalQuery: ticketsStore.searchTerm,
        }"
        :sort-options="{
          // Tambahkan sort options
          enabled: true,
          initialSortBy: {
            field: ticketsStore.sortBy,
            type: ticketsStore.sortOrder,
          },
          multipleColumns: false, // Hanya izinkan satu kolom untuk diurutkan
        }"
        @on-sort-change="ticketsStore.setSort($event)"
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
        <template #empty-results>
          <div
            v-if="ticketsStore.loading && ticketsStore.tickets.length === 0"
            class="text-center py-4"
          >
            <p class="text-lg text-slate-600 dark:text-slate-300">
              Memuat data tiket...
            </p>
          </div>
          <div
            v-else-if="
              !ticketsStore.loading && ticketsStore.tickets.length === 0
            "
            class="text-center py-4"
          >
            Tidak ada data tiket yang ditemukan.
          </div>
          <div
            v-else-if="ticketsStore.error"
            class="text-center py-4 text-red-500"
          >
            <p class="text-lg">Error: {{ ticketsStore.error }}</p>
          </div>
        </template>

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
            <span
              class="text-sm text-slate-600 dark:text-slate-300 capitalize"
              >{{
                props.row.created_by ? props.row.created_by.name : 'N/A'
              }}</span
            >
          </span>
          <span
            v-if="props.column.field == 'assigned_to.name'"
            class="flex items-center"
          >
            <span
              class="text-sm text-slate-600 dark:text-slate-300 capitalize"
              >{{
                props.row.assigned_to ? props.row.assigned_to.name : 'N/A'
              }}</span
            >
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

      <div
        v-if="ticketsStore.loading && ticketsStore.tickets.length > 0"
        class="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-800 bg-opacity-70 dark:bg-opacity-70 backdrop-blur-sm z-10 rounded-lg"
      >
        <p class="text-lg font-semibold text-slate-800 dark:text-white">
          Memuat data tiket...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from '@/components/Button' // Pastikan Button diimpor
import Dropdown from '@/components/Dropdown'
import Icon from '@/components/Icon'
import InputGroup from '@/components/InputGroup'
import Pagination from '@/components/Pagination'
import { useTicketsStore } from '@/store/tickets'
import { MenuItem } from '@headlessui/vue'
import { onMounted, watch } from 'vue'

const ticketsStore = useTicketsStore()

const pageRange = 5

const actions = [
  { name: 'view', icon: 'heroicons-outline:eye' },
  { name: 'edit', icon: 'heroicons:pencil-square' },
  { name: 'delete', icon: 'heroicons-outline:trash' },
]

const options = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
]

const columns = [
  { label: 'ID', field: 'id', sortable: true },
  { label: 'Kode', field: 'code', sortable: true },
  { label: 'Judul', field: 'title', sortable: true },
  { label: 'Deskripsi', field: 'description', sortable: true },
  { label: 'Dibuat Oleh', field: 'created_by.name', sortable: false },
  { label: 'Ditugaskan Ke', field: 'assigned_to.name', sortable: false },
  { label: 'Prioritas', field: 'priority', sortable: true },
  { label: 'Status', field: 'status', sortable: true },
  { label: 'Dibuat Pada', field: 'created_at', sortable: true },
  { label: 'Aksi', field: 'action', sortable: false },
]

// Opsi untuk dropdown filter status
const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
  { value: 'reopened', label: 'Reopened' },
]

// Opsi untuk dropdown filter prioritas
const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

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

const getStatusClass = (status) => {
  switch (status) {
    case 'open':
      return 'text-info-500 bg-info-500'
    case 'in_progress':
      return 'text-warning-500 bg-warning-500'
    case 'closed':
      return 'text-success-500 bg-success-500'
    case 'reopened':
      return 'text-primary-500 bg-primary-500'
    default:
      return 'text-slate-500 bg-slate-500'
  }
}

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'low':
      return 'text-success-500 bg-success-500'
    case 'medium':
      return 'text-warning-500 bg-warning-500'
    case 'high':
      return 'text-danger-500 bg-danger-500'
    case 'urgent':
      return 'text-red-700 bg-red-700'
    default:
      return 'text-slate-500 bg-slate-500'
  }
}

const handleAction = (actionName, rowData) => {
  console.log(`Action: ${actionName} on Ticket ID: ${rowData.id}`)
  if (actionName === 'delete') {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus tiket dengan ID ${rowData.id}?`
      )
    ) {
      ticketsStore.deleteTicket(rowData.id)
    }
  } else if (actionName === 'view') {
    alert(`Melihat detail tiket ID: ${rowData.id}`)
  } else if (actionName === 'edit') {
    alert(`Mengedit tiket ID: ${rowData.id}`)
  }
}

onMounted(() => {
  ticketsStore.fetchTickets()
})

// Watch for changes in pagination, search term, sorting, AND filters to refetch data
watch(
  () => [
    ticketsStore.currentPage,
    ticketsStore.perPage,
    ticketsStore.searchTerm,
    ticketsStore.sortBy,
    ticketsStore.sortOrder,
    ticketsStore.filterStatus, // Tambahkan ke watch
    ticketsStore.filterPriority, // Tambahkan ke watch
  ],
  () => {
    ticketsStore.fetchTickets()
  }
)
</script>

<style lang="scss"></style>
