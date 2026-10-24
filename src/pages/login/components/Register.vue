<!-- 注册页面 -->
<template>
  <div class="loginPass">
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
        <el-input type="password" show-password v-model="fromData.password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item prop="code" label="">
        <div class="fx-sb">
          <el-input v-model="fromData.code" placeholder="请输入短信验证码" />
          <span class="bt bt-grey" :class="{ disabled: isSending }" @click="verifycodeHandle">
            {{ isSending ? `${countdown}s` : "发送验证码" }}
          </span>
        </div>
      </el-form-item>
      <el-form-item class="marg-bt-15">
        <div class="bt" @click="submitForm(formRef)">注册</div>
      </el-form-item>
    </el-form>
    <div class="font-bt text-center" @click="goLogin">
      去登录
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref } from "vue"
import { userRegist, verifycode } from "@/api/user"
import { ElMessage } from "element-plus"

const emit = defineEmits(["goHandle"])
const formRef = ref()
const fromData = reactive({
  cellPhone: "",
  password: "",
  code: "123456"
})
const isSending = ref(false)
const countdown = ref(0)
let countdownTimer

const phonePattern = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/

const verifyPhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入手机号"))
    return
  }
  if (!phonePattern.test(value)) {
    callback(new Error("请输入正确的手机号"))
    return
  }
  callback()
}

const rules = reactive({
  cellPhone: [{ validator: verifyPhone, trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  code: [{ required: true, message: "请输入短信验证码", trigger: "blur" }]
})

const verifycodeHandle = async () => {
  if (!phonePattern.test(fromData.cellPhone)) {
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
      const res = await userRegist(fromData)
      if (res?.code !== 200) {
        ElMessage({ message: res?.msg || "注册失败", type: "error" })
        return
      }

      ElMessage({ message: "注册成功！请登录", type: "success" })
      setTimeout(() => emit("goHandle", "pass"), 500)
    } catch (error) {
      ElMessage({ message: error?.message || "注册请求失败", type: "error" })
    }
  })
}

const goLogin = () => {
  emit("goHandle", "pass")
}

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style lang="scss" scoped>
.loginPass {
  margin-top: 40px;

  .fx-sb .bt {
    position: absolute;
    width: 80px;
    height: 28px;
    line-height: 28px;
    font-size: 14px;
    right: 10px;
    top: 6px;
  }

  .disabled {
    cursor: not-allowed;
    opacity: .6;
  }
}
</style>
