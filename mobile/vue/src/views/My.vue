<template>
  <div class="info-page">
    <div>
      <van-nav-bar title="我的" left-text="返回" left-arrow @click-left="onClickLeft" />
    </div>
    <div class="content">
      <!-- 用户登录信息 -->
      <div class="user-info" @click="userinfoClick">
        <div class="background"></div>
        <van-row type="flex" align="center">
          <van-col span="1"></van-col>
          <van-col span="3">
            <i class="iconfont icon-KHCFDC_touxiang" />
          </van-col>
          <van-col span="20">
            <van-cell :title="userinfo?userinfo.name:'点击登录'" :is-link="!userinfo" />
          </van-col>
        </van-row>
        <van-row v-if="userinfo" type="flex" align="center">
          <van-col span="1"></van-col>
          <van-col span="3">
            <i class="iconfont icon-mima" />
          </van-col>
          <van-col span="20">
            <van-cell title="修改密码" is-link to="/changepassowrd" />
          </van-col>
        </van-row>
        <van-row v-if="userinfo" type="flex" align="center">
          <van-col span="1"></van-col>
          <van-col span="3">
            <i class="iconfont icon-tuichu" />
          </van-col>
          <van-col span="20">
            <van-cell title="退出登陆" is-link @click="logout" />
          </van-col>
        </van-row>
      </div>
      <div>
        <!-- 关于 -->
        <van-row type="flex" align="center">
          <van-col span="1"></van-col>
          <van-col span="3">
            <i class="iconfont icon-guanyu" />
          </van-col>
          <van-col span="20">
            <van-cell title="关于" is-link to="/about" />
          </van-col>
        </van-row>
        <!-- 帮助 -->
        <van-row type="flex" align="center">
          <van-col span="1"></van-col>
          <van-col span="3">
            <i class="iconfont icon-bangzhu" />
          </van-col>
          <van-col span="20">
            <van-cell title="帮助" is-link to="/help" />
          </van-col>
        </van-row>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";

export default {
  data() {
    return {};
  },
  methods: {
    onClickLeft() {
      this.$router.back();
    },
    userinfoClick() {
      if (!this.userinfo) {
        this.$router.push("/login");
      }
    },
    logout() {
      this.$store
        .dispatch("logout")
        .then(() => {
          this.$toast({ message: `退出成功` });
          setTimeout(() => this.$router.push("/login"), 1000);
        })
        .catch(err => {
          this.$toast({
            type: "fail",
            message: `退出失败,请稍后重试`,
            icon: "warn-o"
          });
        });
    }
  },
  components: {},
  computed: {
    ...mapState({
      userinfo: state => state.userinfo
    })
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
.info-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .content {
    flex-grow: 1;
    padding: 0px 2px;
    font-size: 0.9rem;
    overflow: auto;
    display: flex;
    flex-direction: column;

    .user-info {
      padding: 5px 0;
      flex-grow: 1;

      .background {
        height: 10rem;
        width: 100%;
        background-image: url("../assets/images/userb.jpg");
        background-size: cover;
      }
    }
  }
}
</style>