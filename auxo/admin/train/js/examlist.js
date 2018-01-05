/*
 培训考试js
 */

(function($){
  //数据仓库
  var store = {
    //考试列表
    search: function(){
      var url = '/' + projectCode + '/trains/' + trainId + '/exams';
      return commonJS._ajaxHandler(url, null, 'GET');
    },
    //考试分页
    pageSearch: function(search){
      var url = '/' + projectCode + '/trains/' + trainId + '/exams/search';
      return commonJS._ajaxHandler(url, search, 'GET');
    },
    //移除考试
    remove: function(train_id, exam_id){
      var url = '/' + projectCode + '/trains/' + train_id + '/exams?exam_ids=' + exam_id;
      return commonJS._ajaxHandler(url, null, 'DELETE');
    },
    editenable: function(train_id, data){
      var url = '/' + projectCode + '/trains/' + train_id + '/exams/status';
      var obj = {status: data.status, exam_ids: data.exam_ids};
      return commonJS._ajaxHandler(url, JSON.stringify(obj), 'PUT');
    },
    getTrainDetail: function(){
      var url = '/' + projectCode + '/trains/' + trainId + '/detail';
      return $.ajax({
        url: url,
        cache: false
      });
    },
    // 判断是否已经合成成绩
    getRuleStat: function(){
      var url = window.elearningScoreApiHost + '/v1/rules/' + window.trainId + '/stat';
      var queries = {
        link_type: 2
      };
      return $.ajax({
        url: url,
        type: 'GET',
        data: queries
      });
    },
    // 总评合成比是否大于0
    getRulesHasPercentage: function(exam_id){
      var url = window.elearningScoreApiHost + '/v1/rules/' + window.trainId + '/percentage';
      var queries = {
        link_type: 2,
        exam_id: exam_id
      };
      return $.ajax({
        url: url,
        type: 'GET',
        data: queries
      });
    }
  };
  //数据模型
  var viewModel = {
    model: {
      head: {
        cover_url: '',
        enabled: false,
        title: '',
        course_count: '',
        exam_count: '',
        user_count: '',
        course_hour: 0,
        description: ''
      },
      items: [],
      search: {
        page: 0,
        size: 10
      },
      exams: {
        items: [],
        total_count: 0
      },
      iframe: {
        src: '',
        show: false
      }
    },
    init: function(){
      this.model = ko.mapping.fromJS(this.model);
      ko.applyBindings(this, document.getElementById('examlist'));
      this._getHead();
      this._list();
    },
    //获取考试列表数据
    _list: function(){
      var self = this, search = ko.mapping.toJS(this.model.search);
      store.pageSearch(search).done(function(data){
        if (data) {
          self.model.exams.items(data.items);
          self.model.exams.total_count(data.total_count);
          self.page(data.total_count, search.page, search.size);
        }
      });
    },
    page: function(totalCount, pageIndex, pageSize){
      var self = this;
      $("#pagination").pagination(totalCount, {
        is_show_first_last: true,
        is_show_input: true,
        items_per_page: pageSize,
        num_display_entries: 5,
        current_page: pageIndex,
        prev_text: "上一页",
        next_text: "下一页",
        callback: function(index){
          if (index != pageIndex) {
            self.model.search.page(index);
            self._list();
          }
        }
      });
    },
    //考试上下线操作
    editenable: function(data){
      var examIds = [data.exam_id];
      if (data.enable) {
        // 下线
        store.getRulesHasPercentage(data.exam_id)
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
              offline()
                .done(function(){
                  Utils.msgTip('下线成功');
                });
            }
          });
      } else {
        // 上线
        store.getRuleStat()
          .then(function(res){
            if (!res) {
              // 未合成，直接上线
              return online()
                .done(function(){
                  Utils.msgTip('上线成功');
                });
            } else {
              return Utils.confirmTip('该课程总评成绩已合成，上线新考试，总评成绩将变更为未合成状态', {
                title: '提示',
                btn: ['上线', '取消']
              })
                .pipe(function(){
                  online()
                    .done(function(){
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
      }


      function locateToScoreCfg(){
        window.location.href = window.trainWebpageHost + '/'+ window.projectCode+'/train/'+ window.trainId+'/score_adm?level=1.1.4.1&score_route=cfg';
      }


      function online(){
        return store.editenable(data.train_id, {status: 1, exam_ids: examIds})
          .then(function(){
            viewModel._list();
            viewModel._getHead();
          });
      }

      function offline(){
        return store.editenable(data.train_id, {status: 0, exam_ids: examIds})
          .then(function(){
            viewModel._list();
            viewModel._getHead();
          });
      }

    },
    //移除考试
    delExam: function(data){
      Utils.confirmTip("您确认要删除考试吗？", function(){
        store.remove(data.train_id, data.exam_id)
          .done(function(){
            Utils.msgTip('删除成功!').done(function(){
              viewModel._list();
            });
          });
      });
    },
    //获取培训基本信息
    _getHead: function(){
      var koHead = this.model.head, head = ko.mapping.toJS(koHead);
      store.getTrainDetail().done(function(data){
        for (var key in head) {
          if (head.hasOwnProperty(key)) {
            koHead[key](data[key]);
          }
        }
      });
    },
    hrefStatistics: function($data){
      var href = elearning_statistics_service_url + '/' + projectCode + '/statistics/train/department?train_id=' + trainId + '&exam_id=' + $data.exam_id;
      this.model.iframe.src(href + '&__mac=' + Nova.getMacToB64(href));
      this.model.iframe.show(true);
    },
    hrefToExamScore: function($data){
      var href = examWebpage + '/' + projectCode + '/exam/score?exam_id=' + $data.exam_id + ((window.source || '') && '&source=' + window.source) + ((return_url || '') && '&return_url=' + encodeURIComponent(return_url));
      href += '&__mac=' + Nova.getMacToB64(href);
      var w = window.open(href);
    }
  };

  $(function(){
    viewModel.init();
  });

})(jQuery);