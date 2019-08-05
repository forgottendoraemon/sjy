<template>
  <div class="header">
    <el-menu
      mode="horizontal"
      background-color="#030133"
      active-text-color="#fff"
      text-color="#fff"
    >
      <router-link class="logo" to="/">
        <img src="../assets/logo.png" alt="logo">
      </router-link>
      <!-- 已登陆 -->
        <el-menu-item class="right"  index="login">登陆</el-menu-item>
        <el-menu-item class="right"  index="register">注册</el-menu-item>
        <el-menu-item class="right" route="/map" index="map">地图</el-menu-item>
        <el-menu-item class="right" route="/" index="home">首页</el-menu-item>
    </el-menu>
  </div>
</template>

<script>

export default {
  computed: {
  },
  methods: {
  }
};
</script>

<style scoped lang="scss">
.header {
  border-bottom: none;
}
.el-menu--horizontal {
  border-bottom: none;
  height: 60px;
  overflow: hidden;
}
.el-menu--horizontal > .el-menu-item.right {
  float: right;
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

