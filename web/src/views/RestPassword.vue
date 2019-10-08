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
          <h3 class="green">重置密码</h3>
        </div>
        <el-form-item prop="phonenumber" class="phonenumber-item" ref="phonenumber">
          <el-input
            v-model="userForm.phonenumber"
            placeholder="手机号"
            class="phonenumber-input"
            type="phonenumber"
            name="phonenumber"
          >
            <i slot="prefix" class="iconfont el-icon-message"></i>
          </el-input>
          <el-button
            type="primary"
            class="phonenumber-btn"
            @click="handleValidatephonenumber"
            :disabled="timeoutNum===0?false:true"
          >{{timeoutNum===0?'发送验证':timeoutNum+'s后重试'}}</el-button>
        </el-form-item>
        <el-form-item prop="phonenumbercode" class="phonenumber-item">
          <el-input v-model="userForm.phonenumbercode" placeholder="请输入短信验证码" type="number">
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
          <el-button @click="submit" :loading="isLoging" type="success">重置密码</el-button>
        </div>
        <input type="submit" @click="handleSubmitBtn" style="display:none" />
      </el-form>
    </el-scrollbar>
  </div>
</template>

<script>
import validate from "@/assets/js/validate.js";
import mixins from "@/assets/js/mixins.js";
import axios from "@/assets/js/axios";

export default {
  components: {},
  mixins: [validate, mixins],
  data() {
    return {
      errorTip: "", // 后台返回的错误提示
      // 表单数据
      userForm: {
        phonenumber: "",
        phonenumbercode: "",
        password: "",
        password2: ""
      },
      // 正在登陆,button显示loading
      isLoging: false,
      // 验证手机号码对话框
      valiphonenumberDialVisi: false,
      // 邮件本地验证通过?
      isRealphonenumber: false,
      // 已发送验证码?
      isSentphonenumber: false,
      timeoutNum: 0,
      timer: null,
      // 验证规则
      rules: {
        phonenumbercode: [
          { required: true, trigger: "blur", message: "请输入验证码" }
        ],
        phonenumber: [
          {
            required: true,
            message: "请输入正确的手机号",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (!value) {
                return callback(new Error("手机号不能为空"));
              } else {
                const reg = /^1([38]\d|5[0-35-9]|7[3678])\d{8}$/;
                if (reg.test(value)) {
                  callback();
                } else {
                  return callback(new Error("请输入正确的手机号"));
                }
              }
            }
          },
          { validator: this.isphonenumberExist, trigger: "blur" }
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
    // 检测手机号码是否被占用
    isphonenumberExist(rule, value, callback) {
      let reg = /^1([38]\d|5[0-35-9]|7[3678])\d{8}$/;
      if (!reg.test(value)) {
        callback(new Error("请输入正确的手机号码"));
      }

      axios.get(`/user/phonenumberexist?phonenumber=${value}`).then(res => {
        if (res.data) {
          callback();
        } else {
          callback(new Error("手机号错误"));
        }
      });
    },
    // 发送手机号码验证码
    handleValidatephonenumber() {
      // 通过本地验证后发送手机号码验证
      if (
        this.$refs.phonenumber.validateState === "success"
      ) {
        // 发送请求....
        axios
          .post("/user/respwdphonenumbercode", {
            phonenumber: this.userForm.phonenumber
          })
          .then(() => {
            this.$message({
              message: "手机号码验证码发送成功",
              type: "success",
              duration: 5000
            });
          })
          .catch(() => {
            this.$message({
              message: "手机号码验证码发送失败, 请重试",
              type: "warning",
              duration: 5000
            });
          });

        this.isSentphonenumber = true;
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
      this.submit();
    },
    submit() {
      this.$refs.userForm.validate(valid => {
        if (!valid) {
          return;
        }
        // 防抖
        if (this.submit.timer) return;
        this.submit.timer = setTimeout(() => {
          this.submit.timer = undefined;
        }, 500);
        this.isLoging = true;
        // 请求注册
        let data = Object.assign({}, this.userForm);
        delete data.password2;

        axios
          .post("/user/restpassword", data)
          .then(() => {
            this.showMessage("密码重置成功", "success");
            setTimeout(() => this.routerPush("/login"), 1000);
            this.isLoging = false;
          })
          .catch(res => {
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
.phonenumber-item {
  position: relative;
  .phonenumber-input {
    width: 78%;
  }
  .phonenumber-btn {
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
