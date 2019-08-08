<template>
  <div class="container">
    <div class="aside">
      <nav class="link-list">
        <ul>
          <li class="link-item active">
            <a>用户管理</a>
          </li>
        </ul>
      </nav>
    </div>
    <div class="main">
      <keep-alive>
        <router-view/>
      </keep-alive>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
}
</script>
<style lang="scss" scoped>
@import "@/assets/scss/color.scss";
.container {
  --aside-width: 200px;
  position: relative;
  width: 100%;
  height: 100%;
  background: #f1f1f1;
  overflow: hidden;

  .aside {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--aside-width);
    height: 100%;
    background: #36343f;
    .link-list {
      margin-top: 10px;
      .link-item {
        height: 50px;
        line-height: 50px;
        text-align: center;
        transition: 0.3s;
        border-bottom: 1px solid rgba(80, 80, 80, 0.3);
        &.active {
          background: $pink !important;
        }
        &:hover {
          cursor: pointer;
          background: #684f58;
        }
        a {
          color: #fff;
        }
      }
    }
  }
  .main {
    position: relative;
    left: var(--aside-width);
    height: 100%;
    width: calc(100% - 200px);
  }

  ul{
    padding: 0;
  }
}
</style>
