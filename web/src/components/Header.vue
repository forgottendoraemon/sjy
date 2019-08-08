<template>
  <div class="header">
    <el-menu
      mode="horizontal"
      background-color="#030133"
      active-text-color="#fff"
      text-color="#fff"
      :router="true"
      :default-active="currentRoute"
      style="display: flex;"
    >
      <router-link class="logo" to="/">
        <img src="../assets/images/logo.png" alt="logo" />
      </router-link>
      <div style="flex-grow: 1;"></div>
      <el-menu-item index="/">首页</el-menu-item>
      <el-menu-item index="/map">地图</el-menu-item>
      <el-menu-item
        v-if="userinfo"
        class="user-center right"
        @click="changePassword"
        title="点击修改密码"
      >{{userinfo.name}}</el-menu-item>
      <el-menu-item v-show="isAdministrator" index="/admin">后台管理</el-menu-item>
      <el-menu-item v-show="!isLogin" index="/register">注册</el-menu-item>
      <el-menu-item v-show="!isLogin" index="/login">登陆</el-menu-item>
      <el-menu-item v-show="isLogin" @click="logout">退出</el-menu-item>
    </el-menu>
    <ChangePwDia :dialogVisible.sync="changePwDiaVisible" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import mixins from "@/assets/js/mixins.js";
import ChangePwDia from "./ChangePwDia";

export default {
  components: { ChangePwDia },
  mixins: [mixins],
  data() {
    return {
      changePwDiaVisible: false
    };
  },
  computed: {
    ...mapState({
      currentRoute: state => state.currentRoute,
      userinfo: state => state.userinfo,
      isLogin: state => state.isLogin,
      isAdministrator: state => state.isAdministrator,
      isShowHeaderMenu: state => state.isShowHeaderMenu
    })
  },
  methods: {
    async logout() {
      await this.$store.dispatch("logout");
      this.routerPush("/");
      this.$store.commit("setIsShowHeaderMenu", true);
    },
    changePassword() {
      this.$store.commit("setChangePwDiaVisible", true);
    }
  }
};
</script>

<style scoped lang="scss">
h1 {
  color: #fff;
}
.header {
  border-bottom: none;
}
.el-menu--horizontal {
  border-bottom: none;
  height: 60px;
  overflow: hidden;
}

.el-menu--horizontal > .el-menu-item {
  height: 58px;
}
.logo {
  height: 60px;
  float: left;
  outline-width: 0;
  img {
    height: 100%;
  }
}
.qq-call {
  height: 100%;
  float: right;
  padding-top: 15px;
  img {
    width: 100px;
  }
}
.user-center {
  .task-count {
    display: inline-block;
    width: 20px;
    height: 20px;
    position: absolute;
    top: 10px;
    right: 5px;
    line-height: 20px;
    text-align: center;
    border-radius: 50%;
    background: rgb(253, 76, 76);
  }
}
</style>
<style lang="scss">
// header 栏的 用户中心 小红点
.head-new-msg-badge {
  top: -5px;
  .el-badge__content {
    height: 5px;
    width: 5px;
    border: 1px solid #aaa;
    background: #e6a23c;
  }
}
</style>

