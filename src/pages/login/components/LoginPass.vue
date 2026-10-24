<!-- 登录页面 - 用户名密码登录 -->
<template>
  <div class="loginPass">
    <el-form
      ref="formRef"
      :model="fromData"
      :rules="rules"
      label-width="0px"
      class="demo-dynamic"
    >
      <el-form-item prop="username" label="">
        <el-input v-model="fromData.username" placeholder="请输入用户名或手机号" />
      </el-form-item>
      <el-form-item prop="password" label="">
        <el-input type="password" :show-password="true" v-model="fromData.password" placeholder="请输入密码" />
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
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { getUserInfo, userLogins } from "@/api/user"
import { useUserStore } from "@/store"
import { ElMessage } from "element-plus"

const emit = defineEmits(["goHandle"])
const store = useUserStore()
const router = useRouter()
const formRef = ref()

const fromData = reactive({
  username: "",
  password: "",
  rememberMe: false
})

const rules = reactive({
  username: [
    { required: true, message: "请输入正确的用户名或手机号", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入正确的密码", trigger: "blur" }
  ]
})

const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) return

    try {
      const res = await userLogins(fromData)
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
</script>

<style lang="scss" scoped>
.loginPass {
  margin-top: 40px;
}
</style>
