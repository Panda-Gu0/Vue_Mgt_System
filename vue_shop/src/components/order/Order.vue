<template>
  <div>
      <!-- 面包屑导航栏 -->
      <el-breadcrumb>
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 主体区域 -->
      <el-card>
          <!-- 搜索区域 -->
                    <el-col :span="8">
                        <el-input placeholder="请输入内容"  clearable >
                            <el-button slot="append" icon="el-icon-search"></el-button>
                        </el-input>
                    </el-col>
           <!-- table 表格区域 -->
                <el-table :data="ordersList" border stripe>
                    <el-table-column type="index" label="序号" align="center"></el-table-column>
                    <el-table-column prop="order_number" label="订单编号" align="center" ></el-table-column>
                    <el-table-column prop="order_price" label="订单价格" align="center" ></el-table-column>
                    <el-table-column prop="pay_status" label="是否付款" align="center">
                        <template slot-scope="scope">
                            <el-tag type="success" v-if="scope.row.pay_status === '1'" size="mini">已付款</el-tag>
                            <el-tag type="danger" v-else size="mini">未付款</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="is_send" label="是否发货" align="center" ></el-table-column>
                    <el-table-column prop="create_time" label="下单时间" align="center" >
                    </el-table-column>
                    <el-table-column label="操作" align="center" min-width="150px">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox">编辑</el-button>
                            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox">位置</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <!-- 分页区域 -->
                 <el-pagination
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 10, 15, 20]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total"
                     align="center"
                     >
                </el-pagination>
                <!-- 修改地址的对话框 -->
                <el-dialog
                 title="修改地址"
                 :visible.sync="addressDialogVisible"
                 width="50%"
                 :close-on-click-modal = "false"
                 @close="addressDialogClosed"
                 >
                 <!-- 表单内容 -->
                 <el-form ref="addressFormRef" :model="addressForm" label-width="100px" :rules="addressFormRules">
                    <el-form-item label="省市区/县" prop="address1">
                      <el-cascader :options="cityData" v-model="addressForm.address"></el-cascader>
                    </el-form-item>
                    <el-form-item label="详细地址" prop="address2">
                      <el-input v-model="addressForm.address2"></el-input>
                    </el-form-item>
                 </el-form>
                 <span slot="footer" class="dialog-footer">
                   <el-button @click="addressDialogVisible = false">取 消</el-button>
                   <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
                 </span>
                </el-dialog>
                <!-- 展示物流进度的对话框 -->
                <el-dialog
                  title="物流进度"
                  :visible.sync="progressDialogVisible"
                  width="50%"
                  :close-on-click-modal="false"
                  >
                  <!-- 物流进度 -->
                   <el-timeline>
                      <el-timeline-item
                        v-for="(activity, index) in progressInfo"
                        :key="index"
                        :timestamp="activity.time">
                        {{activity.context}}
                      </el-timeline-item>
                    </el-timeline>
                </el-dialog>
      </el-card>
  </div>
</template>

<script>
import cityData from './citydata';
export default {
    name: 'Order',
    data() {
        return {
            // 获取订单列表参数对象
            queryInfo: {
                query: '',
                // 当前页数
                pagenum: 1,
                // 当前每页显示多少条数据
                pagesize: 10
            },
            // 订单量总数
            total: 0,
            // 存储订单列表数组
            ordersList: [],
            // 控制修改地址对话框的显示与隐藏
            addressDialogVisible: false,
            // 表单验证对象
            addressForm: {
                address1: [],
                address2: ''
            },
            cityData,
            // 表单验证规则
            addressFormRules: {
                address1: [
                    {required: true, message: '请选择省市区县', trigger: 'blur'}
                ],
                address2: [
                    {required: true, message: '请填写详细地址', trigger: 'blur'}

                ]
            },
            // 物流进度对话框的显示与隐藏
            progressDialogVisible: false,
            // 物流信息
            progressInfo: [],
            // 物流信息假数据
            fake: {
  "data": [
    {
      "time": "2018-05-10 09:39:00",
      "ftime": "2018-05-10 09:39:00",
      "context": "已签收,感谢使用顺丰,期待再次为您服务",
      "location": ""
    },
    {
      "time": "2018-05-10 08:23:00",
      "ftime": "2018-05-10 08:23:00",
      "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
      "location": ""
    },
    {
      "time": "2018-05-10 07:32:00",
      "ftime": "2018-05-10 07:32:00",
      "context": "快件到达 [北京海淀育新小区营业点]",
      "location": ""
    },
    {
      "time": "2018-05-10 02:03:00",
      "ftime": "2018-05-10 02:03:00",
      "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
      "location": ""
    },
    {
      "time": "2018-05-09 23:05:00",
      "ftime": "2018-05-09 23:05:00",
      "context": "快件到达 [北京顺义集散中心]",
      "location": ""
    },
    {
      "time": "2018-05-09 21:21:00",
      "ftime": "2018-05-09 21:21:00",
      "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
      "location": ""
    },
    {
      "time": "2018-05-09 13:07:00",
      "ftime": "2018-05-09 13:07:00",
      "context": "顺丰速运 已收取快件",
      "location": ""
    },
    {
      "time": "2018-05-09 12:25:03",
      "ftime": "2018-05-09 12:25:03",
      "context": "卖家发货",
      "location": ""
    },
    {
      "time": "2018-05-09 12:22:24",
      "ftime": "2018-05-09 12:22:24",
      "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
      "location": ""
    },
    {
      "time": "2018-05-08 21:36:04",
      "ftime": "2018-05-08 21:36:04",
      "context": "商品已经下单",
      "location": ""
    }
  ],
  "meta": { "status": 200, "message": "获取物流信息成功！" }
}
        }
    },
    created() {
        this.getOrderList();
    },
    methods: {
        // 获取订单列表
        async getOrderList() {
            const {data: res} = await this.$http.get('orders',{ params: this.queryInfo });
            if(res.meta.status !== 200) {
                return this.$message.error('获取订单列表失败！');
            }
            res.data.goods.forEach(item => {
                item.create_time = this.dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss');
            });
            this.ordersList = res.data.goods;
            this.total = res.data.total;
        },
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getOrderList();
        },
        handleCurrentChange(pageNum) {
            this.queryInfo.pagenum = pageNum;
            this.getOrderList();
        },
        // 展示修改地址的对话框
        showBox() {
            this.addressDialogVisible = true;
        },
        addressDialogClosed() {
            this.$refs.addressFormRef.resetFields();
        },
        showProgressBox() {
            this.progressInfo = this.fake.data;
            this.progressDialogVisible = true;
            console.log(this.progressInfo);
        }
    }
}
</script>

<style lang="less">
    .el-table {
        margin-top: 60px !important;
    }
</style>