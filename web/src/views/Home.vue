<template>
  <el-carousel 
    trigger="click" 
    :height="bannerHeight + 'px'"
    >
    <el-carousel-item>
      <img src="../assets/images/cjbanner.jpg" />
    </el-carousel-item>
    <el-carousel-item>
      <img src="../assets/images/cjbanner5.jpg" />
    </el-carousel-item>
    <el-carousel-item>
      <img src="../assets/images/hybanner5.jpg" />
    </el-carousel-item>
  </el-carousel>
</template>

<script>
export default {
  name: "home",
  components: {},
  data:()=>{
    return {
      bannerHeight:500
    }
  },
  methods: {
    setSize: function() {
      this.bannerHeight = (970 / 1920) * window.innerWidth;
      if (this.bannerHeight > 740) this.bannerHeight = 740;
      if (this.bannerHeight < 360) this.bannerHeight = 360;
    }
  },
  mounted() {
    this.setSize();
    const that = this;
    window.addEventListener(
      "resize",
      function() {
        that.setSize();
      },
      false
    );
  }
};
</script>

<style scoped>
img {
  width: 100%;
}
</style>

