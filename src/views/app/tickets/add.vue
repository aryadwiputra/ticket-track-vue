<!-- src/views/tickets/CreateTicket.vue -->
<template>
  <div class="">
    <Card title="Buat Tiket Baru">
      <form @submit.prevent="onSubmit" class="space-y-5">
        <!-- Judul Tiket -->
        <Textinput
          label="Judul Tiket*"
          name="title"
          type="text"
          placeholder="Masukkan judul tiket"
          v-model="title"
          :error="titleError"
          classInput="h-[48px]"
        />

        <!-- Deskripsi Tiket -->
        <Textarea
          label="Deskripsi Tiket"
          name="description"
          placeholder="Masukkan deskripsi tiket"
          v-model="description"
          :error="descriptionError"
        />

        <!-- Status Tiket -->
        <Select
          label="Status*"
          name="status"
          :options="statusOptions"
          v-model="status"
          :error="statusError"
          :classInput="statusError ? 'border-red-500' : ''"
        />

        <!-- Prioritas Tiket -->
        <Select
          label="Prioritas*"
          name="priority"
          :options="priorityOptions"
          v-model="priority"
          :error="priorityError"
          :classInput="priorityError ? 'border-red-500' : ''"
        />

        <!-- Ditugaskan Kepada (Assigned To) -->
        <Select
          label="Ditugaskan Kepada"
          name="assigned_to_user_id"
          :options="ticketsStore.users"
          v-model="assigned_to_user_id"
          :error="assignedToUserIdError"
          :classInput="assignedToUserIdError ? 'border-red-500' : ''"
          :disabled="ticketsStore.usersLoading"
          :placeholder="
            ticketsStore.usersLoading ? 'Memuat pengguna...' : 'Pilih pengguna'
          "
        />
        <p v-if="ticketsStore.usersError" class="text-red-500 text-sm">
          Error memuat pengguna: {{ ticketsStore.usersError }}
        </p>

        <!-- Pesan Error Form Global -->
        <p
          v-if="ticketsStore.formError"
          class="text-red-500 text-sm text-center whitespace-pre-line"
        >
          {{ ticketsStore.formError }}
        </p>

        <!-- Tombol Submit -->
        <div class="flex justify-end space-x-3">
          <router-link to="/app/tickets" class="btn btn-light"
            >Kembali</router-link
          >
          <!-- <Button
          text="Kembali"
          btnClass="btn-light"
          @click="router.push({ name: '/app/tickets' })"
          :disabled="ticketsStore.formLoading"
        /> -->
          <Button
            type="submit"
            text="Buat Tiket"
            btnClass="btn-dark"
            :disabled="ticketsStore.formLoading"
          >
            <span v-if="ticketsStore.formLoading">Membuat...</span>
            <span v-else>Buat Tiket</span>
          </Button>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup>
import Button from '@/components/Button' // Pastikan Button diimpor
import Card from '@/components/Card'
import Select from '@/components/Select'
import Textarea from '@/components/Textarea'
import Textinput from '@/components/Textinput'
import { useTicketsStore } from '@/store/tickets'
import { useField, useForm } from 'vee-validate'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import * as yup from 'yup'

const ticketsStore = useTicketsStore()
const router = useRouter()
const toast = useToast()

// Opsi untuk Select Status
const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
  { value: 'reopened', label: 'Reopened' },
]

// Opsi untuk Select Prioritas
const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

// Skema Validasi dengan Yup
const schema = yup.object({
  title: yup.string().required('Judul tiket wajib diisi.'),
  description: yup.string().nullable(), // Deskripsi opsional
  status: yup
    .string()
    .required('Status wajib diisi.')
    .oneOf(
      statusOptions.map((opt) => opt.value),
      'Status tidak valid.'
    ),
  priority: yup
    .string()
    .required('Prioritas wajib diisi.')
    .oneOf(
      priorityOptions.map((opt) => opt.value),
      'Prioritas tidak valid.'
    ),
  assigned_to_id: yup
    .number()
    .nullable()
    .transform((value) => (isNaN(value) ? null : value)), // Opsional, bisa null
})

// Inisialisasi Form dengan VeeValidate
const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
})

// Definisikan Field Form
const { value: title, errorMessage: titleError } = useField('title')
const { value: description, errorMessage: descriptionError } =
  useField('description')
const { value: status, errorMessage: statusError } = useField('status')
const { value: priority, errorMessage: priorityError } = useField('priority')
const { value: assigned_to_id, errorMessage: assignedToIdError } =
  useField('assigned_to_id')

// Fungsi Submit Form
const onSubmit = handleSubmit(async (values) => {
  ticketsStore.formError = null // Reset error form
  const result = await ticketsStore.createTicket(values)

  if (result.success) {
    toast.success(result.message, { timeout: 2000 })
    resetForm() // Reset form setelah sukses
    // Redirect sudah ditangani di Pinia store
  } else {
    toast.error(result.message || 'Gagal membuat tiket. Silakan coba lagi.', {
      timeout: 3000,
    })
  }
})

// Ambil daftar pengguna saat komponen dimuat
onMounted(() => {
  ticketsStore.fetchUsers()
})
</script>

<style lang="scss"></style>
