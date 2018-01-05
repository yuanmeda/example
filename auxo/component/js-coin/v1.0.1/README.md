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

