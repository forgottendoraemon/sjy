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
          v-model="userForm.phonenumber"
          required
          clearable
          :error="errorMsg.phonenumber?true:false"
          :placeholder="errorMsg.phonenumber?errorMsg.phonenumber:'请输入手机号'"
          autofocus="autofocus"
          @focus="errorMsg.phonenumber=''"
          @blur="checkupForm('phonenumber')"
          label="手机号"
          :error-message="userForm.phonenumber?errorMsg.phonenumber:''"
        />
        <div>
          <van-row type="flex" align="center">
            <van-col span="18">
              <van-field
                v-model="userForm.phonenumbercode"
                required
                clearable
                :error="errorMsg.phonenumbercode?true:false"
                :placeholder="errorMsg.phonenumbercode?errorMsg.phonenumbercode:'请输入短信验证码'"
                autofocus="autofocus"
                @focus="errorMsg.phonenumbercode=''"
                label="短信验证码"
                :error-message="userForm.phonenumbercode?errorMsg.phonenumbercode:''"
              />
            </van-col>
            <van-col span="6">
              <van-button
                type="primary"
                size="small"
                @click="sendPhoneCode"
                :disabled="!cansendcode"
              >{{phoneCodeTime==0?'获取验证码':`重试(${phoneCodeTime}秒)`}}</van-button>
            </van-col>
          </van-row>
          <div class="phonenumber-row"></div>
        </div>

        <van-field
          v-model="userForm.password"
          type="password"
          label="密码"
          :error="errorMsg.password?true:false"
          :placeholder="errorMsg.password?errorMsg.password:'请输入密码'"
          :error-message="userForm.password?errorMsg.password:''"
          required
          @focus="errorMsg.password=''"
          @blur="checkupForm('password')"
        />
        <van-field
          v-model="userForm.password2"
          type="password"
          label="重复密码"
          :error="errorMsg.password2?true:false"
          :placeholder="errorMsg.password2?errorMsg.password2:'请输入密码'"
          :error-message="userForm.password2?errorMsg.password2:''"
          required
          @focus="errorMsg.password2=''"
          @blur="checkupForm('password2')"
        />
        <div class="login">
          <van-button @click="register" type="info" size="normal">注册</van-button>
        </div>
      </form>
    </van-cell-group>
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
        username: "",
        password: "",
        phonenumber: "",
        phonenumbercode: "",
        password2: ""
      },
      errorMsg: {
        username: "",
        password: "",
        phonenumber: "",
        phonenumbercode: "",
        password2: ""
      },

      validates: {
        username: async val => {
          return await this.checkName(val, true);
        },
        password: async val => {
          return await this.checkPass(val);
        },
        phonenumber: async val => {
          return await this.checkPhoneNumber(val);
        },
        password2: async val => {
          if (val == this.userForm.password) {
            return "";
          } else {
            return "重复密码与密码不一致";
          }
        }
      },

      phoneCodeSending: false,
      phoneCodeTime: 0
    };
  },
  computed: {
    cansendcode() {
      return (
        this.userForm.phonenumber &&
        !this.errorMsg.phonenumber &&
        !this.phoneCodeSending &&
        this.phoneCodeTime == 0
      );
    }
  },
  methods: {
    register() {
      Vue.axios.post("/user/register", this.userForm).then(() => {
        this.$toast({message: `注册成功`});
        setTimeout(() => this.$router.push("/login"), 1000);
      });
    },
    checkupForm(checkReg) {
      const val = this.userForm[checkReg];
      this.validates[checkReg](val).then(message => {
        this.errorMsg[checkReg] = message;
      });
    },
    updatePhoneCodeTime() {
      this.phoneCodeTime--;
      if (this.phoneCodeTime) {
        setTimeout(() => this.updatePhoneCodeTime(), 1000);
      }
    },
    sendPhoneCode() {
      this.phoneCodeSending = true;
      this.phoneCodeTime = 60;
      this.updatePhoneCodeTime();
      Vue.axios
        .post("/user/phonenumbercode", {
          phonenumber: this.userForm.phonenumber,
          username: this.userForm.username
        })
        .then(() => {
          this.$toast({
            message: `验证码发送成功,请留意手机短信`
          });
          this.phoneCodeSending = false;
        })
        .catch(() => {
          this.$toast({
            type: "fail",
            message: `验证码发送失败,请稍后重试`,
            icon: "warn-o"
          });
          this.phoneCodeSending = false;
        });
    }
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
  .phonenumber-row {
    position: relative;
    box-sizing: border-box;
    pointer-events: none;
    width: calc(100% - 16px);
    left: 16px;
    border-bottom: 1px solid #ebedf0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}
</style>