<template>
  <div>
      <!-- 面包屑导航栏 -->
      <el-breadcrumb>
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 主体区域 -->
      <el-card>
        <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
        <!-- 步骤条 -->
        <el-steps :active="activeIndex - 0" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="商品完成"></el-step>
        </el-steps>
        <el-form :model="addGoodForm" :rules="addGoodFormRules" ref="addGoodFormRef" label-position="top">
        <!-- tabs 标签页 -->
        <el-tabs tab-position="left" :before-leave="beforeTabLeave"  v-model="activeIndex"
        @tab-click="tabClicked"
        >
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
           <el-form-item label="商品名称" prop="goods_name">
             <el-input v-model="addGoodForm.goods_name"></el-input>
           </el-form-item>
           <el-form-item label="商品价格" prop="goods_price">
             <el-input v-model="addGoodForm.goods_price" type="number"></el-input>
           </el-form-item>
           <el-form-item label="商品重量" prop="goods_weight">
             <el-input v-model="addGoodForm.goods_weight" type="number"></el-input>
           </el-form-item>
           <el-form-item label="商品数量" prop="goods_number">
             <el-input v-model="addGoodForm.goods_number" type="number"></el-input>
           </el-form-item>
           <el-form-item label="商品分类" prop="goods_cat">
             <el-cascader
                v-model="addGoodForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                expand-trigger="hover"
                @change="handleChange"
                clearable
                ></el-cascader>
           </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的 Item 项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_checked_vals">
                <el-checkbox border :label="cb" v-for="(cb,i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片上传到后台的 API 地址 -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
            <!-- 图片预览对话框 -->
            <el-dialog
              title="图片预览"
              :visible.sync="imgDialogVisible"
              width="30%"
              :close-on-click-modal="false"
              >
              <img :src="imgUrl" class="previewImg">
            </el-dialog>
          </el-tab-pane>
          <!-- 商品内容 -->
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addGoodForm.goods_introduce">

            </quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
        </el-form>
      </el-card>
  </div>
</template>

<script>
import _ from 'lodash';
export default {
    name: 'Add',
    data() {
      return {
        // 控制步骤条的显示状态
        activeIndex: '0',
        // 添加商品的表单验证对象
        addGoodForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          // 商品所属的分类数组
          goods_cat: [],
          // 图片的数组
          pics: [],
          // 商品的详情描述
          goods_introduce: '',
          attrs: []
        },
        // 添加商品的表单验证规则
        addGoodFormRules: {
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' }
          ],
          goods_price: [
             { required: true, message: '请输入商品价格', trigger: 'blur' }
          ],
          goods_weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' }
          ],
          goods_number: [
            { required: true, message: '请输入商品数量', trigger: 'blur' }
          ],
          goods_cat: [
            { required: true, message: '请选择商品分类', trigger: 'blur' }
          ],
        },
        // 商品列表数据
        cateList: [],
        // 级联选择器的配置对象
        cateProps: {
              value: 'cat_id',
              label: 'cat_name',
              children: 'children'
        },
        // 动态参数列表
        manyTableData: [],
        // 静态属性列表
        onlyTableData: [],
        // 图片上传组件的 headers请求头对象
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        imgDialogVisible: false,
        // 图片预览地址
        imgUrl: ''
      }
    },
    created() {
      this.getCateList();
    },
    methods: {
      // 获取所有商品分类数据
      async getCateList() {
        const {data: res} = await this.$http.get('categories');
        if(res.meta.status !== 200) {
          return this.$message.error('获取商品分类数据失败！');
        }
        this.cateList = res.data;
      },
      // 级联选择器发生变化会触发这个函数
      handleChange() {
        if(this.addGoodForm.goods_cat.length !== 3) {
          this.addGoodForm.goods_cat = [];
        }
      },
      // 切换标签页会触发该函数
      beforeTabLeave(activeName,oldActiveName) {
        if(oldActiveName === '0' && this.addGoodForm.goods_cat.length !== 3) {
           this.$message.error('请先选择商品分类！');
           return false;
        }
      },
      async tabClicked() {
        // 证明访问的是动态参数面板
        if(this.activeIndex === '1') {
          const {data: res} = await this.$http.get(`categories/${this.addGoodForm.goods_cat[2]}/attributes`,{params: {sel: 'many'}});
          if(res.meta.status !== 200) {
            return this.$message.error('获取参数列表失败！');
          }
          res.data.forEach(item => {
            // 将字符串形式的 attr_vals 转换为数组形式便于后续使用 element-ui 的复选框组件
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ');
            // 进行深拷贝解决复选框点击消失问题
            item.attr_checked_vals = [...item.attr_vals];
          }); 
         this.manyTableData = res.data;
        }
        // 证明访问的是静态属性面板
        else if(this.activeIndex === '2') {
          // 发起请求获取静态属性数据
         const {data: res} = await this.$http.get(`categories/${this.addGoodForm.goods_cat[2]}/attributes`,{params: {sel: 'only'}});
         if(res.meta.status !== 200) {
           return this.$message.error('获取静态属性失败！');
         }
         this.onlyTableData = res.data;
        }
      },
      // 处理图片预览效果
      handlePreview(file) {
        console.log(file);
        this.imgDialogVisible = true;
        this.imgUrl = file.response.data.url;
      },
      // 移除图片操作
      handleRemove(file) {
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2.从 pics 数组中，找到这个图片对应的索引值
      const i = this.addGoodForm.pics.findIndex(x => 
        x.pic === filePath
      )
      // 3.调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.addGoodForm.pics.splice(i,1);
      },
      // 监听图片上传成功的事件
      handleSuccess(response) {
        // 根据接口文档拼接得到一个图片信息对象再将图片信息对象 push 到 pics 数组中
        const picInfo = {pic: response.data.tmp_path};
        this.addGoodForm.pics.push(picInfo);
      },
      // 点击添加商品
      add() {
        this.$refs.addGoodFormRef.validate(async valid => {
          if(!valid) {
            return this.$message.error('请填写必要的表单项！');
          }
          // 执行添加的业务逻辑
          // 为了防止前面element-ui执行出错，对addGoodForm进行深拷贝(也可以使用lodash插件)
          const form =  _.cloneDeep(this.addGoodForm);
          form.goods_cat = this.addGoodForm.goods_cat.join(',');
          // 处理动态参数
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            };
            this.addGoodForm.attrs.push(newInfo);
          })
          // 处理静态属性
          this.onlyTableData.forEach(item => {
            const newInfo = { 
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            };
            this.addGoodForm.attrs.push(newInfo);
          })
          form.attrs = this.addGoodForm.attrs;
          // 根据接口文档处理完数据后发起请求添加商品
          const {data:res} = await this.$http.post('goods',form);
          if(res.meta.status !== 201) {
            return this.$message.error('添加商品失败，请检查商品信息是否填写完整！');
          }
          this.$message.success('添加商品成功！');
          // 添加完成跳转到商品列表界面
          this.$router.push('/goods');
        })
      }
    }
}
</script>

<style lang="less" scoped>
 .el-checkbox {
   margin: 0 15px 15px 0 !important;
 }
  .previewImg {
    width: 100%;
  }
  .addBtn {
    margin-top: 15px;
    float: right;
  }
</style>