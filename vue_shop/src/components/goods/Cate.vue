<template>
  <div>
      <!-- 面包屑导航栏 -->
      <el-breadcrumb>
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card>
        <el-row>
            <el-col>
                <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
            </el-col>
        </el-row>
        <!-- 表格区域 -->
        <tree-table 
        :data="cateList"
        :columns="columns" 
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        :show-row-hover="false"
        class="treeTable"
        >
        <!-- 是否有效区域 -->
        <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
            <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序区域 -->
        <template slot="order" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作区域 -->
        <template slot="opt" slot-scope="scope">
            <div class="buttonStyle">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showcateEdit(scope.row.cat_id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
            </div>
        </template>
        </tree-table>
        <!-- 分页区域 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="querInfo.pagenum"
          :page-sizes="[3, 5, 10, 15]"
          :page-size="querInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        :close-on-click-modal="false"
        @close="addCateDialogClosed"
        >
        <!-- 添加分类的表单 -->
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px" >
            <el-form-item label="分类名称：" prop="cat_name">
              <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类：">
                <!-- option 用来指定数据源 -->
                <!-- props 用来指定配置对象 -->
              <el-cascader
                v-model="selectedKeys"
                :options="parentCateList"
                :props="cascaderProps"
                @change="parentCateChanged"
                expand-trigger="hover"
                clearable
                change-on-select
                ></el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改分类对话框 -->
      <el-dialog
        title="修改分类"
        :visible.sync="cateEditDialogVisible"
        :close-on-click-modal="false"
        width="50%"
        >
        <!-- 修改分类表单 -->
        <el-form 
        :model="cateEditForm" 
        :rules="cateEditFormRules"       
        ref="cateEditFormRef" 
        label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="cateEditForm.cat_name"></el-input>
        </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="cateEditDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="cateEdit">确 定</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script>
export default {
    name: 'Cate',
    data() {
        return {
            // 商品分类的数据列表，默认为空
            cateList: [],
            // 请求商品分类数据查询条件(调用接口条件)
            querInfo: {
                // 获取三级列表
                type: 3,
                // 页码值
                pagenum: 1,
                // 每页显示多少条数据
                pagesize: 5
            },
            // 商品总条数
            total: 0,
            // 为 table 指定列的定义
            columns: [{
                label: '分类名称',
                prop: 'cat_name'
            },
            {
                label: '是否有效', 
                // 表示将当前列定义为模板列
                type: 'template',
                // 表示当前这一列使用模板名称
                template: 'isok'
            },
             {
                label: '排序', 
                // 表示将当前列定义为模板列
                type: 'template',
                // 表示当前这一列使用模板名称
                template: 'order'
            },
            {
                label: '操作', 
                // 表示将当前列定义为模板列
                type: 'template',
                // 表示当前这一列使用模板名称
                template: 'opt'
            }
            ],
            // 控制添加分类对话框的显示和隐藏
            addCateDialogVisible: false,
            // 添加分类的表单数据对象
            addCateForm: {
                // 将要添加的分类的名称
                cat_name: '',
                // 父级分类的 Id
                cat_pid: 0,
                // 分类的等级，默认要添加的是1级分类
                cat_level: 0
            },
            // 添加分类的表单验证规则
            addCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入需要添加的分类', trigger: 'blur' }
                ]
            },
            // 保存请求接口传过来的父级分类的列表
            parentCateList: [],
            // 指定级联选择器的配置对象
            cascaderProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 选中的父级分类的 Id 数组
            selectedKeys: [],
            // 控制修改分类对话框的显示与隐藏
            cateEditDialogVisible: false,
            // 修改分类的表单数据对象
            cateEditForm: {
                
            },
            // 修改分类的表单验证规则
            cateEditFormRules: {
                cat_name: [
                    { required: true, message: '请输入新的分类名！', trigger: 'blur' },
                ]
            }
        }
    },
    created() {
        // 获取商品数据列表
        this.getCateList();
    },
    methods: {
        // 获取商品分类数据函数
        async getCateList() {
            const {data: res} = await this.$http.get('categories',{ params: this.querInfo });
            if(res.meta.status !== 200) {
                return this.$message.error('获取商品数据列表失败！');
            }
            this.cateList = res.data.result;
            // 为总条数赋值
            this.total = res.data.total;
        },
        // 监听 pagesize 改变
        handleSizeChange(newSize) {
            this.querInfo.pagesize = newSize;
            this.getCateList();
        },
        // 监听 pagenum 改变
        handleCurrentChange(newPage) {
            this.querInfo.pagenum = newPage;
            this.getCateList();
        },
        // 显示添加分类对话框
        showAddCateDialog() {
            // 先获取父级分类的数据列表
            this. getParentCateList();
            // 再展示对话框
            this.addCateDialogVisible = true;
        },
        // 获取父级分类的数据列表
        async getParentCateList() {
            const {data: res} = await this.$http.get('categories',{ params: { type: 2 } });
            if(res.meta.status !== 200) {
                return this.$message.error('获取父级分类数据失败！');
            }
            this.parentCateList = res.data;
        },
        // 添加分类选择项发生变化时触发这个函数
        parentCateChanged() {
            console.log(this.selectedKeys);
            // 如果 selectedKeys 数组中的 length 大于0，则证明选中的父级分类，反之，则说明没选中任何父级分类
            if(this.selectedKeys.length > 0) {
                // 父级分类的 Id
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length -1];
                // 为当前分类的等级赋值
                this.addCateForm.cat_level = this.selectedKeys.length;
                return
            } else {
                this.addCateForm.cat_pid = 0;
                this.addCateForm.cat_level = 0;
            }
        },
        // 监听对话框的关闭事件，重置表单数据
        addCateDialogClosed() {
            this.$refs.addCateFormRef.resetFields();
            this.selectedKeys = [];
            this.cateList.cat_pid = 0;
            this.cateList.cat_level = 0;
        },
        // 点击确定。添加分类
        addCate() {
            this.$refs.addCateFormRef.validate(async valid => {
                if(!valid) return;
                const {data: res} = await this.$http.post('categories',this.addCateForm);
                if(res.meta.status !== 201) {
                    return this.$message.error('添加分类失败！');
                }
                this.$message.success('添加分类成功！');
                this.getCateList();
                this.addCateDialogVisible = false;
            })
        },
        // 显示修改分类对话框函数
        async showcateEdit(id) {
            const {data: res} = await this.$http.get('categories/'+ id);
            if(res.meta.status !== 200) {
                return this.$message.error('获取分类名失败！');
            }
            this.cateEditForm = res.data;
            this.cateEditDialogVisible = true;
        },
        // 确定修改分类名
        cateEdit() {
            this.$refs.cateEditFormRef.validate( async valid => {
                if(!valid) return;
                const {data: res} = await this.$http.put('categories/' +this.cateEditForm.cat_id,{ cat_name: this.cateEditForm.cat_name });
                if(res.meta.status !== 200) {
                    return this.$message.error('修改分类名失败！');
                }
                this.cateEditDialogVisible = false;
                this.getCateList();
                this.$message.success('修改分类名成功！');
            })
        },
         // 删除分类信息函数
       async removeCate(id) {
            const {data: res} = await this.$http.delete('categories/' + id);
                this.$msgbox.confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                onfirmButtonText: '确定',
                ancelButtonText: '取消',
                closeOnClickModal: false, // 禁止点击空白处关闭
                type: 'warning'
        }).then(() => {
            if(res.meta.status !== 200) {
                return this.$message.error('删除分类失败！');
            }
            // 删除完成重新获取并渲染最新数据
            this.getCateList();
            this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
                    
        });
    },
    }
}
</script>

<style lang="less" scoped>
    .treeTable {
        margin-top: 25px;
    }
</style>