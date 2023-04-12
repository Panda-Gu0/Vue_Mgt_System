import Vue from 'vue'
// 按需导入所要的 element-ui 组件
import { 
Button, 
Form, 
FormItem, 
Input, 
Message, 
MessageBox,
Container, 
Aside, 
Header, 
Main, 
Menu, 
Submenu, 
MenuItem,
Breadcrumb,
BreadcrumbItem,
Card,
Row,
Col,
Table,
TableColumn,
Switch,
Tooltip,
Pagination,
Dialog,
Tag,
Tree,
Option,
Select,
Cascader,
Alert,
Tabs,
TabPane,
Steps,
Step,
CheckboxGroup,
Checkbox,
Upload,
Timeline,
TimelineItem
 } from 'element-ui'
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Aside)
Vue.use(Header)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Option)
Vue.use(Select)
Vue.use(Cascader)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Steps)
Vue.use(Step)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Upload)
Vue.use(Timeline)
Vue.use(TimelineItem)
Vue.prototype.$message = Message // 全局挂载
Vue.prototype.$msgbox = MessageBox 