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
        <el-input type="pass" :show-password="true" v-model="fromData.password" placeholder="请输入密码" />
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
// 数据导入
import { reactive, ref } from "vue";
import { useRoute, useRouter } from 'vue-router'
import { userLogins, getUserInfo } from "@/api/user"
import { useUserStore } from '@/store'
import { ElMessage } from "element-plus";

const emit = defineEmits(['goHandle'])
const store = useUserStore();
const router = useRouter()
const route = useRoute()

const formRef = ref();
const checked = ref(false)
// 登录参数效验
const fromData = reactive({
  username: "13165982930",
  password: "123456",
  type: 1
});
// 效验规则
const rules = reactive({
  username: [
    { required: true, message: "请输入正确的用户名或手机号", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入正确的用密码", trigger: "blur"},
  ],
});
// 登录
const submitForm = (formEl) => {
  if (!formEl) return;
  console.log("login")
  formEl.validate(async (valid) => {
    if (valid) {
      // 提交登录
      await userLogins(fromData)
			.then(async res => {
        console.log("res: ",res)
        // 判断返回是否是token字符串（登录成功）或对象（登录失败）
				if (typeof res === 'string' || res.code === 200) {
          console.log('登录成功，开始设置token')
          // 用户token写入 pinia
          const token = typeof res === 'string' ? res : res.data;
					await store.setToken(token);
          console.log('token已设置，开始获取用户信息')
          console.log('sessionStorage中的token:', sessionStorage.getItem('token'))
					// 获取用户信息
          try {
            const data = await getUserInfo()
            console.log('用户信息返回：', data)
            if (data && data.code === 200) {
                console.log('用户信息获取成功，准备跳转')
                // 记录到store 并调转到首页
                await store.setUserInfo(data.data)
                // 跳转到首页
                const result = await router.push('/main/index')
                console.log('跳转结果：', result)
            } else {
                console.log('获取用户信息失败：', data)
                ElMessage({
                    message: data?.msg || '获取用户信息失败',
                    type: 'error'
                });
            }
          } catch (error) {
            console.error('获取用户信息异常：', error)
            ElMessage({
                message: '获取用户信息异常：' + (error.message || error),
                type: 'error'
            });
          }
				} else {
          ElMessage({
              message: res.msg || '登录失败',
              type: 'error'
          });
					console.log('登录失败')
				}
			})
			.catch(err => {
        console.error('登录请求出错：', err)
        ElMessage({
          message: err.message || err,
          type: 'error'
        });
      });
    } else {
      ElMessage({
          message: '登录出错，请重新尝试',
          type: 'error'
      });
      return false;
    }
  });
};

// 去注册
const goRegister = () => {
  emit('goHandle', 'register')
}
</script>
<style lang="scss" scoped>
.loginPass {
    margin-top: 40px;
}
</style>
