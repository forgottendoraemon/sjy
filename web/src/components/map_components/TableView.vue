<template>
<transition name="slide-down">
  <div v-if="tableViewLayerInfo" :class="[
    'table-view'
  ]">
    <div class="table">
      <div class="head">
        <span style="line-height: 40px;font-size: 1.2rem;">{{tableViewLayerInfo.name}}</span>
        <el-input
          v-model="searchKey"
          class="search-input"
          size="small"
          placeholder="请输入搜索的内容"
          clearable
        />
        <el-tooltip
          style="position: absolute;right: 27px;top: 16px;"
          effect="dark"
          content="关闭"
          placement="top"
        >
          <i @click="close" class="close el-icon-close"></i>
        </el-tooltip>
      </div>
      <div class="table-box">
        <el-table
          :data="pageData"
          style="width:100%;min-height:220px"
          :stripe="true"
          :border="true"
          size="mini"
          max-height="220px"
          class="table"
          @row-click="rowClick"
          ref="table"
          :highlight-current-row="true"
        >
          <el-table-column label="序号" type="index" width="50" align="center"></el-table-column>
          <el-table-column
            v-for="(item,index) in tableViewLayerInfo.fields"
            :key="index"
            :prop="getFieldProp(item)"
            :label="item.display?item.display:(item.photo?'照片':'')"
            :formatter="format"
            :width="`calc((100%-50px)/${tableViewLayerInfo.fields.length})`"
            align="center"
            :show-overflow-tooltip="true"
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
    </div>
  </div>
</transition>
</template>

<script>
import { mapState } from "vuex";
import axios from "../../assets/js/axios";

export default {
  data() {
    return {
      layerDataAll: [],
      pageData: [],
      tableData: [],
      pageSizes: [10, 20, 50, 100],
      pageSize: 20,
      pageNumber: 1,
      searchKey: ""
    };
  },
  computed: {
    tableViewLayerInfo() {
      return this.$store.state.tableViewLayerInfo;
    }
  },
  methods: {
    getFieldProp(field) {
      return field.name || "photo";
    },
    format(row, column, cellValue) {
      if (column.property === "photo") {
        return "请在属性面板查看照片";
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
    rowClick(row, event, column) {
      this.$store.commit("setCurrentSelectLayerInfo", this.tableViewLayerInfo);
      this.$store.commit("setCurrentSelectFeature", { properties: row });
    },
    close() {
      this.$store.commit("setTableViewLayerInfo", null);
    }
  },
  watch: {
    tableViewLayerInfo(newvalue, oldvuale) {
      if (newvalue) {
        axios.get(`/api/mapdata/${newvalue.source}`).then(({ data }) => {
          this.tableData = this.layerDataAll = data;
        });
      } else {
        this.tableData = [];
        this.layerDataAll = [];
      }
    },
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
        this.tableData = this.layerDataAll.filter(
          d => d.name && d.name.indexOf(key) !== -1
        );
      } else {
        this.tableData = this.layerDataAll;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.table-view {
  position: absolute;
  left: 0;
  right: 220px;
  bottom: 0;
  z-index: 998;
  background-color: #e2e5ea;
  border-top: 1px solid #ccc; 

  .head{
    background: #3385ff;
    padding-left: 5px;
    color: #fff;
  }
  .table-box{
    padding: 2px;
  }
  .search-input {
    max-width: 200px;
    margin-left: 20px;
    position: relative;
    top: -3px;
  }
}
</style>

