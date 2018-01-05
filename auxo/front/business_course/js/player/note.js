define(function (require, exports, module) {
    var store = {
        getMyNote: function (filter) {
            var url = noteGatewayUrl + '/v1/my_notes';
            //filter.target_id = getResourceName(resourceType) + ':' + resourceUuid;
            filter.target_id = 'course:' + courseId;
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                data: filter,
                error: store.errorCallback
            });
        },
        getAllNote: function (filter) {
            var url = noteGatewayUrl + '/v1/notes';
            //filter.target_id = getResourceName(resourceType) + ':' + resourceUuid;
            filter.target_id = 'course:' + courseId;
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                data: filter,
                error: store.errorCallback
            });
        },
        deleteNote: function (note_id) {
            var url = noteServiceUrl + '/v1/notes/' + note_id;
            return $.ajax({
                url: url,
                type: 'DELETE',
                error: store.errorCallback
            });
        }
    };
    var viewModel = {
        offset: 0,
        offsetAll: 0,
        oneTime: true,
        first: true,
        opts3: {
            userId: window.userId,
            apiHost: noteServiceUrl,
            isLogin: userId? true: false,
            showExcerpt: false,
            showBlowing: false,
            showEdit: true,
            showDel: true,
            onEditCommand: function(note){
                viewModel.model.createBuildNote.editNoteInfo(note);
            },
            onDelCommand: function(id){
                $('.u-ui-mask').show();
                viewModel.model.deleteId(id);
            }
        },
        opts4: {
            userId: window.userId,
            apiHost: noteServiceUrl,
            isLogin: userId? true: false,
            showExcerpt: true,
            showBlowing: true,
            showEdit: false,
            showDel: false
        },
        model: {
            scrollTopMy: null,
            scrollTopAll: null,
            noteType: '1',
            deleteId: '',//待删除笔记的id
            myNoteList: [],//我的笔记列表
            noQusMine: false,
            allNoteList: [],//全部笔记列表
            noQusAll: false,
            isLoading: false,
            noteType: 1,//切换类型，1为我的笔记，2为全部笔记
            buttonText: i18nHelper.getKeyValue('learn.noteAdd'),
            isShow: true,//切换显示，true显示我的笔记，false显示全部笔记
            total: 0,//我的笔记数量
            allTotal: 0,//全部笔记数量
            /*组件需要的*/
            createBuildNote: {
                biz_param: {
                    course_id: courseId,
                    resource_id: resourceUuid,
                    resource_type: resourceType,
                    course_title: courseTitle,
                    location: ''
                },
                videoCurrentTime: '',
                docInfo: '',
                refreshNotes: false,
                editNoteInfo: null,
                excerpt_note_id: null,
                note_id: null
            },
            filterMy: {
                page: 0,
                size: 20
            },
            filterAll: {
                order_by: 0,
                page: 0,
                size: 20
            }
        },

        init: function () {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            if (window.innerHeight < 1000) {
                $('.note-tab-cont').css('height', '670px');
            }
            $('.note-tab-cont').on('scroll', function () {
                if ((this.scrollTop + this.clientHeight == this.scrollHeight) && viewModel.model.noteType() == '1') {
                    if (viewModel.model.filterMy.page() == 0) {
                        viewModel.model.filterMy.page(1);
                    }
                    viewModel.model.filterMy.page(viewModel.model.filterMy.page() + 1);
                    viewModel.model.filterMy.size(10);
                    if (!viewModel.model.noQusMine() && userId) {
                        viewModel.getMyNotes(true);
                    }
                } else if ((this.scrollTop + this.clientHeight == this.scrollHeight) && viewModel.model.noteType() == '2') {
                    if (viewModel.model.filterAll.page() == 0) {
                        viewModel.model.filterAll.page(1);
                    }
                    viewModel.model.filterAll.page(viewModel.model.filterAll.page() + 1);
                    viewModel.model.filterAll.size(10);
                    if (!viewModel.model.noQusAll()) {
                        viewModel.getAllNotes(true);
                    }
                }
            });
            $("div.tab .n-ui-tab3").children('a').click(function () {
                var type = $(this).attr('noteType');
                if (viewModel.model.noteType() == type) {
                    return;
                }
                $(this).addClass('on');
                $(this).siblings().removeClass('on');
                if (type == '1') {
                    viewModel.model.isShow(true);
                    viewModel.model.filterMy.page(0);
                    viewModel.model.filterMy.size(20);
                    if(userId){
                        viewModel.getMyNotes();
                    }

                    viewModel.model.noteType(type);
                } else {
                    viewModel.model.isShow(false);
                    viewModel.model.filterAll.page(0);
                    viewModel.model.filterAll.size(20);
                    viewModel.getAllNotes();
                    viewModel.model.noteType(type);
                }
                viewModel.model.noteType($(this).attr('noteType'));
            });
            this.model.createBuildNote.refreshNotes.subscribe(function (val) {
                if (val) {
                    setTimeout(function () {
                        /*还原page和size*/
                        _self.model.filterMy.page(0);
                        _self.model.filterMy.size(20);
                        _self.model.filterAll.page(0);
                        _self.model.filterAll.size(20);
                        _self.getNotes();
                    }, 500)
                    _self.model.createBuildNote.refreshNotes(false);
                }
            })
            //this.getNotes();
        },
        getMyNotes: function (flag) {
            var _self = this;
            /*获取笔记列表*/
            if(!userId)
                return;
            var paramsMy = ko.mapping.toJS(this.model.filterMy);
            store.getMyNote(paramsMy).done(function (resData) {
                if (resData && resData.items && !flag) {
                    _self.model.myNoteList(resData.items);
                    _self.model.total(resData.count);
                } else {
                    $.each(resData.items, function (index, item) {
                        _self.model.myNoteList.push(item);
                    });
                    if (resData.items.length) {
                        $('.note-tab-cont').scrollTop(0);
                    } else {
                        _self.model.noQusMine(true);
                    }
                }
            });
        },
        getAllNotes: function (flag) {
            var _self = this;
            var paramsAll = ko.mapping.toJS(this.model.filterAll);
            store.getAllNote(paramsAll).done(function (resData) {
                if (resData && resData.items && !flag) {
                    _self.model.allNoteList(resData.items);
                    _self.model.allTotal(resData.count);
                } else {
                    $.each(resData.items, function (index, item) {
                        _self.model.allNoteList.push(item);
                    });
                    if (resData.items.length) {
                        $('.note-tab-cont').scrollTop(0);
                    } else {
                        _self.model.noQusAll(true);
                    }
                }
            });
        },
        getNotes: function () {
            if(userId){
                this.getMyNotes();
            }

            this.getAllNotes();
        },
        /*显示笔记编辑*/
        showEdit: function (video, doc) {
            switch (resourceType) {
                case '0':
                case '101':
                    viewModel.model.createBuildNote.videoCurrentTime(viewModel.formatTime(video.player.getTime()));
                    break;
                case '1':
                case '102':
                    viewModel.model.createBuildNote.docInfo(doc.player.getCurrentPage() + '/' + doc.model.pageCount);
                    break;
            }
            /*编辑时resourceType会变成当前笔记的类型，所以这里要还原*/
            viewModel.model.createBuildNote.biz_param.resource_type(resourceType);
            viewModel.model.createBuildNote.excerpt_note_id(null);
            /*要删除原有笔记Id,否则更新某笔记过后再新建笔记还是会走更新接口*/
            viewModel.model.createBuildNote.note_id(null);
            $('#tht').attr('checked', true);
            $('.add-note-input').removeClass('hide');
        },
        /*格式化时间*/
        formatTime: function (val) {
            var time = (typeof val == 'number') ? Math.floor(Number(val)) : 0;
            var m = Math.floor(time / 60);
            var s = time % 60;
            if (m < 10) {
                m = '0' + m;
            }
            if (s < 10) {
                s = '0' + s;
            }
            return m + ':' + s;
        },
        /*确定删除*/
        confirmDelete: function () {
            var _self = this;
            store.deleteNote(viewModel.model.deleteId()).done(function (resData) {
                $('.u-ui-mask').hide();
                $.each(viewModel.model.myNoteList(), function (index, item) {
                    if (item.id == viewModel.model.deleteId()) {
                        viewModel.model.myNoteList.splice(index, 1);
                        return false;
                    }
                });
                viewModel.model.total(viewModel.model.total() - 1);
                /*setTimeout(function () {
                    _self.model.note().viewModel.getNotes();
                }, 500)*/
            })
        },
        /*取消删除框*/
        deleteCancel: function () {
            $('.u-ui-mask').hide();
        }
    };

    function getResourceName(res_type){
        var result;
      switch (res_type) {
        case '0':
        case '101':
          result = 'video';
          break;
        case '1':
        case '102':
          result = 'document';
          break;
        case '2':
        case '103':
          result = 'question';
          break;
        case '3':
        case '104':
          result = 'url';
          break;
        case '4':
        case '105':
          result = 'vr';
          break;
        case '5':
          result = 'live';
          break;
        case '6':
          result = 'panorama';
          break;
      }

      return result
    }

    exports.viewModel = viewModel;
});
