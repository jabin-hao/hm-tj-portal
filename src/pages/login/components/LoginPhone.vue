<!-- 登录页面 - 手机号验证码登录 -->
<template>
  <div class="loginPhone">
    <el-form
      ref="formRef"
      :model="fromData"
      :rules="rules"
      label-width="0px"
      class="demo-dynamic"
    >
      <el-form-item prop="cellPhone" label="">
        <el-input v-model="fromData.cellPhone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item prop="password" label="">
        <div class="fx-sb code-row">
          <el-input v-model="fromData.password" placeholder="请输入验证码" />
          <span class="bt bt-grey" :class="{ disabled: isSending }" @click="verifycodeHandle">
            {{ isSending ? `${countdown}s` : "发送验证码" }}
          </span>
        </div>
      </el-form-item>
      <el-form-item class="marg-b-10">
        <div class="fx-sb">
          <div>
            <el-checkbox v-model="fromData.rememberMe" label="7天免登录" size="large" />
          </div>
          <div>找回密码</div>
        </div>
      </el-form-item>
      <el-form-item class="marg-bt-15">
        <div class="bt" @click="submitForm(formRef)">登 录</div>
      </el-form-item>
    </el-form>
    <div class="font-bt text-center" @click="goRegister">
      去注册
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { getUserInfo, phoneLogins, verifycode } from "@/api/user"
import { useUserStore } from "@/store"
import { ElMessage } from "element-plus"

const emit = defineEmits(["goHandle"])
const store = useUserStore()
const router = useRouter()
const formRef = ref()

const fromData = reactive({
  cellPhone: "",
  password: "123456",
  rememberMe: false
})
const isSending = ref(false)
const countdown = ref(0)
let countdownTimer

const rules = reactive({
  cellPhone: [
    { required: true, message: "请输入正确的手机号", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入短信验证码", trigger: "blur" }
  ]
})

const verifycodeHandle = async () => {
  const reg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
  if (!reg.test(fromData.cellPhone)) {
    ElMessage({ message: "请输入正确的手机号", type: "error" })
    return
  }
  if (isSending.value) return

  try {
    const res = await verifycode({ cellPhone: fromData.cellPhone })
    if (res?.code !== 200) {
      ElMessage({ message: res?.msg || "验证码发送失败", type: "error" })
      return
    }

    ElMessage({ message: "验证码发送成功", type: "success" })
    isSending.value = true
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) {
        clearInterval(countdownTimer)
        isSending.value = false
      }
    }, 1000)
  } catch (error) {
    ElMessage({ message: error?.message || "验证码发送失败", type: "error" })
  }
}

const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) return

    try {
      const res = await phoneLogins(fromData)
      const token = typeof res === "string" ? res : res?.code === 200 ? res.data : null
      if (!token) {
        ElMessage({ message: res?.msg || "登录失败", type: "error" })
        return
      }

      await store.setToken(token)
      const userResponse = await getUserInfo()
      if (userResponse?.code !== 200) {
        ElMessage({ message: userResponse?.msg || "获取用户信息失败", type: "error" })
        return
      }

      await store.setUserInfo(userResponse.data)
      await router.push("/main/index")
    } catch (error) {
      ElMessage({ message: error?.message || "登录请求失败", type: "error" })
    }
  })
}

const goRegister = () => {
  emit("goHandle", "register")
}

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style lang="scss" scoped>
.loginPhone {
  margin-top: 40px;

  .code-row .bt {
    position: absolute;
    width: 80px;
    height: 28px;
    line-height: 28px;
    font-size: 14px;
    right: 10px;
    top: 6px;
  }

  .code-row .disabled {
    cursor: not-allowed;
    opacity: .6;
  }
}
</style>
