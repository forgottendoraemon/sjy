<template>
  <div v-if="navTargetName" class="nva-body">
    <van-row type="flex" justify="center">
      <van-col span="16">
        <!-- 目标描述 -->
        <h5>{{navTargetName}}</h5>
        <!-- 距离 -->
        <p>{{pathDistance}}</p>
      </van-col>
      <van-col span="8">
        <van-button
          round
          size="small"
          v-if="!navTargetLatlng"
          icon="exchange"
          type="info"
          @click="startNav"
        >导航到此</van-button>
        <van-button
          round
          size="small"
          v-if="navTargetLatlng"
          icon="close"
          type="info"
          @click="stopRouting"
        >停止导航</van-button>
      </van-col>
    </van-row>
  </div>
</template>
<script>
import { mapState } from "vuex";
import roadall3857 from "../../assets/raod/roadall3857.json";
import roadall4326 from "../../assets/raod/roadall4326.json";
import roadallgraph from "../../assets/raod/roadallgraph.json";
import Routing from "../../assets/js/Routing";
import { getDistance } from "../../utils/distance";

function initRouting() {
  if (!Routing.inited) {
    Routing.init(roadallgraph, roadall4326, roadall3857);
    Routing.inited = true;
  }
}

const endmarkerLayerId = "navEndMarker";
const routingPolylinesLayerId = "routingPolyline";

export default {
  data() {
    return {
      pathDistance: ""
    };
  },
  methods: {
    startNav() {
      this.$store.commit("setIsRouting", true);
    },
    /**
     * 启动到指定目标点的导航
     */
    startRouting: async function(targetLatlng) {
      try {
        // 定位当前位置
        let currentLatlng = [
          this.userlocation.coords.longitude,
          this.userlocation.coords.latitude
        ];

        //距离过近不启动导航
        if (getDistance(currentLatlng, targetLatlng) < 200) {
          throw `距离过近`;
        }
        // 启动导航
        initRouting();

        // 在地图上显示终点位置图标
        this.$map.addLayer({
          id: endmarkerLayerId,
          source: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: targetLatlng
                  },
                  properties: {}
                }
              ]
            }
          },
          type: "circle",
          paint: {
            "circle-color": "#0f0",
            "circle-radius": 6.5
          },
          layout: {}
        });

        // 在地图上添加路径图层
        this.$map.addLayer({
          id: routingPolylinesLayerId,
          source: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: []
            }
          },
          type: "line",
          paint: {
            "line-color": "#00f",
            "line-width": 5
          },
          layout: { "line-cap": "round", "line-join": "round" }
        });

        // 地图缩放显示当前位置与目标位置
        this.$map.fitBounds([currentLatlng,targetLatlng]);

        this.updateRouting(currentLatlng, targetLatlng);
      } catch (error) {
        console.log(error);
        this.$notify({
          type: "warning",
          message: error
        });
        this.stopRouting();
      }
    },
    /**
     * 退出导航模式
     */
    stopRouting: function() {
      this.$map.removeLayer(endmarkerLayerId);
      this.$map.removeLayer(routingPolylinesLayerId);
      this.$store.commit("setNavTargetLatlng", null);
      this.$store.commit("setIsRouting", false);
    },
    /**
     * 更新导航路线
     */
    updateRouting: function(currentLatlng, targetLatlng) {
      // 计算路径
      var routing_result = Routing.findRouting(
        { lng: currentLatlng[0], lat: currentLatlng[1] },
        { lng: targetLatlng[0], lat: targetLatlng[1] }
      );
      // 更新线路数据
      const rpsrc = this.$map.getSource(routingPolylinesLayerId);
      const geojsonData = {
        type: "FeatureCollection",
        features: routing_result.path.map(ps => {
          return {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: ps.map(p => [p.lng, p.lat])
            }
          };
        })
      };
      rpsrc.setData(geojsonData);

      this.pathDistance = (routing_result.distance / 1000).toFixed(1) + "公里";

      // 地图跟随
      this.$map.flyTo({
        center: [
          this.userlocation.coords.longitude,
          this.userlocation.coords.latitude
        ]
      });
    }
  },
  components: {},
  computed: {
    ...mapState({
      userlocation: state => state.userlocation,
      navTargetLatlng: state => state.navTargetLatlng,
      navTargetName: state => state.navTargetName,
      isRouting: state => state.isRouting
    })
  },
  mounted() {},
  watch: {
    isRouting(isRouting) {
      isRouting && this.startRouting(this.navTargetLatlng);
    }
  }
};
</script>
<style lang="less" scoped>
.nva-body {
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #eee;
  left: 2px;
  right: 2px;
  position: absolute;
  bottom: 3px;
  background-color: #fff;

  p,
  h5 {
    margin: 0;
  }

  button {
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
  }
}
</style>