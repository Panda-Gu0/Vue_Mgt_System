<template>
  <div class="login_container">
      <!-- <video autoplay muted loop disablePictureInPicture src="../assets/video.mp4"></video> -->
      <div class="login_box">
          <!-- 头像区域 -->
          <div class="avatar_box">
          <img src="../assets/avatar.jpg" alt="">
      </div>
      <!-- 登录表单区域 -->
      <el-form :model="loginForm" ref="loginFormRef" :rules="loginFormRules" label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
            <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username" placeholder="账号"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
            <el-input prefix-icon="iconfont icon-3702mima" v-model="loginForm.password" type="password" placeholder="密码"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns"> 
            <el-button type="primary"  @click="login">登录</el-button>
            <el-button type="info"  @click="reset">重置</el-button>
        </el-form-item>
        </el-form>
      </div>
  </div>
</template>

<script>
export default {
    name: 'Login',
    data() {
        return {
            // 登录表单的数据绑定对象
            loginForm: {
                username: 'admin', // 使用 v-model 绑定到相应的用户名和密码文本框中
                password: '123456'
            },
            // 表单验证规则的对象
            loginFormRules: {
                // 验证用户名是否合法
                username: [
                    { required: true, message: '请输入用户账号', trigger: 'blur' },
                    { min: 4, max: 10, message: '用户账号应在 4 到 10 个字符', trigger: 'blur' }
                ],
                // 验证密码是否合法
                password: [
                    { required: true, message: '请输入用户密码', trigger: 'blur' },
                    { min: 6, max: 20, message: '用户账号应在 6 到 20 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        // 重置表单函数
        reset() {
            this.$refs.loginFormRef.resetFields(); // 使用 element-ui 中的 resetFields() 对表单进行重置
        },
        // 登录函数
        login() { 
            // 在登录前需要进行表单预验证，验证输入格式正确才能发起请求
            this.$refs.loginFormRef.validate(async (valid) => { // 可以通过 validate() 中回调函数的参数来判断是否预验证成功
                if(!valid) return;       // 如果 valid 为 false ，证明预验证失败，直接 return
                const {data: res} = await this.$http.post('login',this.loginForm);
                if(res.meta.status !== 200) return this.$message.error('啊哦！请检查账户和密码是否输入正确！' );
               this.$message.success('登录成功！');
               // 登录成功后，将接口传过来的 token 值存储到客户端的 sessionStorage 中
               window.sessionStorage.setItem('token',res.data.token);
               // 存储完 token 后通过编程式导航跳转到后台主页
               this.$router.push('/home');
            })
        }
    }
}
</script>

<style lang="less" scoped>
.login_container {
    // background-color: #438fdbd2;
    height: 100%;
    background-image: linear-gradient(125deg,#4facfe,#a1c4fd,#c2e9fb,#C2FFD8);  background-size: 400%;
	  animation: bganimation 15s infinite;
    @keyframes bganimation {
	  0%{
	    background-position: 0% 50%;
	  }
	  50%{
	    background-position: 100% 50%;
	  }
	  100%{
	    background-position: 0% 50%;
	  }
    }
    .login_box {
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 20px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        .avatar_box {
            width: 130px;
            height: 130px;
            border: 1px solid #eee;
            border-radius: 50%;
            padding: 5px;
            box-shadow: 0 0 10px #ddd;
            position: absolute;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #fff;
            img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #eee;
            }
        }
    }
    .login_form {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 10px;
        box-sizing: border-box; // 1防止表单超出框外
    }
    .btns {
        display: flex;
        justify-content: center;
        .el-button {
            justify-content: space-around;
            margin: 0 20px;
        }
    }
}
</style>