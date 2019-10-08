<template>
  <div class="content">
    <el-scrollbar style="height:100%;width:100%" class="height-scrollbar">
      <el-form ref="userForm" :model="userForm" :rules="rules" label-width="0px" class="login-box">
        <div class="form-header">
          <h3 class="blue">欢迎登陆</h3>
        </div>
        <el-form-item label prop="username">
          <el-input v-model="userForm.username" @keyup.native="emptyErrTip" placeholder="用户名">
            <i slot="prefix" class="iconfont icon-user01"></i>
          </el-input>
        </el-form-item>
        <el-form-item label prop="password">
          <el-input
            v-model="userForm.password"
            @keyup.native="emptyErrTip"
            @keyup.native.enter="login"
            type="password"
            placeholder="密码"
          >
            <i slot="prefix" class="iconfont icon-password"></i>
          </el-input>
        </el-form-item>
        <div class="error-tip">
          <p>{{errorTip}}</p>
        </div>
        <div class="submit-box">
          <el-button @click="login" :loading="isLoading" key="login" type="primary">登陆</el-button>
        </div>
        <div class="tip-btn">
          <span @click="routerPush('/register')">立即注册</span>
          <span @click="routerPush('/findpw')" class="forgetPass">忘记密码?</span>
        </div>
      </el-form>
    </el-scrollbar>
  </div>
</template>

<script>
import axios from "../assets/js/axios";
import mixins from "@/assets/js/mixins.js";

export default {
  mixins: [mixins],
  data() {
    /**
     * 验证username
     */
    var checkUserName = (rule, value, callback) => {
      let reg = /^.{6,12}$/;
      if (!reg.test(value.trim())) {
        callback(new Error("用户名不正确"));
      } else {
        callback();
      }
    };
    /**
     * 验证password
     */
    var checkPassWord = (rule, value, callback) => {
      let reg = /^[0-9a-zA-Z-_.]{6,12}$/;
      if (!reg.test(value.trim())) {
        callback(new Error("密码不正确"));
      } else {
        callback();
      }
    };
    return {
      userForm: {
        // form表单绑定
        username: "",
        password: ""
      },
      isLoading: false, // 向后台请求时给button添加loading
      errorTip: "", // 后台返回的错误提示

      //  验证规则
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            validator: checkUserName,
            trigger: "submit"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            validator: checkPassWord,
            trigger: "submit"
          }
        ]
      }
    };
  },
  computed: {},
  methods: {
    /**
     * 登陆
     */
    login() {
      this.emptyErrTip(); // 清空错误提示

      this.$refs.userForm.validate(async valid => {
        // 基础验证成功
        if (valid) {
          let data = {
            username: this.userForm.username.trim(),
            password: this.userForm.password.trim()
          };

          try {
            const result = await axios.post("/user/login", data);
            this.$store.commit("setUserInfo", result.data);
            this.$router.push("/map");
          } catch (error) {
            this.errorTip = error.response.data;
            this.showMessage(error.response.data);
          }
        } else {
          return false;
        }
      });
    },
    /**
     * 清空错误提示
     */
    emptyErrTip() {
      this.errorTip = null;
    },
    /**
     * 重置表单
     */
    resetForm() {
      this.$refs.userForm.resetFields();
    },

    expirationdateRule(date) {
      return date && this.isLower15Day(date);
    }
  },
  /**
   * 离开页面重置userFrom
   */
  beforeRouteLeave(to, from, next) {
    this.resetForm();
    this.emptyErrTip();
    next();
  }
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/login.scss";
.tip-btn {
  position: relative;
  span {
    display: inline-block;
    padding: 2px;
    color: #aaa;
    margin-top: 15px;
    font-size: 14px;
    transition: 0.3s;
    &:hover {
      color: $blue;
      cursor: pointer;
    }
  }
  .forgetPass {
    position: absolute;
    right: 0;
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
