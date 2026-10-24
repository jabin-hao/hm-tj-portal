import request from "@/utils/request.js"

const USER_API_PREFIX = "/us"
const AUTH_API_PREFIX = "/as"
const PHONE_LOGIN_TYPE = 2
const PW_LOGIN_TYPE = 1

// 手机号验证码登录
export const phoneLogins = (data) => request({
  url: `${AUTH_API_PREFIX}/accounts/login`,
  method: "post",
  data: { ...data, type: PHONE_LOGIN_TYPE },
  withCredentials: true
})

// 账号密码登录
export const userLogins = (data) => request({
  url: `${AUTH_API_PREFIX}/accounts/login`,
  method: "post",
  data: { ...data, type: PW_LOGIN_TYPE },
  withCredentials: true
})

// 发送短信验证码
export const verifycode = (params) => request({
  url: `${USER_API_PREFIX}/code`,
  method: "post",
  params
})

// 账号注册
export const userRegist = (data) => request({
  url: `${USER_API_PREFIX}/students/register`,
  method: "post",
  data
})

// 获取用户信息
export const getUserInfo = async (params) => {
  const response = await request({
    url: `${USER_API_PREFIX}/users/me`,
    method: "get",
    params
  })

  // 兼容网关统一响应和用户服务直接返回 UserDetailVO 两种格式。
  if (response && typeof response === "object" && response.code === undefined) {
    return {
      code: 200,
      msg: "OK",
      data: response
    }
  }

  return response
}

// 更改用户信息
export const updateUserInfo = (data) => request({
  url: "/students",
  method: "put",
  data
})

// 账号退出登录
export const userLogout = () => request({
  url: `${AUTH_API_PREFIX}/accounts/logout`,
  method: "post",
  withCredentials: true
})
