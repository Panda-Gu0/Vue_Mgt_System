<template>
  <div>
       <!-- 面包屑导航栏 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-button type="primary" @click=" addRoles">添加角色</el-button>
            </el-row>
            <!-- 角色列表区域 -->
            <el-table :data="rolesList" stripe border >
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row class="row-center" :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'v-center','v-left']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{ item1.authName }}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级权限 -->
                            <el-col :span="19">
                                <!-- 通过 for 循环嵌套渲染二级权限 -->
                                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'v-center']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{ item2.authName }}</el-tag>
                                        <i class="el-icon-caret-right"></i>  
                                    </el-col>
                                    <el-col :span="18">
                                            <el-tag closable @close="removeRightById(scope.row,item3.id)"  type="warning" v-for="item3 in item2.children" :key="item3.id">{{ item3.authName }}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="序号" align="center"></el-table-column>
                <el-table-column prop="roleName" label="角色名称" align="center"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述" align="center"></el-table-column>
                <el-table-column label="操作" align="center" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRole(scope.row.id)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="shouSetRightDialog(scope.row)">分配权限</el-button>
                    </template>    
                </el-table-column> 
            </el-table>
      </el-card>
      <!-- 添加角色对话框   -->
      <el-dialog
        title="添加角色"
        :visible.sync="addRolesDialogVisible"
        width="40%"
        @close="addRolesClosed"
        >
        <!-- 内容主体区域 -->
        <el-form :model="addRolesForm" :rules="addRolesFormRules" ref="addRolesFormRef" label-width="100px">
             <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="addRolesForm.roleName"></el-input>
             </el-form-item>

             <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="addRolesForm.roleDesc"></el-input>
             </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addRolesDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        :close-on-click-modal="false"
        width="40%"
        @close="setRightDialogClosed"
        >
        <!-- 树形控件 -->
        <el-tree :data="rightList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKey" ref="treeRef"></el-tree>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
    name:'Roles',
    data() {
        return {
            // 存储请求角色列表获得的数据
            rolesList: [],
            // 控制添加角色对话框的显示与隐藏
            addRolesDialogVisible: false,
            // 添加角色的表单数据
            addRolesForm: {
                roleName: '',
                roleDesc: '',
            },
            addRolesFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 3, max: 12, message: '角色名称长度应在3~12个字符之间', trigger: 'blur' }
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                    { min: 2, max: 8, message: '角色名称长度应在2~8个字符之间', trigger: 'blur' }
                ]
            },
            // 控制分配权限对话框的展示与关闭
            setRightDialogVisible: false,
            // 所有权限数据
            rightList: [],
            // 树形控件的属性绑定对象
            treeProps: {
                label: 'authName',
                children: 'children'
            },
            // 默认选中节点Id值数组
            defKey: [],
            // 即将分配权限的角色Id
            roleId: ''
        }
    },
    created() {
        // 获取角色列表
        this.getRolesList();
    },
    methods: {
        // 获取角色列表函数 
        async getRolesList() {
            const {data:res} = await this.$http.get('roles');
            if(res.meta.status !== 200) {
                return this.$message.error('获取角色列表失败！');
            }
            this.rolesList = res.data;
        },
        // 添加角色函数
         addRoles() {
             this.addRolesDialogVisible = true;
         },
         // 监听添加角色对话框的关闭事件
         addRolesClosed() {
             this.$refs.addRolesFormRef.resetFields(); // 若对话框关闭则清除输入框信息
         },
         // 发起请求添加角色
         addRole() {
              this.$refs.addRolesFormRef.validate(async valid => {
                  if(!valid) return; // 预校验失败，直接 return
                  const {data: res} = await this.$http.post('roles',this.addRolesForm);
                  if(res.meta.status !== 201) {
                      return this.$message.error('添加角色失败！');
                  }
                  // 添加成功，关闭对话框
                  this.addRolesDialogVisible = false;
                  // 重新获取角色列表
                  this.getRolesList();
                  this.$message.success('添加角色成功！');
              })
         },
         // 删除角色函数
                async removeRole(id) {
            const {data: res} = await this.$http.delete('roles/' + id);
                this.$msgbox.confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                onfirmButtonText: '确定',
                ancelButtonText: '取消',
                closeOnClickModal: false, // 禁止点击空白处关闭
                type: 'warning'
        }).then(() => {
            if(res.meta.status !== 200) {
                return this.$message.error('删除角色失败！');
            }
            // 删除完成重新获取并渲染最新数据
            this.getRolesList();
            this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
                    
        });
        },
        // 根据 Id 删除对应的权限函数
        async removeRightById(role,rightId) {
            // 弹框提示用户是否要删除
            const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
                this.$msgbox.confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                onfirmButtonText: '确定',
                ancelButtonText: '取消',
                closeOnClickModal: false, // 禁止点击空白处关闭
                type: 'warning'
        }).then(() => {
            if(res.meta.status !== 200) {
                return this.$message.error('删除权限失败！');
            }
            // 删除完成重新获取并渲染最新数据
             role.children = res.data; // 直接赋值防止展开列被折回
            this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(err => err );
        },
        // 展示分配权限对话框函数
        async shouSetRightDialog(role) {
            this.roleId = role.id;
            // 发起请求获取所有权限列表
            const {data: res} = await this.$http.get('rights/tree');
            if(res.meta.status !== 200) {
                return this.$message.error('获取角色权限列表失败！');
            }
            this.rightList = res.data;
            // 递归获取三级节点Id
            this.getLeafKeys(role,this.defKey);
            this.setRightDialogVisible = true;
        },
        // 通过递归的形式，获取角色下所有三级权限的 id，并保存到 defKeys 数组中
        getLeafKeys(node,arr) {
            // 如果当前 node 节点不包含 children 属性，则是三级节点
            if(!node.children) {
                return arr.push(node.id);
            }
            // 当前节点不是三级节点，调用递归
            node.children.forEach(item => {
                this.getLeafKeys(item, arr);
            })
        },
        // 每次关闭分配权限对话框，自动清空 defKey 绑定的值
        setRightDialogClosed() {
            this.defKey = [];
        },
        // 点击为角色分配权限
        async allotRights() {
            // 将被选中的节点合成一个数组
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(), // 回目前被选中的节点的 key 所组成的数组
                ...this.$refs.treeRef.getHalfCheckedKeys() // 返回目前半选中的节点的 key 所组成的数组
            ];
            // 用 ，拼接成符合接口要求的请求体参数
            const idStr = keys.join(',');
            // 发起分配权限请求
           const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr});
           if(res.meta.status !== 200) {
               return this.$message.error('更新权限失败！');
           }
           this.$message.success('分配成功！');
           this.getRolesList();
           this.setRightDialogVisible = false;
        }
    }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}
.bdtop {
    border-top: 1px solid #eee;
}
.bdbutton {
    border-bottom: 1px solid #eee;
}
</style>