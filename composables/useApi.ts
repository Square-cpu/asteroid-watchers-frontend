import axios from 'axios'
import { useRuntimeConfig } from '#app'

export const useApi = () => {
  const { token } = useAuth()
  const config = useRuntimeConfig()

  // Return a function to create an axios instance on demand
  function createInstance() {
    const baseURL = config.public.baseURL || 'http://localhost:5000/'
    return axios.create({
      baseURL,
      headers: {
        Authorization: `${token.value}`, // Ensure to use .value to access the reactive reference
      },
    })
  }

  const request = async (method, url, data = null, config = {}) => {
    const instance = createInstance()

    try {
      if (method === 'get' || method === 'delete') {
        return await instance[method](url, config)
      } else {
        return await instance[method](url, data, config)
      }
    } catch (error) {
      console.error(error.message)
      throw error
    }
  }

  const get = (url, config = {}) => request('get', url, null, config)
  const post = (url, data, config = {}) => request('post', url, data, config)
  const put = (url, data, config = {}) => request('put', url, data, config)
  const del = (url, config = {}) => request('delete', url, null, config)

  return {
    createInstance,
    get,
    post,
    put,
    del,
  }
}
