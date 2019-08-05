<template>
  <div v-if="dialogVisible">
    <el-dialog
      :visible="dialogVisible"
      width="500px"
      close-on-click-modal
      close-on-press-escape
      @close="$emit('update:dialogVisible',false)"
    >
      <div class="container">
        <div class="title">请发送验证邮件帮助我们确认你的邮箱</div>
        <div class="msg">{{msg}}</div>
        <el-button type="primary" size="medium" @click="handleSendEmail">发送验证邮件</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    dialogVisible: Boolean,
    email: String
  },
  computed: {
    msg () {
      return `点击下按钮将发送验证邮件到\n ${this.email} \n,请登录邮箱完成验证`
    }
  },
  data () {
    return {
      // msg: '点击下按钮发送验证邮件'
    }
  },
  methods: {
    handleSendEmail () {
      this.msg = '发送成功,请登录你的个人邮箱完成验证...'
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  // background: #aaa;
  margin: -15px 0;
  padding-bottom: 10px;
  text-align: center;
  .title {
    font-size: 24px;
    color: #777;
    margin-bottom: 20px;
  }
  .msg {
    font-size: 18px;
    line-height: 36px;
    color: #000;
    margin-bottom: 20px;
  }
  .el-button {
    width: 90%;
    padding: 9 50px;
  }
}
</style>
