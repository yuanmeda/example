/*
 课程考试开考条件
 全局变量：projectId
 */

(function($, window){
  'use strict';
  //数据仓库
  var store = {
    //获取考试信息
    examBaseInfo: function(){
      var url = '/' + projectCode + '/v1/exams/' + examId;
      return $.ajax({
        url: url
      });
    },
    //发布业务课程考试(上线考试)
    publishExam: function(){
      var url = '/' + projectCode + '/courses/' + courseId + '/exams/' + examId + '/online';

      return $.ajax({
        url: url,
        type: 'PUT'
      });
    },
    //获取业务课程考试
    examInfo: function(){
      var url = '/' + projectCode + '/courses/' + courseId + '/exams/' + examId;

      return $.ajax({
        url: url
      });
    },
    //保存业务课程考试
    saveExamInfo: function(data){
      var url = '/' + projectCode + '/courses/' + courseId + '/exams';

      return $.ajax({
        url: url,
        type: 'POST',
        data: JSON.stringify(data)
      });
    },
    //更新业务课程考试
    updateExamInfo: function(data){
      var url = '/' + projectCode + '/courses/' + courseId + '/exams/' + examId;

      return $.ajax({
        url: url,
        type: 'PUT',
        data: JSON.stringify(data)
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
        data: queries
      });
    },
  };
  //课程列表数据模型
  var viewModel = {
    model: {
      examCondition: {
        exam_id: examId, //考试id
        progress_percent_condition: 0 //开考条件
      },
      examBaseInfo: {
        enable: true //是否上线
      },
      canPublish: false //是否可发布
    },
    /**
     * 初始化入口
     * @return {null} null
     */
    _init: function(){
      //ko监听数据
      this.model = ko.mapping.fromJS(this.model);
      //ko绑定作用域
      ko.applyBindings(this, document.getElementById('content'));
      //加载事件
      this._eventHandler();
      //加载数据
      this._examInfo();
      // $.when([this._examInfo(), this._examBaseInfo()])
      //     .always(function() {
      //         $(document).trigger('showContent');
      //     });
    },
    /**
     * dom操作事件定义
     * @return {null} null
     */
    _eventHandler: function(){
      var _self = this;
    },
    /**
     * 课程考试开考条件初始化
     * @return {null} null
     */
    _examInfo: function(){
      var _self = this;
      return store.examInfo()
        .done(function(data){
          if (data) {
            _self.model.canPublish(true);
          }
          ko.mapping.fromJS(data, {}, _self.model.examCondition);
          _self._examBaseInfo()
            .done(function(){
              $(document).trigger('showContent');
            });
        });
    },
    /**
     * 课程考试基本信息初始化
     * @return {null} null
     */
    _examBaseInfo: function(){
      var _self = this;
      return store.examBaseInfo()
        .done(function(data){
          ko.mapping.fromJS(data, {}, _self.model.examBaseInfo);
        });
    },
    /**
     * 返回考试管理
     * @return {null}       null
     */
    doBack: function(){
      window.parentModel._setFullPath('1.2.4');
    },
    /**
     * 上一步
     * @return {null}       null
     */
    doPrev: function(){
      window.parentModel._setFullPath('1.2.96');
    },
    /**
     * 保存
     * @return {null}       null
     */
    doSave: function(callback){
      var _self = this,
        _examCondition = _self.model.examCondition,
        _percent = _examCondition.progress_percent_condition(),
        _examId = _examCondition.exam_id(),
        _flag;
      if (!/^\d{1,3}$/.test(_percent) || +_percent > 100) {
        Utils.msgTip('开考条件必须在0~100之间的整数。', {
          icon: 7
        });
        return;
      }
      if (_self.model.canPublish()) {
        _flag = 'update';
      } else {
        _flag = 'save';
      }
      store[_flag + 'ExamInfo']({
        exam_id: _examId,
        progress_percent_condition: _percent
      }).done(function(data){
        _self.model.canPublish(true);
        Utils.msgTip(_self.model.canPublish() ? '编辑成功!' : '保存成功!');
        if (typeof callback == 'function')
          callback();
      });
    },
    /**
     * 发布
     * @return {null}       null
     */
    doPublish: function(){
      var _self = this;
      store.getRuleStat()
        .then(function(res){
          if(!res){
            // 未合成，直接发布
            store.publishExam()
              .done(function(data){
                _self.model.examBaseInfo.enable(true);
                Utils.msgTip('发布成功!');
              });
          }else{
            // 已合成，询问
            return Utils.confirmTip('该课程总评成绩已合成，发布新考试，总评成绩将变更为未合成状态', {
              title: '提示',
              btn: ['发布', '取消']
            })
              .then(function(){
                // 发布
                store.publishExam()
                  .then(function(){
                    _self.model.examBaseInfo.enable(true);
                    Utils.confirmTip('发布成功！您还未设置该考试在总评成绩中的占比哦！', {
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
      function locateToScoreCfg(){
        window.parent.postMessage('locatetoscorecfg', '*');
      }
    }
  };
  /**
   * 执行程序
   */
  viewModel._init();

})(jQuery, window);