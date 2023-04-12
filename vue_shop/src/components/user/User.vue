<template>
  <div>
      <!-- 面包屑导航栏 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视区 -->
      <el-card>
            <!-- 搜索和添加区域 --> 
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList" @keyup.enter.native="getUserList">
                    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表区域 -->
            <el-table :data="userList" border stripe>
                <el-table-column type="index" label="序号" align="center"></el-table-column>
                <el-table-column prop="username" label="姓名" align="center"></el-table-column>
                <el-table-column prop="email" label="邮箱" align="center"></el-table-column>
                <el-table-column prop="mobile" label="电话" align="center"></el-table-column>
                <el-table-column prop="role_name" label="角色" align="center"></el-table-column>
                <el-table-column label="状态" align="center">
                    <template slot slot-scope="scope">
                        <!-- 使用插槽及 switch 按钮渲染状态 -->
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="180px">
                    <template slot slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUser(scope.row.id)"></el-button>
                        <!-- 分配角色按钮 -->
                         <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                             <el-button type="warning" icon="el-icon-setting" size="mini"  @click="setRole(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange"
                           @current-change="handleCurrentChange"
                           :current-page="queryInfo.pagenum"
                           :page-sizes="[1, 2, 5, 10]"
                           :page-size="queryInfo.pagesize"
                           layout="total, sizes, prev, pager, next, jumper"
                           :total="total">
    </el-pagination>
      </el-card>
      <!-- 添加用户对话框 -->
            <el-dialog
                title="添加用户"
                :visible.sync="addDialogVisible" 
                width="40%"
                @close="addDialogClosed"
                :close-on-click-modal="false"
                >
                <!-- 内容主体区域 -->
                <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                    <el-form-item label="用户名" prop="username">
                    <el-input v-model.trim="addForm.username"></el-input>
                    </el-form-item>

                    <el-form-item label="密码" prop="password">
                    <el-input v-model.trim="addForm.password"></el-input>
                    </el-form-item>

                    <el-form-item label="邮箱" prop="email">
                    <el-input v-model.trim="addForm.email"></el-input>
                    </el-form-item>

                    <el-form-item label="手机" prop="mobile">
                    <el-input v-model.trim="addForm.mobile"></el-input>
                    </el-form-item>
                </el-form>
                <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 修改用户对话框 -->
            <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            :close-on-click-modal="false" 
            @close="editDialogClosed"
            >
                <!-- 内容主题区域 -->
                <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                    <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled ></el-input>
                    </el-form-item>

                    <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                    </el-form-item>

                    <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                    </el-form-item>
                </el-form>
                <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 分配角色的对话框 -->
            <el-dialog
                title="分配角色"
                :visible.sync="setRoleDialogVisible"
                width="50%"
                :close-on-click-modal="false" 
                @close="setRoleDialogClosed"
                >
                <div>
                    <p>当前用户：{{ userInfo.username }}</p>
                    <p>当前角色：{{ userInfo.role_name }}</p>
                    <p>分配新角色：
                        <el-select v-model="selectRoleId" placeholder="请选择角色">
                            <el-option
                              v-for="item in rolesList"
                              :key="item.id"
                              :label="item.roleName"
                              :value="item.id">
                            </el-option>
                        </el-select>
                    </p>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
                </span>
            </el-dialog>
  </div>
</template>

<script>
export default {
    name: 'User',
    data() {
            // 验证邮箱规则
            var checkEmail = (rule,value,cb) => {
                // 验证邮箱的正则表达式
                const regEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if(regEmail.test(value)) { // test 方法用于检测一个字符串是否匹配某个模式
                    // 合法邮箱
                    return cb();
                }
                cb(new Error('请输入合法邮箱'));
            }
            // 验证手机号规则
            var checkMobile = (rule,value,cb) => {
                // 验证手机号的正则表达式
                const regMobile = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[189]))\d{8}$/;
                if(regMobile.test(value)) {
                    // 合法手机号
                    return cb();
                }
                cb(new Error('请输入合法手机号'));
            }
        return {
            // 获取用户列表参数对象
            queryInfo: {
                query: '',
                // 当前页数
                pagenum: 1,
                // 当前每页显示多少条数据
                pagesize: 2
            },
            userList: [],
            total: 0,
            // 控制添加用户对话框的弹出与隐藏
            addDialogVisible: false,
            // 添加用户的表单数据
            addForm: { 
                username: '',
                password: '',
                email: '',
                mobile: ''
             },
            // 添加表单的验证规则对象
            addFormRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 12, message: '用户名长度应在3~12个字符之间', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 20, message: '密码长度应在6~20个字符之间', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' } // 自定义校验规则
                ],
                mobile: [
                    { required: true, message: '请输入手机号码', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' } // 自定义校验规则
                ]
             },
            // 控制修改用户对话框的显示与隐藏
            editDialogVisible: false,
            // 查询到用户信息的对象
            editForm: { },
            // 修改用户信息验证规则对象
            editFormRules: { 
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' } // 自定义校验规则
                ],
                mobile: [
                    { required: true, message: '请输入手机号码', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' } // 自定义校验规则
                ]
            },
            // 控制分配角色对话框的显示与隐藏
            setRoleDialogVisible: false,
            // 需要被分配角色的用户信息对象
            userInfo: {

            },
            // 所有角色的数据列表
            rolesList: [],
            // 已选中的角色Id值
            selectRoleId: ''
        }
    },
    created() {
        this.getUserList();
    },
    methods: {
        async getUserList() {
            const { data: res } = await this.$http.get('/users', { params: this.queryInfo });
            if(res.meta.status !== 200) return this.$message.error('获取用户列表失败！');
            this.userList = res.data.users;
            this.total = res.data.total;
        },
        // 监听 pagesize 改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getUserList(); // 每页信息条数发生改变后，重新发起请求渲染数据
        },
        // 监听页码值改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage;
            this.getUserList(); // 页码值改变后，重新发起请求渲染数据
        },
        // 监听 switch 开关状态的改变
        async userStateChanged(userinfo) {
            const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`);
            if(res.meta.status !== 200) {
                userinfo.mg_state = !userinfo.mg_state // 请求失败，重置修改
                return this.$message.error('更新用户状态失败！');
            }
           // 请求成功，更新用户状态
           if(userinfo.mg_state) {
               this.$message.success('已激活该用户权限！');
           } else {
               this.$message.info('已禁用该用户权限！');
           }
        },
        // 监听添加用户框的关闭事件
        addDialogClosed() {
             this.$refs.addFormRef.resetFields();
        },
        addUser() {
            // 添加用户前先进行预校验
            this.$refs.addFormRef.validate(async valid => {
                if(!valid) return; // 如果预校验不通过，直接return
                // 预校验通过，发起网络请求
                const {data: res} = await this.$http.post('users',this.addForm);
                if(res.meta.status !== 201) {
                    this.$message.error('添加用户失败！');
                }
                this.$message.success('添加用户成功!');
                // 操作完成后隐藏用户添加对话框
                this.addDialogVisible = false;
                // 数据更新后重新获取并渲染新数据
                this.getUserList();
            })
        },
        // 展示编辑用户对话框
        async showEditDialog(id) {
            // 发起请求获取对应用户信息
            const {data: res} = await this.$http.get('users/' +id);
            if(res.meta.status !== 200) {
                return this.$message.error('查询用户信息失败！');
            }
            this.editForm = res.data;
            this.editDialogVisible = true; // 显示对话框
        },
        // 监听修改用户对话框的关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields();
        },
        // 修改用户信息并提交
        editUserInfo() {
            this.$refs.editFormRef.validate(async valid => {
                if(!valid) return; // 预验证失败，直接 return
                // 发起修改用户信息数据请求
                const {data: res} = await this.$http.put('users/' +this.editForm.id,{ 
                    email: this.editForm.email, mobile: this.editForm.mobile });
                if(res.meta.status !== 200) {
                    this.$message.error('更新用户信息失败！');
                }
                // 关闭对话框
                this.editDialogVisible = false;
                // 刷新数据列表
                this.getUserList();
                // 提示修改成功
                this.$message.success('更新用户信息成功！');
            })
        },
        // 删除用户信息函数
       async removeUser(id) {
            const {data: res} = await this.$http.delete('users/' + id);
                this.$msgbox.confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                onfirmButtonText: '确定',
                ancelButtonText: '取消',
                closeOnClickModal: false, // 禁止点击空白处关闭
                type: 'warning'
        }).then(() => {
            if(res.meta.status !== 200) {
                return this.$message.error('删除用户失败！');
            }
            // 删除完成重新获取并渲染最新数据
            this.getUserList();
            this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
                    
        });
        },
        // 展示分配角色的对话框
        async setRole(userInfo) {
            this.userInfo = userInfo;
            // 在展示对话框之前，获取所有角色列表
            const {data: res} = await this.$http.get('roles');
            if(res.meta.status !== 200) {
                return this.$message.error('获取角色列表失败！');
            }
            this.rolesList = res.data;
            this.setRoleDialogVisible = true;
        },
        // 点击按钮，分配角色函数
        async saveRoleInfo() {
            if(!this.selectRoleId) {
                return this.$message.error('请选择需要分配的角色！');
            }
            const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`,{ rid: this.selectRoleId });
            if(res.meta.status !== 200) {
                return this.$message.error('更新角色失败！');
            }
            this.$message.success('更新角色成功！');
            this.getUserList();
            this.setRoleDialogVisible = false;
        },
        // 监听分配角色对话框的关闭事件
        setRoleDialogClosed() {
            this.selectRoleId = '';
            this.userinfo = {};
        }
    }
}
</script>

<style lang="less" scoped>

</style>