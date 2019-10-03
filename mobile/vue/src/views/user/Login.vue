<template>
  <div class="form-page">
    <van-cell-group class="form">
      <form method="POST" @submit.prevent="login" ref="userForm">
        <van-field
          v-model="userForm.username"
          required
          clearable
          :error="errorMsg.username?true:false"
          :placeholder="errorMsg.username?errorMsg.username:'请输入用户名'"
          autofocus="autofocus"
          @focus="errorMsg.username=''"
          @blur="checkupForm('username')"
          label="用户名"
          :error-message="userForm.username?errorMsg.username:''"
        />
        <van-field
          v-model="userForm.password"
          type="password"
          label="密码"
          :error="errorMsg.password?true:false"
          :placeholder="errorMsg.password?errorMsg.password:'请输入密码'"
          :error-message="userForm.password?errorMsg.password:''"
          required
          @keyup.native.enter="login"
          @focus="errorMsg.password=''"
          @blur="checkupForm('password')"
        />
        <div class="login">
          <van-button @click="login" type="info" size="normal">登录</van-button>
        </div>
      </form>
    </van-cell-group>
    <!-- <van-loading color="white" /> -->
  </div>
</template>

<script>
import Vue from "vue";
import { Notify, Toast } from 'vant';
import * as globalConst from '@/assets/js/globalConst.js'
import validate from '@/assets/js/validate.js';
import { mapState } from 'vuex';
Vue.use(Notify)
  .use(Toast);
export default {
  mixins: [validate],
  data() {
    return {
      userForm: {
        username: "",
        password: ""
      },
      errorMsg: {
        username: "",
        password: ""
      },
    }
  },
  computed: {
    ...mapState({
      isLogin: state => state.isLogin,
    })
  },
  methods: {
    emptyErrText() {
      this.passErrorText = ""
      this.userxErrorText = ""
    },
    login() {
      if (this.isLogin) {
        this.routerReplace('/')
      }
      this.debounce(this.loginFn, 500)
    },
    /**
     * 重置表单
     */
    resetForm() {
      this.userForm = {
        username: "",
        password: ""
      }
    },
    loginFn() {
      let checkOk = this.checkForm()
      if (!checkOk) {
        return
      }
      this.emptyErrText();
      let data = {
        username: this.userForm.username.trim(),
        password: this.userForm.password.trim()
      }

      Toast.loading({
        mask: true,
        message: '请求中...',
        duration: 0
      })
      // 请求登陆
      this.$store
        .dispatch("login", data)
        .then(res => {
          if (res.data && !res.data.error) {
            // 登陆成功则跳转到首页，失败则显示返回的错误信息
            Toast.clear()
            Notify({
              message: '登录成功',
              duration: 2000,
              background: '#1989fa'
            })
            // this.$router.push("/")
            this.resetForm()
            this.routerReplace('/')

          } else {
            Toast.clear()
            // this.progressDialog.open = false
            Notify({
              message: '用户名或密码错误',
              duration: 2000,
              background: '#ff4444'
            });
          }
        })
        .catch(err => {
          Toast.clear()
          console.log(err)
          Notify({
            message: '登陆失败,请重试!',
            duration: 2000,
            background: '#ff4444'
          });
          // this.showAndCloseSnackbar('登陆失败,请重试!', 2000)
        })
    },
    routerReplace(path) {
      this.$router.replace(path)
    },
    checkupForm(checkReg) {
      const val = this.userForm[checkReg];
      switch (checkReg) {
        case "username":
          this.checkName(val).then(res => {
            this.errorMsg.username = res
          })
          break;
        case "password":
          this.checkPass(val).then(res => {
            this.errorMsg.password = res
          })
          break;
        default:
          break;
      }
    },
    /**
      * 验证用户密码
    */
    checkForm() {
      const usernameReg = globalConst.USERNAME_REGEX;
      const passwordReg = globalConst.PASSWORD_REGEX;
      if (!passwordReg.test(this.userForm.password) || !usernameReg.test(this.userForm.username)) {
        if (!passwordReg.test(this.userForm.password)) {
          this.errorMsg.password = "密码错误"
        }
        if (!usernameReg.test(this.userForm.username)) {
          this.errorMsg.username = "用户名输入不对"
        }
        return false
      }
      return true
    },
    debounce(fn, delay = 500) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        fn()
      }, delay);
    }
  }
}
</script>

<style scoped lang="less">
.form-page {
  .form {
    padding: 0 10px;
    .login {
      width: 80%;
      margin: 0 auto;
      margin-top: 2rem;
      button {
        width: 100%;
      }
    }
  }
}
</style>
