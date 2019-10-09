<template>
  <div class="main">
    <van-nav-bar
      :title="titleAndrightText.title"
      left-text="主页"
      :right-text="titleAndrightText.loginRegister"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
    />
    <transition name="slide-left">
      <keep-alive>
        <router-view class="view-page"></router-view>
      </keep-alive>
    </transition>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      isRegister: false,
      loginOrUnLogIn: {
        loginRegister: [
          {
            title: "欢迎登录",
            loginRegister: "",
          },
          {
            title: "欢迎注册",
            loginRegister: "登录",
          },
        ],
        user: [{
          title: "用户消息",
          loginRegister: "修改密码",
        },
        {
          title: "修改密码",
          loginRegister: "用户消息",
        }]
      },

    }
  },
  methods: {
    onClickLeft() {
      this.$router.back();
      this.isRegister = false;
    },
    onClickRight() {
      if (this.isLogin) {
        if (this.isRegister) {
          this.$router.push("user")
        } else {
          this.$router.push("resetPwd")
        }
      } else {
        if (this.isRegister) {
          this.$router.push("login")
        } else {
          this.$router.push("register")
        }
      }
      this.isRegister = !this.isRegister
    }
  },
  computed: {
    ...mapState({
      isLogin: state => state.isLogin,
      userinfo: state => state.userinfo
    }),
    titleAndrightText() {
      const index = this.isRegister ? 1 : 0
      if (this.isLogin) {
        return this.loginOrUnLogIn.user[index]
      } else {
        return this.loginOrUnLogIn.loginRegister[index]
      }
    }
  }
}
</script>
<style lang="less" scoped>
.main {
  width: 100%;
  height: 100%;
  .view-page {
    overflow: auto;
    min-width: 100%;
    font-size: 15px;
    position: absolute;
    left: 0;
    top: 46px;
    bottom: 0;
    right: 0;
    /*background-image: url("./logo.png");
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: bottom center;
    background-origin: content-box;*/
  }
}
</style>