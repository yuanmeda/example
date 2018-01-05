;(function ($) {
    var store = {
        getTutorial: function () {
            return $.ajax({
                url: '/' + projectCode + '/v1/recommends/categories',
                cache: false
            });
        },
        getList: function (search) {
            return $.ajax({
                url: '/' + projectCode + '/v1/recommends/teaching_materials',
                data: search,
                cache: false
            });
        },
        create: function (import_mode, data) {
            return $.ajax({
                url: '/' + projectCode + '/v1/recommends/teaching_materials/import?import_mode=' + import_mode,
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data),
                beforeSend: function (jqXHR, setting) {
                    jqXHR.hideLoading = true;
                }
            });
        },
        getChapterCount: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/v1/recommends/teaching_materials/counts',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data)
            });
        },
        validTutorial: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/v1/recommends/teaching_materials/import/valid',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data)
            });
        }
    };
    var xhr = null;
    var viewModel = {
        model: {
            search: {
                page: 0,
                size: 10,
                words: '',
                period: '',
                classes: '',
                subject: '',
                edition: ''
            },
            searchTemp: { // for import to create tag, only update when search
                grade_tag: {
                    name: '',
                    path: '',
                    code: ''
                },
                subject_tag: {
                    name: '',
                    path: '',
                    code: ''
                },
                resource_types: []
            },
            import_mode: { //1 . 只导教材（默认）， 2. 教材 章节，3. 教材 章节 资源
                chapter: true,
                resource: false,
                courseware: false
            },
            selectedAll: false,
            selectedTutorial: [],
            tutorialData: [], // for select tag
            tutorial: {  //for list
                items: [],
                count: 0
            },
            importDetail: { //for loading-modal
                items: [],
                title: '',
                isPosting: false,
                count: 0,
                stop: false,
                res_count: 0,
                tutorial: 0
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);

            this.model.import_mode.chapter.subscribe(function (nv) {
                if (!nv) {
                    this.model.import_mode.resource(false);
                    this.model.import_mode.courseware(false);
                }
            }, this);

            this.selectAll();
            this.getData();
            ko.applyBindings(this, document.getElementById('tutorialList'));
        },
        selectAll: function () {
            this.model.selectedAll = ko.computed({
                read: function () {
                    var selected = this.model.selectedTutorial(), list = this.model.tutorial.items(), count = 0;
                    for (var i = 0, len = selected.length; i < len; i++) {
                        for (var j = 0, l = list.length; j < l; j++) {
                            if (selected[i].identifier == list[j].identifier) {
                                selected.splice(i, 1, list[j]);
                                count++;
                            }
                        }
                    }
                    return list.length && count === list.length;
                },
                write: function (value) {
                    var list = this.model.tutorial.items(), selectedTutorial = this.model.selectedTutorial, length = selectedTutorial().length;
                    if (value) {
                        $.each(list, function (i, v) {
                            if (length) {
                                var result = true;
                                $.each(selectedTutorial(), function (ii, vv) {
                                    if (vv.identifier == v.identifier) {
                                        result = false;
                                        return false;
                                    }
                                });
                                if (result) selectedTutorial.push(v);
                            } else {
                                selectedTutorial.push(v);
                            }
                        });
                    }
                    else {
                        selectedTutorial.removeAll(list);
                    }
                },
                owner: this
            });
        },
        getData: function () {
            var self = this;
            store.getTutorial().done(function (data) {
                if (data) {
                    self.model.tutorialData(data.items);
                    self._getList();
                    $.proxy(self.updateSearchTemp(), self);
                }
            });
        },
        _getList: function () {
            var self = this,
                search = this.formatQuery();
            store.getList(search)
                .done(function (data) {
                    var ids = $.map(data.items, function (v, i) {
                        return v.identifier;
                    });
                    store.getChapterCount({ids: ids}).done(function (chapterCount) {
                        $.each(chapterCount, function (i, v) {
                            $.each(data.items, function (ii, vv) {
                                if (v.identifier === vv.identifier) {
                                    data.items[ii].chapter_count = v.chapter_count;
                                    return false;
                                }
                            });
                        });
                        self.model.tutorial.items(data.items);
                        self.model.tutorial.count(data.total);
                        self._page(self.model.tutorial.count(), self.model.search.page(), self.model.search.size());
                    });
                });
        },
        search: function () {
            this.model.selectedTutorial([]);
            this.model.search.page(0);
            this._getList();
            this.updateSearchTemp();
        },
        validTutorial: function () {
            var model = this.model,
                self = this,
                selected = ko.mapping.toJS(this.model.selectedTutorial),
                ids = $.map(selected, function (v, i) {
                    return v.identifier;
                });
            this.resetImportDetail();
            store.validTutorial({ids: ids}).done(function (data) {
                var msg = '', count = 0, import_mode = 2;
                model.searchTemp.resource_types([]);
                if (!model.import_mode.chapter()) import_mode = 1;
                else{
                    if(model.import_mode.resource() && model.import_mode.courseware()){
                        model.searchTemp.resource_types([1,2])
                    }else if(model.import_mode.resource() && !model.import_mode.courseware()){
                        model.searchTemp.resource_types([1])
                    }else if(!model.import_mode.resource() && model.import_mode.courseware()){
                        model.searchTemp.resource_types([2])
                    }
                    if(model.searchTemp.resource_types().length) import_mode = 3;
                }

                if (data.code === 1) {
                    $.each(data.id_list, function (i, v) {
                        $.each(selected, function (ii, vv) {
                            if (v == vv.identifier) {
                                count++;
                                msg += count + '、<strong>' + vv.title + '</strong> (' + vv.identifier + ')<br/>';
                                return false;
                            }
                        });
                    });
                    $.fn.dialog2.helpers.confirm("本次导入将覆盖" + data.id_list.length + "个教材，分别是：<br/>" + msg + "覆盖将造成学习进度有误等严重影响，是否确定？", {
                        "confirm": function () {
                            self.importTutorial(import_mode);
                        },
                        buttonLabelYes: '是',
                        buttonLabelNo: '否'
                    });
                } else if (data.code === 0) {
                    self.importTutorial(import_mode);
                }
            })
        },
        importTutorial: function (import_mode) {
            if (this.model.importDetail.count() === this.model.selectedTutorial().length || this.model.importDetail.stop()) return;
            var importMode = import_mode, res_count = this.model.importDetail.res_count, tutorial = this.model.importDetail.tutorial;
            var data = {
                    ids: []
                },
                selected = ko.mapping.toJS(this.model.selectedTutorial),
                searchTemp = ko.mapping.toJS(this.model.searchTemp),
                self = this,
                detail = this.model.importDetail,
                i = detail.count();
            data.ids[0] = selected[i].identifier;
            data = $.extend(data, searchTemp);
            $('#loading-modal').modal('show');
            detail.title(selected[i].title);
            detail.isPosting(true);
            xhr = store.create(importMode, data).done(function (res) {
                tutorial(tutorial() + 1);
                res_count(res_count() + res[0].resource_count);
                selected[i].import_status = 1;
                detail.items.push(selected[i]);
            }).fail(function () {
                selected[i].import_status = 0;
                detail.items.push(selected[i]);
            }).always(function () {
                detail.count(detail.count() + 1);
                detail.isPosting(false);
                if (!self.model.importDetail.stop()) self.importTutorial(importMode);
            });
        },
        closeImport: function () {
            if (this.model.importDetail.count() === this.model.selectedTutorial().length) {
                $('#loading-modal').modal('hide');
            } else {
                var self = this;
                $.fn.dialog2.helpers.confirm("关闭将终止导入剩余教材，是否确定？", {
                    "confirm": function () {
                        self.model.importDetail.stop(true);
                        $('#loading-modal').modal('hide');
                        xhr.abort();
                    },
                    buttonLabelYes: '是',
                    buttonLabelNo: '否'
                });
            }
        },
        resetImportDetail: function () {
            var detail = this.model.importDetail;
            detail.count(0);
            detail.isPosting(false);
            detail.items([]);
            detail.title('');
            detail.stop(false);
            detail.res_count(0);
            detail.tutorial(0);
        },
        formatQuery: function () {
            var search = ko.mapping.toJS(this.model.search);
            search.words = $.trim(search.words);

            search.edition = search.edition ? search.edition.target.nd_code : '*';
            search.subject = search.subject ? search.subject.target.nd_code : '*';
            search.classes = search.classes ? search.classes.target.nd_code : '*';
            search.period = search.period ? search.period.target.nd_code : '*';
            search.category = 'K12/' + search.period + '/' + search.classes + '/' + search.subject + '/' + search.edition + '/*';

            search.period = undefined;
            search.classes = undefined;
            search.subject = undefined;
            search.edition = undefined;
            return search;
        },
        updateSearchTemp: function () {
            var search = ko.mapping.toJS(this.model.search),
                searchTemp = this.model.searchTemp;
            searchTemp.grade_tag.name(search.classes ? search.classes.target.title : '');
            searchTemp.grade_tag.path(search.classes ? search.classes.pattern_path : '');
            searchTemp.grade_tag.code(search.classes ? search.classes.target.nd_code : '');
            searchTemp.subject_tag.name(search.subject ? search.subject.target.title : '');
            searchTemp.subject_tag.path(search.subject ? search.subject.pattern_path : '');
            searchTemp.subject_tag.code(search.subject ? search.subject.target.nd_code : '');
        },
        statusName: function (status) {
            var sName = '待处理';
            switch (status) {
                case 'CREATING':
                case 'CREATED':
                case 'AUDIT_WAITING':
                case 'EDITING':
                case 'EDITED':
                    sName = '待处理';
                    break;
                case 'TRANSCODE_WAITING':
                    sName = '等待转码';
                    break;
                case 'TRANSCODED':
                case 'TRANSCODING':
                    sName = '转码中';
                    break;
                case 'TRANSCODE_ERROR':
                    sName = '转码失败';
                    break;
                case 'AUDITING':
                    sName = '一审通过';
                    break;
                case 'REJECT':
                case 'AUDIT_REJECT':
                    sName = '审核未通过';
                    break;
                case 'AUDITED':
                    sName = '二审通过';
                    break;
                case 'ONLINE':
                    sName = '已发布';
                    break;
                case 'OFFLINE':
                    sName = '已下架';
                    break;
                case 'REMOVED':
                    sName = '已删除';
                    break;
                case 'INIT':
                    sName = '资源初始化';
                    break;
                case 'PUBLISH_WAITING':
                    sName = '等待资源发布';
                    break;
                case 'PUBLISHING':
                    sName = '发布中';
                    break;
                case 'PUBLISHED':
                    sName = '发布完成';
                    break;
                case "TRANSCODED":
                    sName = '转码成功';
                    break;
                default:
                    sName = '待处理';
                    break;
            }
            return sName;
        },
        _page: function (count, offset, limit) {
            var self = this;
            $("#pagination").pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: "上一页",
                next_text: "下一页",
                callback: function (index) {
                    if (index != offset) {
                        self.model.search.page(index);
                        self._getList();
                    }
                }
            });
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery);
