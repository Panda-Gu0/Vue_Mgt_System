<template>
  <div>
      <!-- 面包屑导航栏 -->
      <el-breadcrumb>
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card>
         <el-alert
            title="注意：只允许为第三级分类设置相关参数"
            type="warning"
            show-icon
            :closable="false"
            >
         </el-alert>
         <!-- 选择商品分类区域 -->
         <el-row class="cat_pot">
             <el-col>
                 <span>选择商品分类：</span>
                 <!-- 选择商品分类的级联选择框 -->
                  <el-cascader
                    v-model="selectedCateKeys"
                    :options="cateList"
                    :props="cateProps"
                    @change="handleChange"
                    expand-trigger="hover"
                    clearable
                    change-on-select
                    ></el-cascader>
             </el-col>
         </el-row>
         <!-- tab 页签区域 -->
           <el-tabs v-model="activeName" @tab-click="handleTabClick">
               <!-- 添加动态参数面板 -->
            <el-tab-pane label="动态参数" name="many">
                <!-- 添加参数按钮 -->
                <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddDialog">添加参数</el-button>
                <el-table :data="manyTableData" border stripe>
                        <!-- 展开行 -->
                   <el-table-column type="expand" align="center">
                        <template slot-scope="scope">
                            <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{ item }}</el-tag>
                            <!-- 输入的文本框 -->
                    <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <!-- 添加的按钮 -->
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="序号" align="center"></el-table-column>
                    <el-table-column label="参数名称" prop="attr_name" align="center"></el-table-column>
                    <el-table-column label="操作" align="center">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="paramsDelete(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
                <!-- 添加静态属性面板 -->
            <el-tab-pane label="静态属性" name="only" >
                <!-- 添加属性按钮 -->
                <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddDialog">添加属性</el-button>
                 <el-table :data="onlyTableData" border stripe>
                     <!-- 展开行 -->
                    <el-table-column type="expand" align="center">
                        <template slot-scope="scope">
                    <!-- 循环渲染 tag 标签 -->
                    <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{ item }}</el-tag>
                    <!-- 输入的文本框 -->
                    <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <!-- 添加的按钮 -->
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="序号" align="center"></el-table-column>
                    <el-table-column label="属性名称" prop="attr_name" align="center"></el-table-column>
                    <el-table-column label="操作" align="center">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="paramsDelete(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
           </el-tabs>
      </el-card>
      <!-- 添加参数对话框 -->
      <el-dialog
        :title="'添加' + (activeName === 'many' ? '动态参数' : '静态属性')"
        :visible.sync="adddialogVisible"
        width="50%"
        @closed="addDialogClosed"
        :close-on-click-modal="false"
        >
        <!-- 表单文本框 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item :label="(activeName === 'many' ? '参数名称' : '属性名称')" prop="attr_name">
              <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="adddialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
</el-dialog>

    <!-- 修改参数对话框 -->
     <el-dialog
        :title="'修改' + (activeName === 'many' ? '动态参数' : '静态属性')"
        :visible.sync="editdialogVisible"
        width="50%"
        @closed="editDialogClosed"
        :close-on-click-modal="false"
        >
        <!-- 表单文本框 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item :label="(activeName === 'many' ? '参数名称' : '属性名称')" prop="attr_name">
              <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editdialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
</el-dialog>
  </div>
</template>

<script>
export default {
    name: 'Params',
    data() {
        return {
            // 商品分类列表
            cateList: [],
            // 级联选择框的配置对象
            cateProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 级联选择框双向绑定的数组
            selectedCateKeys: [],
            // 被激活的页签名称
            activeName: 'many',
            // 动态参数的数据
            manyTableData: [],
            // 静态属性的数据
            onlyTableData: [],
            // 控制参数对话框的显示与隐藏
            adddialogVisible: false,
            // 添加表单的数据对象
            addForm: {
                attr_name: ''
            },
            // 表单验证规则
            addFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },
            // 控制修改对话框的显示与隐藏
            editdialogVisible: false,
            // 修改表单的数据对象
            editForm: {
                attr_name: ''
            },
            // 修改表单的验证规则
            editFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },
        }
    },
    computed: {
        // 如果按钮需要被禁用，则返回 true，否则返回 false
        isBtnDisabled() {
            if(this.selectedCateKeys.length !== 3) {
                return true;
            } else {
                return false;
            }
        },
        // 当前选中三级分类的 Id
        cateId() {
            if(this.selectedCateKeys.length === 3) {
                return this.selectedCateKeys[2];
            }
            return null;
        }
    },
    created() {
        this.getCateList();
    },
    methods: {
        // 获取商品分类列表
        async getCateList() {
            const {data: res} = await this.$http.get('categories');
            if(res.meta.status !== 200) {
                return this.$message.error('获取商品分类列表失败！');
            }
            this.cateList = res.data;
        },
        // 级联选择框选择项发生变化会打印这个函数
        async handleChange() {
            this.getParamsData();
        },
        // 被激活的页签点击事件的处理函数
    handleTabClick() {
        this.getParamsData();
    },
        // 获取参数的列表数据
        async getParamsData() {
            // 如果级联选择器选中的不是三级分类，则将当前选择清空并 return
            if(this.selectedCateKeys.length !== 3) {
                this.selectedCateKeys = [];
                this.manyTableData = [];
                this.onlyTableData = [];
                return;
            }
            // 根据所选分类的 Id，和当前所处的面板，获取对应的参数
            const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params: {sel: this.activeName}});
            if(res.meta.status !== 200) {
                return this.$message.error('获取参数列表失败！');
            }
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
                // 为了让每行数据的添加标签文本框不重复，给每个item写出属于自己的控制参数
                // 控制文本框的显示与隐藏
                item.inputVisible = false;
                // 文本框输入的值
                item.inputValue = '';
            })
            if(this.activeName === 'many') {
                this.manyTableData = res.data;
            } else {
                this.onlyTableData = res.data;
            }
        },
        // 显示添加参数对话框
        showAddDialog() {
            this.adddialogVisible = true;
        },
        // 监听添加参数对话框的关闭
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        // 点击按钮，添加参数
        addParams() {
            // 先进行表单预验证
            this.$refs.addFormRef.validate(async valid => {
               if(!valid) return;
                const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName });
               if(res.meta.status !== 201) {
                return this.$message.error('添加参数失败！');
            }
            this.$message.success('添加参数成功！');
            this.adddialogVisible = false;
            this.getParamsData();
            })
        },
        // 点击按钮，展示修改对话框
        async showEditDialog(attr_id) {
            this.editId = attr_id;
            // 查询当前参数信息
            const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{params: {attr_sel: this.activeName}});
            if(res.meta.status !== 200) {
                return this.$message.error('获取参数名称失败！');
            }
            this.editForm = res.data;
            this.editdialogVisible = true;
        },
        // 重置修改的表单
        editDialogClosed() {
            this.$refs.editFormRef.resetFields();
        },
        // 点击按钮修改参数信息
        editParams() {
        this.$refs.editFormRef.validate(async valid => {
            if(!valid) return;
            const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{attr_name: this.editForm.attr_name, attr_sel: this.activeName});
            if(res.meta.status !== 200) {
                return this.$message.error('修改参数失败！');
            }
            this.$message.success('修改参数成功！');
            this.getParamsData();
            this.editdialogVisible = false;
        })
        },
        // 删除参数
        async paramsDelete(attr_id) {
            const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`);
                this.$msgbox.confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                onfirmButtonText: '确定',
                ancelButtonText: '取消',
                closeOnClickModal: false, // 禁止点击空白处关闭
                type: 'warning'
        }).then(() => {
            if(res.meta.status !== 200) {
                return this.$message.error('删除参数失败！');
            }
            // 删除完成重新获取并渲染最新数据
            this.getParamsData();
            this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
                    
        });
        },
        // 文本框失去焦点或按下 enter 键都会触发
        async handleInputConfirm(row) {
            // 输入非法内容，直接 return 终止
            if(row.inputValue.trim().length === 0) {
                row.inputValue = '';
                row.inputVisible = false;
                return;
            }
            // 输入正确内容，继续执行后续操作
            row.attr_vals.push(row.inputValue.trim());
            row.inputValue = '';
            row.inputVisible = false;
            // 发起网络请求保存本次操作
            this.saveAttrVals(row);
        },
        // 将 attr_vals 的操作保存到数据库中
        async saveAttrVals(row) {
            const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, 
            {attr_name: row.attr_name, 
             attr_sel: row.attr_sel,
             attr_vals: row.attr_vals.join(' ')});
             if(res.meta.status !== 200) {
                 return this.$message.error('修改参数项失败！');
             }
             this.$message.success('修改参数项成功！');
        },
        // 点击按钮展示文本输入框
        showInput(row) {
            row.inputVisible = true;
            // 让文本框自动获得焦点
            // $nexTick 方法作用：当页面上元素被重新渲染之后，才会指定回调函数中的代码
          this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
        },
        // 点击删除对应参数的可选项
        async handleClose(i,row) {
            row.attr_vals.splice(i, 1);
            this.saveAttrVals(row);
        }
        
    }
}
</script>

<style lang="less" scoped>
    .cat_pot {
        margin: 25px 10px;
    }
    .input-new-tag {
        width: 120px;
    }
</style>