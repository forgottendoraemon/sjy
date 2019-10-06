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
          v-model="userForm.password"
          type="password"
          label="密码"
          :error="errorMsg.password?true:false"
          :placeholder="errorMsg.password?errorMsg.password:'请输入密码'"
          :error-message="userForm.password?errorMsg.password:''"
          required
          @keyup.native.enter="login"
          @focus="errorMsg.password=''"
          @blur="checkupForm('password')"
        />
        <div class="login">
          <van-button @click="login" type="info" size="normal">登录</van-button>
        </div>
      </form>
    </van-cell-group>
  </div>
</template>
<script>
export default {

}
</script>
<style lang="less" scoped>
</style>