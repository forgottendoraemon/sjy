export default {
  methods: {
    /**
     * 显示消息
     * @param {String} message 消息内容 
     * @param {String} type 消息类型 'success', 'error', 'warning', 'info'
     * @param {Int} duration 
     */
    showMessage(message, type = 'error', duration = 2000) {
      this.$message({
        message,
        type,
        duration
      })
    },
    /**
     * 路由跳转
     * @param { String } path 路由路径
     */
    routerPush(path) {
      this.$router.push(path)
    },
    /**
     * 延迟
     * @param {Int} time 
     */
    async delay(time = 300) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, time)
      })
    }
  }
}
