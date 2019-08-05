import axios from './axios'

export default {
  methods: {
    // 验证用户名 (获取数据库是否存在)
    checkName(rule, value, callback) {
      const reg = /^.{6,12}$/
      if (value.length < 6) {
        return callback(new Error('用户名长度必须为 6 到 12 位'))
      } else if (!reg.test(value)) {
        return callback(
          new Error('请输入合法用户名(字母开头的字母/数字任意组合)')
        )
      }
      axios.get(`user/userexist?username=${value}`).then(res => {
        if (!res.data) {
          callback()
        } else {
          callback(new Error('用户名已存在'))
        }
      })
    },
    // 验证密码
    validatePass(rule, value, callback) {
      const reg = /^[0-9a-zA-Z-_.]{6,12}$/
      if (value.length < 6) {
        return callback(new Error('请输入 6 到 12 位长度的密码'))
      }
      if (!reg.test(value)) {
        callback(new Error('含有非法字符,请重新输入'))
      } else {
        callback()
      }
    },
    // 重置表单
    resetForm(formName, alt = true) {
      // confirm: 是否弹出提示框
      if (alt) {
        this.$confirm('点击确定后重置，是否继续?', '重置表单', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$refs[formName].resetFields()
        })
      } else {
        this.$refs[formName].resetFields()
      }
    }
  }
}
