**101教育平台业务组件**

**背景**： 实现101教育平台组件业务ui组件复用，组件依托 knockout ui 类库 和 跨域资源请求封装 
组件使用 npm 组件标准开发模式 

1. **调用方式：**

	1.  简单调用  即 `<script>` 远程调用

	2.  依赖调用  使用（commonjs、es）标准模块化进行引用

2. **开发方式**

	组件目录结构 
		
		- package.json 组件描述
		- index.js  entry 入口文件
		- template.html  模板文件
		- css   样式目录
		- dist  打包目录
		- test  测试
        - i18n  语言文件
        
3. **编译方式**

		npm run build


使用方法：
1、本组件上传图片使用webuploader，需提前将以下两个文件引入
<@res.css path="/auxo/addins/webuploader/v0.1.5/css/webuploader.css"/>
<@res.js path="/auxo/addins/webuploader/v0.1.5/js/webuploader.js"/>

2、页面中需要 staticUrl 变量保存静态站地址 以供webuploader使用
var staticUrl = '${static_url!}';

3、组件引入
<@res.css path="/auxo/component/js-question-uploadimg/dist/css/theme/${project.style!'blue'}/index.css"/>
<@res.js path="/auxo/component/js-question-uploadimg/dist/i18n/"+((project.language.code)!("zh-CN"))+".js"/>
<@res.js path="/auxo/component/js-question-uploadimg/dist/index.js"/>

<!--ko component:{name:'x-question-uploadimg',
                 params:{
                    content: $component.model.question.content,
                    attach_pictures: $component.model.question.attach_pictures,
                    is_show: $component.model.showUpload }
                 }--><!--/ko-->

参数：
attach_pictures: 图片数组 （必填，ko.observableArray 对象）
is_show: 显示/隐藏上传组件 （必填，ko.observable 对象）
api_url: 问答service api接口地址（必填）

