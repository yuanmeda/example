/**
 * 课程考试列表页
 * 全局变量：courseId
 */
(function($, window){
  'use strict';
  //数据仓库
  var store = {
    //课程考试列表
    examList: function(data){
      var url = '/' + projectCode + '/courses/' + courseId + '/exams';
      return $.ajax({
        url: url,
        data: data
      });
    },
    //删除课程考试
    delExam: function(id){
      var url = '/' + projectCode + '/courses/' + courseId + '/exams/' + id;
      return $.ajax({
        url: url,
        type: 'DELETE'
      });
    },
    //上线课程考试
    onlineExam: function(id){
      var url = '/' + projectCode + '/courses/' + courseId + '/exams/' + id + '/online';
      return $.ajax({
        url: url,
        type: 'PUT'
      });
    },
    //下线课程考试
    offlineExam: function(id){
      var url = '/' + projectCode + '/courses/' + courseId + '/exams/' + id + '/offline';
      return $.ajax({
        url: url,
        type: 'PUT'
      });
    },
    // 判断是否已经合成成绩
    getRuleStat: function(){
      var url = window.elearningScoreApiHost + '/v1/rules/' + window.courseId + '/stat';
      var queries = {
        link_type: 1,
        plan_id: window.planId
      };
      return $.ajax({
        url: url,
        type: 'GET',
        data:queries
      });
    },
    // 总评合成比是否大于0
    getRulesHasPercentage: function(exam_id){
      var url = window.elearningScoreApiHost + '/v1/rules/'+ window.courseId+'/percentage';
      var queries = {
        link_type: 1,
        exam_id: exam_id,
        plan_id: window.planId
      };
      return $.ajax({
        url: url,
        type: 'GET',
        data: queries
      });
    }
  };
  //课程信息数据模型
  var viewModel = {
    model: {
      items: [], //列表项
      filter: {
        page_no: 0, //分页索引
        page_size: 20 //每页item数
      }
    },
    /**
     * 初始化入口
     * @return {null} null
     */
    _init: function(){
      //ko监听数据
      this.model = ko.mapping.fromJS(this.model);
      //ko绑定作用域
      ko.applyBindings(this, LACALDATA.contentBind);
      //加载课程基本信息
      this._list(true);
    },
    /**
     * 获取课程考试列表
     * @return {null} null
     */
    _list: function(flag){
      var _self = this,
        _filter = _self.model.filter;
      if (courseId) {
        store.examList(_filter)
          .done(function(returnData){
            if (returnData.items) {
              _self.model.items(returnData.items);
            }
            Utils.pagination(returnData.total,
              _filter.page_size(),
              _filter.page_no(),
              function(no){
                _filter.page_no(no);
                _self._list();
              }
            );
            if (flag) {
              $(document).trigger('showContent');
            }
          });
      }
    },
    /**
     * 编辑考试
     * @return {null} null
     */
    toEdit: function(binds){
      window.parentModel._setFullPath('1.2.98-2', {
        courseId: courseId,
        examId: binds.id
      });
    },
    /**
     * 创建考试
     * @return {null} null
     */
    toCreate: function(){
      window.parentModel._setFullPath('1.2.98-1');
    },
    /**
     * 成绩管理
     * @param  {object} binds ko绑定对象数据
     * @return {null}       null
     */
    scoreManage: function(binds){
      window.parentModel._setFullPath('1.2.95', {courseId: courseId, examId: binds.id});
    },
    /**
     * 删除考试
     * @param  {object} binds ko绑定对象数据
     * @return {null} null
     */
    delExam: function(binds){
      var _self = this;
      Utils.confirmTip('是否确认删除该考试！')
        .done(function(){
          store.delExam(binds.id)
            .done(function(data){
              Utils.msgTip('删除成功');
              _self.model.items.remove(binds);
            });
        });
    },
    /**
     * 修改考试状态(包含上下线)
     * @param  {object} binds ko绑定对象数据
     * @return {null} null
     */
    examStatusSetting: function(binds){
      var _self = this,
        _currentData = $.extend({}, binds, {
          enable: !binds.enable
        });
      if (_currentData.enable) {
        // 上线
        store.getRuleStat()
          .then(function(res){
            if (!res) {
              // 未合成，直接上线
              return store.onlineExam(binds.id)
                .done(function(){
                  Utils.msgTip('上线成功');
                  _self.model.items.replace(binds, _currentData);
                });
            } else {
              return Utils.confirmTip('该课程总评成绩已合成，上线新考试，总评成绩将变更为未合成状态', {
                title: '提示',
                btn: ['上线', '取消']
              })
                .then(function(){
                  store.onlineExam(binds.id)
                    .done(function(){
                      _self.model.items.replace(binds, _currentData);
                      Utils.confirmTip('上线成功！您还未设置该考试在总评成绩中的占比哦！', {
                        title: '提示',
                        btn: ['去设置', '不计入总评']
                      })
                        .then(function(){
                          // 去设置
                          locateToScoreCfg();
                        });

                    });
                });
            }

          });
      } else {
        // 下线
        store.getRulesHasPercentage(binds.id)
          .then(function(res){
            if(!res){
              // 总评合成占比大于0
              Utils.confirmTip('该考试参与总评成绩合成，如需下线，请先将该考试在成绩比例设置中的占比设置为0', {
                title: '提示',
                btn: ['去设置', '取消']
              })
                .then(function(){
                  // 去设置
                  locateToScoreCfg();
                })
            }else{
              // 直接下线
              store.offlineExam(binds.id)
                .done(function(){
                  Utils.msgTip('下线成功');
                  _self.model.items.replace(binds, _currentData);
                });
            }
          });

      }

      function locateToScoreCfg(){
        window.parent.postMessage('locatetoscorecfg', '*');
      }
    },
    /**
     * 上一步
     * @return {null} null
     */
    prevStep: function(){
      window.parentModel._setFullPath('1.2.3');
    },
    /**
     * 下一步
     * @return {null} null
     */
    nextStep: function(){
      window.parentModel._setFullPath('1.2.7');
    }
  };
  /**
   * 执行程序
   */
  viewModel._init();
})(jQuery, window);
