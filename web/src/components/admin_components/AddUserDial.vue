<template>
  <el-dialog
    title="新增用户"
    :visible="addUserDigVisible"
    width="500px"
    :close-on-click-modal="false"
    :show-close="false"
    :close-on-press-escape="false"
  >
    <div class="container">
      <el-form
        :model="formData"
        status-icon
        :rules="rules"
        ref="formData"
        label-width="100px"
        class="demo-formData"
      >
        <el-form-item label="用户名" prop="username" required>
          <el-input v-model="formData.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" required>
          <el-input  show-password v-model="formData.password"></el-input>
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="formData.roles" placeholder="请选择帐号角色">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="工作人员" value="worker"></el-option>
            <el-option label="访客" value="visitor"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="帐号邮箱" prop="email">
          <el-input v-model="formData.email"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('formData')">提交</el-button>
          <!-- <el-button type="warning" @click="resetForm('formData')">重置</el-button> -->
          <el-button type="info" @click="close">取消</el-button>
          <input type="submit" @click="handleSubmitBtn" style="display:none" />
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>
<script>
import axios from "@/assets/js/axios";
import validate from "@/assets/js/validate.js";
import { mapState } from "vuex";

export default {
  mixins: [validate],
  computed: {
    ...mapState({
      addUserDigVisible: state => state.addUserDigVisible
    })
  },
  data() {
    return {
      formData: {
        password: "",
        email: "",
        username: "",
        roles: "worker"
      },
      rules: {
        password: [{ validator: this.validatePass, trigger: "blur" }],
        username: [{ validator: this.checkName, trigger: "blur" }],
        roles: [{ required: true, message: "权限不能为空", trigger: "change" }],
        email: [{ required: false, type: "email", message: "请输入合法邮箱" }]
      }
    };
  },
  methods: {
    // 关闭对话框
    close() {
      this.$store.commit("setAddUserDigVisible", false);
    },
    // 回车提交表单
    handleSubmitBtn(e) {
      e.preventDefault();
      this.submitForm("formData");
    },
    // 提交 新建用户
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) {
          console.log("error submit!!");
          return false;
        }
        // 防抖
        if (this.submitForm.timer) return;
        this.submitForm.timer = setTimeout(() => {
          this.submitForm.timer = undefined;
        }, 500);
        axios
          .post("/user/adduser", this.formData)
          .then(res => {
            this.$message({
              message: `成功创建用户 ${this.formData.username} !`,
              type: "success"
            });
            this.close();
          })
          .catch(error => {
            this.$message({ message: "创建用户失败!", type: "warning" });
          });
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.container {
  padding-right: 50px;
}
</style>
