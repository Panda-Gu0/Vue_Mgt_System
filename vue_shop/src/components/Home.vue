<template>
  <el-container class="home-container">
      <!-- 头部区域 -->
  <el-header>
      <div>
          <img src="../assets/logo.png">
          <span style="letter-spacing: 3px;">Management System</span>
      </div>
      <el-button @click="logout">退出登录</el-button>
      </el-header>
    <!-- 页面主题区域 -->
  <el-container>
      <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '180px'">
      <!-- 菜单折叠按钮 -->
      <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边菜单栏 -->
        <el-menu background-color="#2e2e2e" text-color="#fff" active-text-color="#359bf4" :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
            <!-- 一级菜单 -->
      <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
          <!-- 一级菜单模板区域 -->
        <template slot="title">
            <!-- 图标 -->
          <i :class="iconObj[item.id]"></i>
            <!-- 文本 -->
          <span>{{ item.authName }}</span>
        </template>
            <!-- 二级菜单 -->
          <el-menu-item :index=" '/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <template slot="title">
            <!-- 图标 -->
          <i class="el-icon-menu"></i>
            <!-- 文本 -->
          <span>{{ subItem.authName }}</span>
        </template>
          </el-menu-item>
      </el-submenu>
    </el-menu>
    </el-aside>
    <!-- 右侧主题内容 -->
    <el-main>
      <!-- 路由占位符 -->
      <router-view></router-view>
    </el-main>
  </el-container>
</el-container>
</template>

<script>
export default {
    name: 'Home',
    data() {
        return {
            menuList: [], //存储请求回来的左侧菜单数据
            iconObj: { // 把相应的小图标渲染到 v-for 渲染形成的菜单中
                '125': 'el-icon-user-solid',
                '103': 'el-icon-s-help',
                '101': 'el-icon-s-goods',
                '102': 'el-icon-s-order',
                '145': 'el-icon-s-marketing'
            },
            // 是否展开或折叠菜单栏
            isCollapse: false,
            // 被激活的链接地址
            activePath: ''
        }
    },
    created() {
        this.getMenuList();
        this.activePath = window.sessionStorage.getItem('activePath'); // 获取菜单激活状态
    },
    methods: {
        // 注销登录函数
        logout() {
            this.$msgbox.confirm('您将退出当前登录用户，是否继续？','操作提示',{ // 是否确定退出当前用户
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false, // 禁止点击空白处关闭
          type: 'warning'
        }).then(() => { // 退出当前用户
            window.sessionStorage.clear(); // 清除当前 token
            this.$router.push('/login'); // 跳转回登录界面
          this.$message({
            type: 'success',
            message: '已退出当前登录用户!'
          });
        }).catch(() => {});
        },
        // 获取所有菜单函数
        async getMenuList() {
             const {data: res} = await this.$http.get('menus');
            if(res.meta.status !== 200) return this.$message.error(res.meta.msg); // 请求失败时返回错误信息
            // 请求成功，将数据赋值给 data 节点中的 menuList
            this.menuList = res.data;
        },
        // 菜单折叠与展开函数
        toggleCollapse() {
          this.isCollapse = !this.isCollapse;
        },
        // 保存链接激活状态函数
        saveNavState(activePath) {
          window.sessionStorage.setItem('activePath',activePath); // 存储到本地
        }
    }
}
</script>

<style lang="less" scoped>
    .home-container {
        height: 100%;
    }
    .el-header {
        background-color: #2e2e2e;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #fff;
        > div {
            display: flex;
            align-items: center;
            img {
            width: 40px;
        }
        span {
            font-size: 20px;
            margin-left: 20px;
            letter-spacing: 5px;
        }
        }
    }
    .el-aside {
        background-color: #2e2e2e;
        transition: all .5s;
        position: relative;
        .el-menu {
            border-right: none; // 去除边框让菜单栏对齐
        }
    }
    .el-main {
        background-color: #e9eef3;
    }
    .toggle-button {
      font-size: 14px;
      line-height: 24px;
      text-align: center;
      color: #fff;
      letter-spacing: 6px;
      cursor: pointer;
    }
</style>