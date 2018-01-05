/*!
 * 后台导航配置数据及一系列事件
 */

(function($) {
    /**
     * 获取请求参数对象数组
     * @param  {string} search 链接请求参数链即location.search
     * @return {object}        参数对象数组
     */
    window.getAjaxParams = window.getAjaxParams || function(search) {
        var _search = search,
            _params = {};
        if (_search) {
            _search.slice(1).split('&').forEach(function(pair, index) {
                var _temp = pair.split('=');
                _params[_temp[0]] = _temp[1];
            });
        }
        setCookie(_params);
        return _params;
    };
    /**
     * 批量存储cookie
     * @param  {object} params hash对象$.cookie()
     * @return {null}        null
     */
    window.setCookie=window.setCookie||function(params,date,path){
        for(var _pair in params){
            if(params.hasOwnProperty(_pair)){
                $.cookie(_pair, params[_pair], {
                    expires: date||7,
                    path: path||'/'
                });
            }
        }
    };
    /**
     * 清除cookie excludes指定除外
     * @param  {Array} excludes 排除项列表
     * @return {null}          null
     */
    window.clearCookie=window.clearCookie||function(excludes){
        var _cookies=$.extend({},$.cookie()||{}),
            _excludes=excludes||[];
        for(var key in _cookies){
            if(_excludes.indexOf(key)===-1){
                $.cookie(key,null,{
                    expires: -1,
                    path: '/'
                });
            }
        }
    };
    /**
     * 点击事件不冒泡
     * @param  {event} e 事件参数
     * @return {null}   无
     */
    window.stopEvent = window.stopEvent || function(e) {
        e = e || window.event;
        e.preventDefault();
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            window.event.cancelBubble = true;
        }
    };
    /**
     * 后台皮肤配置
     * @return {array} 皮肤列表
     */
    window.skins = window.skins || function() {
        return [{
            text: '亮色',
            src: 'light'
        }, {
            text: '枣红色',
            src: 'pink'
        }, {
            text: '深色',
            src: 'dark'
        }];
    };
    /**
     * 获取皮肤列表src数组
     * @return {array}       src数组
     */
    window.skinPure = skins().map(function(skin) {
        return skin.src;
    });
    /**
     * 链接参数替换（匹配${\w}）
     * @param  {string} href 要处理的链接
     * @param  {string} reg  正则字符串
     * @return {string}      处理后的字符串
     */
    window.parseHref = window.parseHref || function(href, reg) {
        var _reg = reg || /_(\w)/g;
        return href.replace(/\$\{(\w+)\}/g, function(a, b) {
            return window[b.replace(_reg, function(_a, _b) {
                return _b.toUpperCase();
            })];
        });
    };
    //状态面包屑信息
    window.routeList={
//        '1.1.1':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'}],
//        '1.1.2':[{title:'课程资源','level':'1.1.1'},{title:'课程分类','level':'1.1.2'}],
//        '1.1.99':[{title:'课程资源','level':'1.1.1'},{title:'新建课程','level':'1.1.99'}],
//        '1.2.1':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'基本信息','level':'1.2.1'}],
//        '1.2.2':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'课程章节','level':'1.2.2'}],
//        '1.2.99':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'编辑课程','level':'1.2.99'}],
          '2.1.1':[{title:'考试认证','level':'1.1.1'},{title:'考试列表','level':'1.1.1'}],
          '2.1.2':[{title:'考试认证','level':'1.1.1'},{title:'考试标签','level':'1.1.1'}]
    };
    //状态路由
    window.routeString={
//        '1.1.1':'/auxo/course/admin/course/courselist',
//        '1.1.2':'/auxo/course/admin/course/courseslabel',
//        '1.2.1':'/auxo/course/admin/course/coursedetail?course_id=${courseId}',
//        '1.2.99':'/auxo/course/admin/course/courseedit?course_id=${courseId}',
//        '1.2.2':'/auxo/course/admin/course/coursechapters?course_id=${courseId}'
        '2.1.1':'/auxo/exam/admin/exam/examlist',
        '2.1.2':'/auxo/exam/admin/exam/examlabel'

    };
})(jQuery);
