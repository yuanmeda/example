/*
 课程资源列表
 全局变量：projectId
 */

(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        courseList: function (data) {
            var url = '/' + projectCode + '/courses/pools/search';
            return $.ajax({
                url: url,
                data: data
            });
        },
        updatetCourse: function (data, courseId) {
            var url = '/' + projectCode + '/courses/' + courseId;
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data)
            });
        },
        deleteCourse: function (courseId) {
            var url = '/' + projectCode + '/resource_courses/' + courseId;
            return $.ajax({
                url: url,
                type: 'DELETE'
            });
        }
    };
    var viewModel = {
        model: {
            items: [],
            filter: {
                project_id: null,
                name: decodeURIComponent(window.course_keyword) || '',
                order: '',
                page_no: 0,
                page_size: 20
            },
            style: 'pic',
            tips: false
        },
        _init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.filter.name.subscribe(function (val) {
                if (val.length > 50) {
                    this.model.tips(true);
                } else {
                    this.model.tips(false);
                }
            }, this);
            this.model.items.extend({
                notify: 'always'
            });
            ko.applyBindings(this, document.getElementById('content'));
            this._eventHandler();
            this._list(true);
        },
        _eventHandler: function () {
            var _self = this;
            $('#content').on('click', '.item-check', function () {
                var _this = $(this),
                    _hasCheck = _this.hasClass('active');
                _this.closest('#content').find('.item').find('.item-check').removeClass('active');
                if (!_hasCheck) {
                    _this.addClass('active');
                }
            });
            $('#keyword').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    _self.doSearch();
                }
            });
        },
        _list: function (flag) {
            var _self = this,
                _filter = _self.model.filter,
                _search = _self._filterParams(ko.mapping.toJS(_filter));
            store.courseList(_search).done(function (returnData) {
                if (returnData.items) {
                    _self.model.items(returnData.items);
                }
                Utils.pagination(returnData.total,
                    _filter.page_size(),
                    _filter.page_no(),
                    function (no) {
                        _filter.page_no(no);
                        _self._list();
                    }
                );
                if (flag) {
                    $(document).trigger('showContent');
                }
                window.scrollTo(0, 0);
            });
        },
        _filterParams: function (params) {
            var _params = {};
            for (var key in params) {
                if (params.hasOwnProperty(key) && $.trim(params[key]) !== '') {
                    _params[key] = params[key];
                }
            }
            return _params;
        },
        createCourse: function () {
            window.parentModel._setFullPath('1.2.99');
        },
        styleChange: function (type) {
            this.model.style(type);
        },
        toDetail: function (binds) {
            window.courseId = binds.id;
            window.parentModel._setFullPath('1.2.1');
        },
        doSearch: function () {
            if (this.model.tips()) {
                return;
            }
            this.model.filter.page_no(0);
            this._list();
        },
        deleteCourse: function (binds) {
            var _self = this;
            Utils.confirmTip('确定删除？', {
                icon: 7,
                btn: ['确定', '取消']
            })
                .then(function (index) {
                    store.deleteCourse(binds.id)
                        .done(function () {
                            Utils.msgTip('课程删除成功!')
                                .done(function () {
                                    var _pageNo = _self.model.filter.page_no();
                                    if (_self.model.items().length === 1 && _pageNo > 0) {
                                        _self.model.filter.page_no(_pageNo - 1);
                                    }
                                    _self._list();
                                });
                        });
                });
        },
        onOffLine: function (binds) {
            this._changeStatus(binds, binds.course_status === 1 ? 0 : 1);
        },
        _changeStatus: function (courseInfo, status) {
            var _self = this,
                _postData = {
                    title: courseInfo.title,
                    pic_id: courseInfo.pic_id,
                    video_id: courseInfo.video_id,
                    user_suit: courseInfo.user_suit,
                    description: courseInfo.description,
                    course_status: status
                };
            store.updatetCourse(_postData, courseInfo.id)
                .done(function () {
                    Utils.msgTip((status === 1 ? '上线' : '下线') + '成功!')
                        .done(function () {
                            _self.model.items.replace(courseInfo, $.extend({}, courseInfo, {
                                course_status: status
                            }));
                        });
                });
        }
    };
    viewModel._init();

})(jQuery, window);
