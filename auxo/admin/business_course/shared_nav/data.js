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
            src: 'light',
            color:'#0097da'
        }, {
            text: '枣红色',
            src: 'pink',
            color:'#ca0000'
        }, {
            text: '深色',
            src: 'dark',
            color:'#0cadb7'
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
    window.parseHref = window.parseHref || function(href,options, reg) {
        var _reg = reg || /_(\w)/g,
            _options=options||window;
        return href.replace(/\$\{(\w+)\}/g, function(a, b) {
            return _options[b.replace(_reg, function(_a, _b) {
                return _b.toUpperCase();
            })]||0;
        });
    };
    //状态面包屑信息
    window.routeList={
        //课程列表
        '1.1.1':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'}],
        //课程分类
        '1.1.2':[{title:'课程资源','level':'1.1.1'},{title:'课程分类','level':'1.1.2'}],
        //新建课程
        '1.1.99':[{title:'课程资源','level':'1.1.1'},{title:'新建课程','level':'1.1.99'}],
        //课程基本信息-编辑课程
        '1.2.1':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'基本信息','level':'1.2.1'}],
        '1.2.99':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'编辑课程','level':'1.2.99'}],
        //课程章节
        '1.2.2':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'课程章节','level':'1.2.2'}],
        //报名设置
        '1.2.3':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'报名设置','level':'1.2.3'}],
        //考试管理(考试列表)
        '1.2.4':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'考试管理','level':'1.2.4'}],
        //考试信息
        '1.2.98':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'考试管理','level':'1.2.4'},{title:'考试信息','level':'1.2.98'}],
        //开考条件
        '1.2.97':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'考试管理','level':'1.2.4'},{title:'开考条件','level':'1.2.97'}],
        //试卷策略
        '1.2.96':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'考试管理','level':'1.2.4'},{title:'试卷策略','level':'1.2.96'}],
        //考试管理
        '1.2.95':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'考试管理','level':'1.2.4'},{title:'成绩管理','level':'1.2.95'}],
        //课程统计
        '1.2.5':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'课程统计','level':'1.2.5'}],
        //学员管理
        '1.2.6':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'学员管理','level':'1.2.6'}],
        //课程章节
        '1.2.7':[{title:'课程资源','level':'1.1.1'},{title:'课程列表','level':'1.1.1'},{title:'课程章节','level':'1.2.7'}]
    };
    //状态路由
    window.routeString={
        //课程列表
        '1.1.1':'/' + projectCode+ '/admin/course/test',
        //课程分类
        '1.1.2':'/' + projectCode+ '/auxo/course/admin/course/courseslabel',
        //课程基本信息
        '1.2.1':'/' + projectCode+ '/admin/course/${courseId}',
        //编辑课程
        '1.2.99':'/' + projectCode+ '/admin/course/${courseId}/edit',
        //课程章节
        '1.2.2':'/' + projectCode+ '/admin/course/${courseId}/chapter',
        //报名设置
        '1.2.3':'/' + projectCode+ '/admin/course/${courseId}/enroll_setting',
        //考试管理(考试列表)
        '1.2.4':'/' + projectCode+ '/admin/course/${courseId}/exam',
        //编辑考试
        '1.2.98-2':'/' + projectCode+ '/admin/course/${courseId}/exam/${examId}/edit',
        //新建考试
        '1.2.98-1':'/' + projectCode+ '/admin/course/${courseId}/exam/create',
        //考试试卷列表
        '1.2.96':'/' + projectCode+ '/admin/course/${courseId}/exam/${examId}/paper_setting',
        //开考条件
        '1.2.97':'/' + projectCode+ '/admin/course/${courseId}/exam/${examId}/condition',
        //成绩管理
        '1.2.95':'/' + projectCode+ '/admin/course/${courseId}/achievement?exam_id=${examId}',
        //课程统计
        '1.2.5':'/' + projectCode+ '/admin/course/${courseId}/stat',
        //学员管理
        '1.2.6':'/' + projectCode+ '/admin/course/${courseId}/user',
        //新加课程资源下的课程章节
        '1.2.7':'/' + projectCode+ '/admin/course/${courseId}/resource_chapter'
    };
})(jQuery);
