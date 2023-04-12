<template>
    <div>
        <!-- 面包屑导航栏 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
               <!-- 搜索和添加区域 --> 
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable clear="getGoodsList()">
                            <el-button slot="append" icon="el-icon-search" @click="getGoodsList()"></el-button>
                        </el-input>
                    </el-col>
                    <el-col :span="4">
                        <el-button type="primary" @click="addPage">添加商品</el-button>
                    </el-col>
                </el-row>
                <!-- table 表格区域 -->
                <el-table :data="goodsList" border stripe>
                    <el-table-column type="index" label="序号" align="center"></el-table-column>
                    <el-table-column prop="goods_name" label="商品名称" align="center" ></el-table-column>
                    <el-table-column prop="goods_price" label="商品价格（元）" align="center" width="120px"></el-table-column>
                    <el-table-column prop="goods_weight" label="商品重量" align="center" width="80px"></el-table-column>
                    <el-table-column prop="add_time" label="创建时间" align="center" width="140px">
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="220px">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGoodDialog(scope.row)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <!-- 分页区域 -->
                <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    align="center"
                    background
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[5, 10, 15, 20]"
                    :page-size="100"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
                </el-pagination>
        </el-card>
        <!-- 编辑商品内容对话框 -->
                            <el-dialog
                              title="编辑商品内容"
                              :visible.sync="EditDialogVisible"
                              width="30%"
                              :close-on-click-modal="false"
                              >
                              <!-- 修改内容区域 -->
                              <el-form :model="editGoodForm" :rules="editGoodFormRules" ref="editGoodFormRef" label-width="100px">
                                    <el-form-item label="商品名称" prop="goods_name">
                                    <el-input v-model="editGoodForm.goods_name"></el-input>
                              </el-form-item>
                              </el-form>
                              <span slot="footer" class="dialog-footer">
                                <el-button @click="EditDialogVisible = false">取 消</el-button>
                                <el-button type="primary" @click="editGood()">确 定</el-button>
                              </span>
                            </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'List',
    data() {
        return {
            // 获取商品列表参数对象
            queryInfo: {
                query: '',
                // 当前页数
                pagenum: 1,
                // 当前每页显示多少条数据
                pagesize: 10
            },
            // 商品列表
            goodsList: [],
            // 获取商品总数
            total: 0,
            // 控制编辑商品对话框的显示与隐藏
            EditDialogVisible: false,
            // 编辑商品表单验证对象
            editGoodForm: {
                goods_name: '',
                goods_id: 0,
                goods_price: 0,
                goods_number: 0,
                goods_weight: 0
            },
            // 编辑商品表单验证规则
            editGoodFormRules: {
                goods_name: [
                    { required: true, message: '请输入新商品名称', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        this.getGoodsList();
    },
    methods: {
        // 根据分页获取对应的商品列表
        async getGoodsList() {
            const {data: res} = await this.$http.get('goods',{ params: this.queryInfo });
            if(res.meta.status !== 200) {
                return this.$message.error('获取商品列表失败！');
            }
            res.data.goods.forEach(item => {
                item.add_time = this.dayjs(item.add_time).format('YYYY-MM-DD HH:mm:ss');
            });
            this.goodsList = res.data.goods;
            this.total = res.data.total;
            console.log(res);
        },
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getGoodsList();
        },
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage;
            this.getGoodsList();
        },
        // 点击删除商品
        async removeById(id) {
            const {data: res} = await this.$http.delete('goods/' + id);
          this.$msgbox.confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false, // 禁止点击空白处关闭
        }).then(() => {
          if(res.meta.status !== 200) {
              return this.$message.error('删除商品失败！');
          }
          this.getGoodsList();
          this.$message.success('删除商品成功！');
        }).catch(() => {
        
        });
        },
        // 跳转到添加商品页面
        addPage() {
            this.$router.push('goods/add');
        },
        // 点击对商品内容进行编辑
        editGoodDialog(row) {
            this.EditDialogVisible = true;
            this.editGoodForm = row;
            console.log(this.editGoodForm);
        }
    }
}
</script>

<style lang="less" scoped>

</style>