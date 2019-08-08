<template>
  <el-dialog title="修改密码" :visible="changePwDiaVisible" width="600px" @close="closeDialog">
    <form class="form" v-loading="isFormLoading">
      <p class="input-item">
        <label>原密码</label>
        <input
          class="input pass-input1"
          v-model="form.oldPass"
          ref="input1"
          @change="clearErrorTip"
          type="password"
          placeholder="原密码"
        >
      </p>
      <p class="input-item">
        <label>新密码</label>
        <input
          class="input pass-input2"
          v-model="form.newPass"
          ref="input2"
          @change="clearErrorTip"
          type="password"
          placeholder="新密码"
        >
      </p>
      <p class="input-item">
        <label>验证新密码</label>
        <input
          class="input pass-input3"
          v-model="form.newPass2"
          ref="input3"
          @change="clearErrorTip"
          type="password"
          placeholder="验证新密码"
        >
      </p>
      <p class="error-tip">
        <span v-show="errorTip.show">{{errorTip.message}}</span>
      </p>
      <div>
        <input type="button" class="submit-btn" @click="submit" value="确认更改">
      </div>
      <input type="submit" @click="handleSubmitBtn" style="display:none">
    </form>
  </el-dialog>
</template>

<script>
import axios from '@/assets/js/axios.js'
import mixins from '@/assets/js/mixins.js'
import { mapState } from "vuex";

export default {
  mixins: [mixins],
  computed: {
    ...mapState({
      changePwDiaVisible: state => state.changePwDiaVisible
    })
  },
  data () {
    return {
      form: {
        oldPass: '',
        newPass: '',
        newPass2: ''
      },
      errorTip: {
        show: false,
        message: ''
      },
      isFormLoading: false
    }
  },
  methods: {
    // 回车提交表单
    handleSubmitBtn (e) {
      e.preventDefault()
      this.submit()
    },
    // 重置表单数据
    resetForm () {
      this.form = {
        oldPass: '',
        newPass: '',
        newPass2: ''
      }
    },
    // 关闭对话框
    closeDialog () {
      this.$store.commit('setChangePwDiaVisible',false);
      this.resetForm()
    },
    // 清除错误提示
    clearErrorTip () {
      this.errorTip.show = false
    },
    // 显示错误提示
    showErrorTip (message) {
      this.errorTip.show = true
      this.errorTip.message = message
    },
    // 验证表单
    checkForm () {
      const reg = /^[0-9a-zA-Z-_.]{6,12}$/
      if (!reg.test(this.form.oldPass)) {
        return false
      }
      if (!reg.test(this.form.newPass)) {
        this.showErrorTip('密码格式为6-12字符')
        this.$refs.input2.focus()
        return false
      }
      if (this.form.newPass !== this.form.newPass2) {
        this.showErrorTip('新密码输入不一致')
        this.$refs.input3.focus()
        return false
      }
      return true
    },
    // 提交更改
    submit () {
      if (!this.checkForm()) return
      // 防抖
      if (this.submit.timer) return
      this.submit.timer = setTimeout(() => {
        this.submit.timer = undefined
      }, 300);
      // 发送请求
      this.isFormLoading = true
      axios.post('/user/changepassword', {
        password: this.form.oldPass,
        newpassword: this.form.newPass
      }).then(res => {
        this.isFormLoading = false
        this.$message({ message: '密码修改成功!', type: 'success' });
        if (res.data.error) {
          return this.$message({ message: `修改失败,${res.data.message}!`, type: 'warning' });
        }
        this.closeDialog()
      }).catch(err => {
        this.$message({ message: '修改失败,请重试!', type: 'warning' });
        this.isFormLoading = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/color.scss";
.form {
  width: 340px;
  margin: 0 auto;
  text-align: center;
  color: #333;
  .input-item {
    margin-top: 10px;
    .input {
      padding: 5px;
      width: 200px;
      height: 30px;
      margin-left: 10px;
      outline: none;
      box-sizing: border-box;
      transition: 0.3s;
      font-size: 12px;
      border-radius: 2px;
      border: 1px solid rgb(136, 136, 136);
      &:focus {
        border-color: $pink;
      }
    }
  }
  label {
    display: inline-block;
    width: 100px;
    font-size: 14px;
  }
}
.error-tip {
  margin: 20px 0;
  height: 20px;
  color: $red;
  font-size: 12px;
}
.submit-btn {
  width: 200px;
  height: 30px;
  outline: none;
  border-radius: 2px;
  border: none;
  background: $pink100;
  transition: 0.3s;
  color: #fff;
  &:hover {
    cursor: pointer;
    background: $pink;
  }
}
</style>
