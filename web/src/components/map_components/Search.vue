<template>
  <div class="search">
    <el-autocomplete
      v-model="query"
      :fetch-suggestions="querySearch"
      :trigger-on-focus="false"
      :hide-loading="true"
      placeholder="关键字搜索"
      class="my-autocomplete"
      size="small"
      :clearable="true"
      :select-when-unmatched="true"
      @select="handleSelected"
    >
      <template slot-scope="{ item }">
        <div class="name text-overflow" @click="findElement(item)">{{ item.value }}</div>
      </template>
    </el-autocomplete>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "../../assets/js/axios";
import maplayers from "../../mapconfig/maplayers";

export default {
  data() {
    return {
      query: ""
    };
  },
  computed: {
    ...mapState({
      currentPoint: state => state.build.currentPoint // 当前选中的图元信息
    })
  },
  methods: {
    /**
     * @desc 搜索全部子图层
     * @param {String} queryString 查询的文字
     * @param {Function} cb 回调函数(将结果通过参数传递)
     */
    querySearch(queryString, cb) {
      if (queryString.trim() === "") {
        cb([{ value: "没有搜索结果" }]);
        return;
      }
      axios.get(`/api/mapdata/search/${queryString.trim()}`).then(({ data }) => {
        if (data.length === 0) {
          cb([{ value: "没有搜索结果" }]);
        } else {
          const rs=[];
          data.forEach(d=>{
            const layerCnName = maplayers.filter(l=>l.source===d.layer)[0].name;
            d.rows.forEach(r=>{
              rs.push({
                value:`${layerCnName}:${r.name}`
              })
            })
          })
          cb(rs);
        }
      });
    },
    /**
     * @desc 定位到当前选择的点/线/面图元
     * @param {Object} layer 图元实例
     */
    findElement({ layer }) {
      // console.log(layer);
      const { layeroptions, id } = layer.LayerGroup.layerGroupData;
      const { geometry } = layer.layerData;
      switch (geometry.type) {
        case "Point":
          if (layer) {
            // 若当前图标聚合,则先分散
            if (layeroptions.isAggregation) {
              let clusterLayer = this.$layerGroups.get(id).getLayers()[0];
              clusterLayer.zoomToShowLayer(layer, () => {
                this.$map.setView(geometry.latlng);
                // layer.openPopup();
              });
            } else {
              this.$map.setView(geometry.latlng);
              // layer.openPopup();
            }
          }
          break;
        case "Line":
          this.$map.setView(layer.getCenter());
          // layer.openPopup();
          break;
        case "Rectangle":
          var bounds = geometry.bounds;
          this.$map.fitBounds(bounds);
          // layer.openPopup();
          break;
        case "Circle":
          this.$map.setView(geometry.latlng);
          // layer.openPopup();
          break;
        case "Polygon":
          this.$map.fitBounds(geometry.bounds);
          // layer.openPopup();
          break;
      }
      layer.fireEvent("click");

      this.$store.commit("setCurrentPoint", layer.layerData);
      this.$store.commit(
        "setAttrFields",
        layer.LayerGroup.layerGroupData.fields.fieldArray
      );
      this.$store.commit("setShowAttr", true);
    },
    /**
     * @desc 判断属性里是否含有要查询的文本
     * @param {Object} properties 属性
     * @param {String} queryString 查询的文本
     * @return {Object}
     */
    isContainQueryString(properties, queryString) {
      if (!properties) {
        return {
          isContain: false,
          props: null
        };
      }
      const props = [];
      for (let key in properties) {
        if (key === "lat" || key === "lng") {
          continue;
        }
        if (
          properties[key] &&
          typeof properties[key] === "string" &&
          properties[key]
            .toLowerCase()
            .includes(queryString.trim().toLowerCase())
        ) {
          props.push(key);
        }
      }
      if (props.length === 0) {
        // 找不到
        return {
          isContain: false,
          props: null
        };
      } else {
        return {
          isContain: true,
          props
        };
      }
    },
    // 选中后回车打开
    handleSelected(e) {
      if (!e.layer) return;
      this.findElement(e);
    }
  },
  watch: {}
};
</script>

<style scoped lang="scss">
.search {
  width: 320px;
  padding: 10px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  .region-autocomplete {
    width: 100px;
    margin-right: 10px;
  }
}
.my-autocomplete {
  width: 320px;
  li: {
    line-height: 1;
    background: #aaa;
  }
}

.address {
  font-size: 12px;
  color: #b4b4b4;
  font-weight: 400;
}
</style>
