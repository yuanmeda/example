**101教育平台业务组件**

**背景**： 实现101教育平台组件业务ui组件复用，组件依托 knockout ui 类库 和 跨域资源请求封装 组件使用 npm 组件标准开发模式

1. **调用方式：**

  1. 简单调用 即 `<script>` 远程调用

  2. 依赖调用 使用（commonjs、es）标准模块化进行引用

2. **开发方式**

  组件目录结构

  ```
  - package.json 组件描述
   - index.js  entry 入口文件
   - template.html  模板文件
   - css   样式目录
   - dist  打包目录
   - test  测试
   - i18n  语言文件

   组件名称统一以 【x-{功能描述}】进行注册
  ```

  存放路径

  ```
  使用版本号目录进行区隔
  ```

3. **编译方式**

  ```bash
  $ npm run build
  ```

4. **组件使用**

  组件使用所需参数 `params`

  ```javascript

  params: {
    /**
     * 环境对应讲师服务端 host
     * @type {String}
     */
    host: 'http://lecturer-api.dev.web.nd',
    /**
     * 环境对应 CS host
     * @type {String}
     */
    csHost: 'https://betacs.101.com[/v0.1]',
    /**
     * 环境对应默认头像地址
     * @type {String}
     */
    csCDN: 'http://cdncs.101.com/v0.1/static/cscommon/avatar/2000336579/2000336579.jpg?size=80&defaultImage=1',
    /**
     * 课程 ID
     * @type {String}
     */
    id: '',
    /**
     * 头像点击处理事件
     * @method handlera
     * @return [type]  [description]
     */
    handler: () => {}
  }

  ```
