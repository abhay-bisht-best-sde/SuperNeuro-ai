import axios from "axios"

const api = axios.create({ baseURL: "" })

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 404 &&
      error.config?.url?.includes("/api/user-config") &&
      error.config?.method?.toLowerCase() === "get"
    ) {
      return Promise.resolve({ data: null, status: 404, config: error.config, headers: error.response?.headers ?? {} })
    }
    return Promise.reject(error)
  },
)

export { api }
