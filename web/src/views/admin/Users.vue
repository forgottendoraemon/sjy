<template>
  <div class="container">
    <div class="head">
      <el-button type="primary" icon="el-icon-edit" size="small" @click="createUser">创建用户</el-button>
      <el-button
        :disabled="!selectUser"
        type="danger"
        icon="el-icon-delete"
        size="small"
        @click="delUser"
      >删除用户</el-button>
      <el-input v-model="searchKey" class="search-input" size="small" placeholder="用户搜索" clearable />
    </div>
    <div class="table-box">
      <el-table
        :data="pageData"
        style="width:100%;height:100%"
        :stripe="true"
        :border="true"
        size="mini"
        class="table"
        ref="table"
        :highlight-current-row="true"
        @selection-change="selectionChanged"
      >
        <el-table-column type="selection" width="40" align="center"></el-table-column>
        <el-table-column label="序号" type="index" width="50" align="center"></el-table-column>
        <el-table-column
          prop="name"
          label="用户名"
          :formatter="format"
          align="center"
          width="calc((100%-90px)/5)"
        ></el-table-column>
        <el-table-column
          prop="roles"
          label="角色"
          :formatter="format"
          align="center"
          width="calc((100%-90px)/5)"
        ></el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          :formatter="format"
          align="center"
          width="calc((100%-50px)/5)"
        ></el-table-column>
        <el-table-column
          prop="createtime"
          label="创建时间"
          :formatter="format"
          align="center"
          width="calc((100%-90px)/5)"
        ></el-table-column>
        <el-table-column
          prop="lastlogintime"
          label="最后登录时间"
          :formatter="format"
          align="center"
          width="calc((100%-50px)/5)"
        ></el-table-column>
      </el-table>
    </div>
    <el-pagination
      style="text-align: center;"
      :page-sizes="pageSizes"
      :page-size="pageSize"
      :current-page="pageNumber"
      layout="total, sizes, prev, pager, next, jumper"
      :total="tableData.length"
    ></el-pagination>
    <AddUserDial/>
  </div>
</template>
<script>
import { mapState } from "vuex";
import axios from "../../assets/js/axios";
import AddUserDial from '@/components/admin_components/AddUserDial'

export default {
  components:{AddUserDial},
  data() {
    return {
      allData: [],
      pageData: [],
      tableData: [],
      pageSizes: [10, 20, 50, 100],
      pageSize: 20,
      pageNumber: 1,
      searchKey: "",

      selectUser: null
    };
  },
  computed: {
    tableViewLayerInfo() {
      return this.$store.state.tableViewLayerInfo;
    }
  },
  methods: {
    format(row, column, cellValue) {
      if (
        column.property === "createtime" ||
        column.property === "lastlogintime"
      ) {
        if (cellValue) {
          const time = new Date(cellValue);
          return `${time.getFullYear()}-${time.getMonth() +
            1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
        } else {
          return "";
        }
      } else {
        return cellValue;
      }
    },
    updatePageData() {
      this.pageData = this.tableData.slice(
        (this.pageNumber - 1) * this.pageSize,
        this.pageNumber * this.pageSize
      );
    },
    selectionChanged(selection) {
      if (selection.length === 1) {
        this.selectUser = selection[0];
      } else {
        this.selectUser = null;
      }
    },
    delUser() {
      this.$confirm(`确认删除用户'${this.selectUser.name}'?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        axios
          .delete(`/user/user?id=${this.selectUser.id}`)
          .then(() => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.allData.splice(
              this.allData.findIndex(u => u.id == this.selectUser.id),
              1
            );
          })
          .catch(error => {
            this.$message({
              message: '删除失败',
              type: "error"
            });
          });
      });
    },
    createUser(){
      this.$store.commit('setAddUserDigVisible',true);
    }
  },
  mounted() {
    axios.get(`/user/userlist`).then(({ data }) => {
      this.tableData = this.allData = data;
    });
  },
  watch: {
    tableData(newvalue) {
      if (this.pageNumber == 1) {
        this.updatePageData();
      }
      this.pageNumber = 1;
    },
    pageSize() {
      this.updatePageData();
    },
    pageNumber() {
      this.updatePageData();
    },
    searchKey(newvalue) {
      const key = newvalue.trim();
      if (key !== "") {
        this.tableData = this.allData.filter(d => d.name.indexOf(key) !== -1);
      } else {
        this.tableData = this.allData;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .table-box {
    flex-grow: 1;
  }
  .head,
  .table-box {
    padding: 3px 5px;
  }
  .el-input {
    width: 200px;
    float: right;
    position: relative;
    top: 1px;
  }
}
</style>
