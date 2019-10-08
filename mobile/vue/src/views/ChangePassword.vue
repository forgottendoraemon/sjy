<template>
  <div class="info-page">
    <div>
      <van-nav-bar title="修改密码" left-text="地图" left-arrow @click-left="onClickLeft" />
    </div>
    <div class="content">
      <div class="form-page">
        <van-cell-group class="form">
          <form method="POST" @submit.prevent="change" ref="userForm">
            <van-field
              v-model="userForm.password"
              type="password"
              label="当前密码"
              :error="errorMsg.password?true:false"
              :placeholder="errorMsg.password?errorMsg.password:'请输入当前密码'"
              :error-message="userForm.password?errorMsg.password:''"
              required
              @focus="errorMsg.password=''"
              @blur="checkupForm('password')"
            />
            <van-field
              v-model="userForm.newpassword"
              type="password"
              label="新密码"
              :error="errorMsg.newpassword?true:false"
              :placeholder="errorMsg.newpassword?errorMsg.newpassword:'请输入新密码'"
              :error-message="userForm.newpassword?errorMsg.newpassword:''"
              required
              @focus="errorMsg.newpassword=''"
              @blur="checkupForm('password')"
            />
            <van-field
              v-model="userForm.newpassword2"
              type="password"
              label="重复新密码"
              :error="errorMsg.newpassword2?true:false"
              :placeholder="errorMsg.newpassword2?errorMsg.newpassword2:'请输入新密码'"
              :error-message="userForm.newpassword2?errorMsg.newpassword2:''"
              required
              @focus="errorMsg.newpassword2=''"
              @blur="checkupForm('newpassword2')"
            />
            <div class="login">
              <van-button @click="change" type="info" size="normal">修改密码</van-button>
            </div>
          </form>
        </van-cell-group>
      </div>
    </div>
  </div>
</template>
<script>
import validate from "@/assets/js/validate.js";
import Vue from "vue";

export default {
  mixins: [validate],
  data() {
    return {
      userForm: {
        password: "",
        newpassword: "",
        newpassword2: ""
      },
      errorMsg: {
        password: "",
        newpassword: "",
        newpassword2: ""
      },

      validates: {
        password: async val => {
          return await this.checkPass(val);
        },
        newpassword2: async val => {
          if (val == this.userForm.password) {
            return "";
          } else {
            return "重复密码与密码不一致";
          }
        }
      }
    };
  },
  computed: {},
  methods: {
    onClickLeft() {
      this.$router.replace("/");
    },
    change() {
      Vue.axios
        .post("/user/changepassword", this.userForm)
        .then(() => {
          this.$toast({ message: `密码修改成功` });
          setTimeout(() => this.$router.push("/my"), 1000);
        })
        .catch(err => {
          this.$toast({ message: `密码修改失败` });
        });
    },
    checkupForm(checkReg) {
      const val = this.userForm[checkReg];
      this.validates[checkReg](val).then(message => {
        this.errorMsg[checkReg] = message;
      });
    }
  },
  beforeRouteLeave(to, from, next) {
    this.userForm.password = "";
    this.userForm.newpassword = "";
    this.userForm.newpassword2 = "";
    next();
  }
};
</script>
<style lang="less" scoped>
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