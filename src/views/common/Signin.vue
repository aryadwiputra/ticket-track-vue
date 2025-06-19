<!-- src/views/auth/common/Signin.vue -->
<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <Textinput
      label="Email"
      type="email"
      placeholder="Type your email"
      name="email"
      v-model="email"
      :error="emailError"
      classInput="h-[48px]"
    />
    <Textinput
      label="Password"
      type="password"
      placeholder="8+ characters, 1 capital
    letter"
      name="password"
      v-model="password"
      :error="passwordError"
      hasicon
      classInput="h-[48px]"
    />
    <div class="flex justify-between">
      <label class="cursor-pointer flex items-start">
        <input type="checkbox" class="hidden" v-model="checkbox" />
        <span
          class="h-4 w-4 border rounded flex-none inline-flex mr-3 relative top-1 transition-all duration-150"
          :class="
            checkbox
              ? 'ring-2 ring-black-500 dark:ring-offset-slate-600 dark:ring-slate-900  dark:bg-slate-900 ring-offset-2 bg-slate-900'
              : 'bg-slate-100 dark:bg-slate-600 border-slate-100 dark:border-slate-600 '
          "
        >
          <img
            src="@/assets/images/icon/ck-white.svg"
            alt=""
            class="h-[10px] w-[10px] block m-auto"
            v-if="checkbox"
          />
        </span>
        <span class="text-slate-500 dark:text-slate-400 text-sm leading-6"
          >Keep me signed in</span
        >
      </label>
      <router-link
        to="/forgot-password"
        class="text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium"
        >Forgot Password?</router-link
      >
    </div>

    <!-- Menampilkan error dari API (Pinia Store) -->
    <p v-if="authStore.error" class="text-red-500 text-sm text-center">
      {{ authStore.error }}
    </p>

    <button
      type="submit"
      class="btn btn-dark block w-full text-center"
      :disabled="authStore.loading"
    >
      <span v-if="authStore.loading">Loading...</span>
      <span v-else>Sign in</span>
    </button>
  </form>
</template>

<script setup>
import Textinput from '@/components/Textinput'
import { useAuthStore } from '@/store/auth' // Import Pinia auth store
import { useField, useForm } from 'vee-validate'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import * as yup from 'yup'

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

const checkbox = ref(false) // Menggunakan ref untuk checkbox

// Define a validation schema
const schema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    email: 'superadmin@gmail.com', // Default value untuk kemudahan testing
    password: 'password', // Default value untuk kemudahan testing
  },
})

// No need to define rules for fields, vee-validate handles it with schema
const { value: email, errorMessage: emailError } = useField('email')
const { value: password, errorMessage: passwordError } = useField('password')

const onSubmit = handleSubmit(async (values) => {
  authStore.error = null // Bersihkan error API sebelumnya

  const success = await authStore.login({
    email: values.email,
    password: values.password,
  })

  if (success) {
    toast.success('Login successfully', { timeout: 2000 })
    // Redirection ke /home sudah ditangani oleh authStore.login()
    router.push('/home')
  } else {
    // Error message sudah diset di authStore.error oleh action login
    toast.error(authStore.error || 'Login failed. Please try again.', {
      timeout: 2000,
    })
  }
})
</script>

<style lang="scss"></style>
