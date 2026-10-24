import axios from "axios"
import proxy from "../config/proxy"
import { ElMessageBox } from "element-plus"
import router from "../router"
import { tryRefreshToken } from "./refreshToken"

const env = import.meta.env.MODE || "development"
const host = env === "mock" ? "https://mock.boxuegu.com/mock/3359" : proxy[env].host
const CODE = {
  REQUEST_SUCCESS: 200
}

let isLogin = true

const instance = axios.create({
  baseURL: host,
  timeout: 5000,
  withCredentials: true
})

instance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token")
  config.headers = {
    ...config.headers,
    "Content-Type": "application/json",
    authorization: token || ""
  }
  return config
})

async function refreshToken(error) {
  const success = await tryRefreshToken()
  if (success) return instance(error.config)

  ElMessageBox.alert("请先登录！", "未登录或登录超时", {
    confirmButtonText: "重新登录",
    callback: () => router.push("/login")
  })
  return true
}

function alertLoginMessage() {
  isLogin = false
  sessionStorage.removeItem("userInfo")
  sessionStorage.removeItem("token")
  ElMessageBox.confirm(
    "您的账号登录超时或在其他机器登录，请重新登录或更换账号登录！",
    "登录超时",
    {
      confirmButtonText: "重新登录",
      cancelButtonText: "继续浏览",
      type: "warning"
    }
  )
    .then(() => router.push("/login"))
    .catch(() => router.go(0))
}

function getResponseErrorMessage(error) {
  const data = error.response?.data
  if (typeof data === "string" && data.trim()) return data
  if (data && typeof data === "object") {
    return data.msg || data.message || data.error || data.data?.msg || ""
  }
  return ""
}

instance.interceptors.response.use(
  (response) => {
    const code = response.data?.code
    if (code === CODE.REQUEST_SUCCESS) return response.data

    if (code === 401 && isLogin) {
      isLogin = false
      alertLoginMessage()
    }
    return response.data
  },
  async (error) => {
    const responseMessage = getResponseErrorMessage(error)
    if (responseMessage) error.message = responseMessage

    if (error.response?.status === 401 && isLogin) {
      return refreshToken(error)
    }
    return Promise.reject(error)
  }
)

export default instance
