<template>
  <div class="content">
    <el-scrollbar style="height:100%;width:100%" class="height-scrollbar">
      <el-form
        status-icon
        ref="userForm"
        :model="userForm"
        :rules="rules"
        label-width="0px"
        class="login-box"
      >
        <div class="form-header">
          <h3 class="green">欢迎注册</h3>
        </div>
        <el-form-item prop="username" ref="username">
          <el-input v-model="userForm.username" placeholder="用户名" type="text" name="name">
            <i slot="prefix" class="iconfont icon-user01"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="email" class="email-item" ref="email">
          <el-input
            v-model="userForm.email"
            placeholder="邮箱地址"
            class="email-input"
            type="email"
            name="email"
          >
            <i slot="prefix" class="iconfont el-icon-message"></i>
          </el-input>
          <el-button
            type="primary"
            class="email-btn"
            @click="handleValidateEmail"
            :disabled="timeoutNum===0?false:true"
          >{{timeoutNum===0?'发送验证':timeoutNum+'s后重试'}}</el-button>
        </el-form-item>
        <el-form-item prop="emailcode" class="email-item">
          <el-input v-model="userForm.emailcode" placeholder="请输入邮箱验证码" type="number">
            <i slot="prefix" class="iconfont el-icon-warning"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="userForm.password"
            type="text"
            onfocus="this.type='password'"
            placeholder="请输入密码(不少于6位)"
          >
            <i slot="prefix" class="iconfont icon-password"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="password2">
          <el-input
            v-model="userForm.password2"
            type="text"
            onfocus="this.type='password'"
            placeholder="验证密码"
          >
            <i slot="prefix" class="iconfont icon-password"></i>
          </el-input>
        </el-form-item>
        <div class="error-tip">
          <p>{{errorTip}}</p>
        </div>
        <div class="submit-box">
          <el-button @click="register" :loading="isLoging" type="success">注册</el-button>
        </div>
        <div class="tip">
          <p @click="$router.push('/login')">已有账号</p>
        </div>
        <input type="submit" @click="handleSubmitBtn" style="display:none" />
      </el-form>
    </el-scrollbar>
    <ValidateEmailDial :dialogVisible.sync="valiEmailDialVisi" :email="userForm.email" />
  </div>
</template>

<script>
import validate from "@/assets/js/validate.js";
import mixins from "@/assets/js/mixins.js";
import ValidateEmailDial from "@/components/register_components/ValidateEmailDial.vue";
import axios from "@/assets/js/axios";

export default {
  components: {
    ValidateEmailDial
  },
  mixins: [validate,mixins],
  data() {
    return {
      errorTip: "", // 后台返回的错误提示
      // 表单数据
      userForm: {
        username: "",
        email: "",
        emailcode: "",
        password: "",
        password2: ""
      },
      // 正在登陆,button显示loading
      isLoging: false,
      // 验证邮箱对话框
      valiEmailDialVisi: false,
      // 邮件本地验证通过?
      isRealEmail: false,
      // 已发送验证码?
      isSentEmail: false,
      timeoutNum: 0,
      timer: null,
      // 验证规则
      rules: {
        username: [{ validator: this.checkName, trigger: "blur" }],
        emailcode: [
          { required: true, trigger: "blur", message: "请输入验证码" }
        ],
        email: [
          {
            required: true,
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: "blur"
          },
          { validator: this.isEmailExist, trigger: "blur" }
        ],
        password: [{ validator: this.validatePass, trigger: "blur" }],
        password2: [{ validator: this.validatePasswrod2, trigger: "blur" }]
      }
    };
  },
  // components: {
  //   'el-form': Form,
  //   'el-form-item': FormItem
  // },
  methods: {
    showMessage(message, type = "error", duration = 2000) {
      this.$message({
        message,
        type,
        duration
      });
    },
    // 检测邮箱是否被占用
    isEmailExist(rule, value, callback) {
      let reg = new RegExp(
        "^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"
      );
      if (!reg.test(value)) {
        return callback(new Error("请输入正确的邮箱地址"));
      }

      axios.get(`/user/emailexist?email=${value}`).then(res => {
        if (res.data) {
          callback(new Error("邮箱已被使用,请绑定其他邮箱"));
        } else {
          callback();
        }
      });
    },
    // 发送邮箱验证码
    handleValidateEmail() {
      // 通过本地验证后发送邮箱验证
      if (
        this.$refs.email.validateState === "success" &&
        this.$refs.username.validateState === "success"
      ) {
        // 发送请求....
        axios
          .post("/user/emailcode", {
            email: this.userForm.email,
            username: this.userForm.username
          })
          .then(() => {
            this.$message({
              message: "邮箱验证码发送成功, 请登录邮箱获取验证码",
              type: "success",
              duration: 5000
            });
          })
          .catch(() => {
            this.$message({
              message: "邮箱验证码发送失败, 请重试",
              type: "warning",
              duration: 5000
            });
          });

        this.isSentEmail = true;
        // 60s 定时递减
        this.timeoutNum = 60;
        this.createTimer();
      }
    },
    // 倒计时
    createTimer() {
      this.timer = setTimeout(() => {
        this.timeoutNum -= 1;
        if (this.timeoutNum > 0) {
          this.createTimer();
        }
      }, 1000);
    },
    // 验证再次输入密码
    validatePasswrod2(rule, value, callback) {
      if (value == "") {
        callback(new Error("请再次输入密码"));
      } else if (value.trim() != this.userForm.password.trim()) {
        callback(new Error("两次输入的密码不一致!"));
      } else {
        callback();
      }
    },
    // 回车提交表单
    handleSubmitBtn(e) {
      e.preventDefault();
      this.register();
    },
    // 注册
    register() {
      this.$refs.userForm.validate(valid => {
        if (!valid) {
          return;
        }
        // 防抖
        if (this.register.timer) return;
        this.register.timer = setTimeout(() => {
          this.register.timer = undefined;
        }, 500);
        this.isLoging = true;
        // 请求注册
        let data = Object.assign({}, this.userForm);
        delete data.password2;

        axios.post("/user/register", data).then(() => {
          this.showMessage("注册成功", "success");
          setTimeout(() => this.routerPush("/login"), 1000);
          this.isLoging = false;
        }).catch(res=>{
            this.errorTip = res.data.message;
            this.isLoging = false;
        });
      });
    }
  },
  beforeRouteLeave(to, from, next) {
    // this.emptyErrTip()
    this.resetForm("userForm", false);
    next();
  }
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/login.scss";
.email-item {
  position: relative;
  .email-input {
    width: 78%;
  }
  .email-btn {
    position: absolute;
    top: 1px;
    right: 1px;
    width: 20%;
    padding: 9px 2px;
  }
}
</style>
<style lang="scss">
.height-scrollbar {
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
}
</style>
