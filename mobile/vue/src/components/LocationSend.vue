<template>
  <div></div>
</template>
<script>
import { mapState } from "vuex";
import Vue from "vue";
import uuid from "../utils/uuid";
/**
 * 最小触发时间间隔（秒）
 */
const minTriggerSecond = 60;

let locations = [];

let lastTriggerTime = 0;

let sending = false;

export default {
  computed: {
    ...mapState({
      userlocation: state => state.userlocation,
      userinfo: state => state.userinfo
    })
  },
  methods: {
    addLocation(location) {
      if (new Date().getTime() - lastTriggerTime > minTriggerSecond * 1000) {
        locations.push(location);
        lastTriggerTime = new Date().getTime();
        this.saveLocations();
        return true;
      }
    },
    sendLocations() {
      if (!sending) {
        const count = locations.length;
        Vue.axios
          .post(`/api/locations`, { uid: this.getUid(), locations })
          .then(() => {
            locations.splice(0, count);
            this.saveLocations();
            sending = false;
          })
          .catch(() => {
            sending = false;
          });
      }
    },
    saveLocations() {
      localStorage.setItem("locations", JSON.stringify(locations));
    },
    getUid() {
      if (this.userinfo) {
        return "";
      } else {
        let uid = localStorage.getItem("uid");
        if (!uid) {
          uid = uuid();
          localStorage.setItem("uid", uid);
        }
        return uid;
      }
    }
  },
  watch: {
    userlocation(p) {
      const ok = this.addLocation({
        time: p.timestamp,
        coordinates: [p.coords.longitude, p.coords.latitude]
      });
      ok && this.sendLocations();
    }
  },
  mounted() {
    const locationsJson = localStorage.getItem("locations");
    if (locationsJson) {
      locations = JSON.parse(locationsJson);
      if (locations.length) {
        this.sendLocations();
      }
    }
  }
};
</script>
