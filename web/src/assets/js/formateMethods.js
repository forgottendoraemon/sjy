export default {
  methods: {
    // 格式化时间: yyyy-mm-dd hh:mm
    formatDate(date) {
      if (!date) {
        return '无'
      }
      date = new Date(date)
      let year = date.getFullYear()
      let month = this.formatNum(date.getMonth() + 1)
      let day = this.formatNum(date.getDate())
      let hours = this.formatNum(date.getHours())
      let minutes = this.formatNum(date.getMinutes())
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    // 格式化数字  显示两位,如 09
    formatNum(num) {
      return num.toString().padStart(2, '0')
    },
    // 格式化购买类型: renew:续费  upgrade:升级  buy:购买
    formatAction(type) {
      switch (type) {
        case 'renew':
          return '续费'
        case 'upgrade':
          return '升级'
        case 'buy':
          return '购买'
        default:
          return '/'
      }
    }
  }
}
