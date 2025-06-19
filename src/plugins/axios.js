import axios from 'axios'

const baseURL = 'https://ticket-track-api.test/api/v1/'

const api = axios.create({
  baseURL,
  timeout: 10000,
})

export default api
