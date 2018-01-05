/*!
 * 我的笔记组件
 */
(function ($, window) {

    var STATIC_URL = window['staticUrl'];
    var apiHost = gaea_js_properties.auxo_note_api;

    'use strict';
    /**
     * 我的笔记数据模型
     * @param {Object} params 模块参数(projectCode:项目标识)
     */
    function NoteModel(params) {
        var vm = this;
        this.model = {
            tabIndex: 3,   //3:我的笔记，2:全部笔记
            tabHotIndex: 0,  //1：最热  2：最新
            totalCount: 0, //总共笔记
            noteCardList: [],  //我的笔记卡片列表
            allNoteList: [],   //全部笔记列表
            allNoteCounts: 0,  //全部笔记
            detailIndex: 1,   //1：我的笔记卡片，2：单一课程笔记列表，3：多课程笔记列表
            noteBookTitle: {},  //笔记详情列表的头部
            note_number1: 0,
            titleList: [], //我的笔记课程题目列表
            noteNickName: params.noteNickName,
            showNoteBookId: 0,
            deleteNoteId: null,//要删除的笔记的ID
            myNoteitems: [], //我的笔记详情列表
            isLoading: false,
            isShowPopEditor1: false, // 是否弹出弹窗编辑器
            isShowPopEditor: false, // 是否弹出弹窗编辑器
            editNote: null, // 待编辑的笔记
            showDelete1: false, //展示是否删除弹窗
            showDelete: false, //展示是否删除弹窗
            filter: {   //控制tabIndex 2的分页
                order_by: 0,
                keyword: '',
                page: 0,
                size: 20
            },
            pager3: {   //控制卡片列表分页
                page: 0,
                size: 6
            },
            filter1: {  //控制笔记详情分页
                unit_id: 0,
                notebook_id: 0,
                has_child: false,
                page: 0,
                size: 20
            },
            init: {
                gotten: false,
                applying: false
            },
            more: {
                myNote: false,
                gotten: false,
                applying: false
            }

        };
        this.options1 = {
            userId: window.userId,
            isLogin: true,
            showExcerpt: true,
            showBlowing: true,
            showEdit: false,
            showDel: false,
            apiHost: apiHost,
            onEditCommand: function (note) {
                console.log(note);
                vm.model.editNote(note);
                vm.model.isShowPopEditor1(true);
            },
            onDelCommand: function (id) {
                vm.model.deleteNoteId(id);
                vm.model.showDelete1(true);
            }
        };
        this.options2 = {
            userId: window.userId,
            isLogin: true,
            showExcerpt: false,
            showBlowing: false,
            showEdit: true,
            showDel: true,
            apiHost: apiHost,
            onEditCommand: function (note) {
                vm.model.editNote(note);
                vm.model.isShowPopEditor(true);
            },
            onDelCommand: function (id) {
                vm.model.deleteNoteId(id);
                vm.model.showDelete(true);
            }
        };
        this.editorOptions1 = {
            apiHost: apiHost,
            courseUrl: gaea_js_properties.auxo_course_url,
            onCancelCommand: function () {
                vm.model.isShowPopEditor1(false);
            },
            onSubmitSuccess: function (newNote) {
                var index = -1;
                var list = vm.model.allNoteList;
                var i = 0, ln = list().length;
                for (; i < ln; i++) {
                    if (newNote.id === list()[i].id) {
                        index = i;
                        break;
                    }
                }
                list.splice(i, 1, newNote);
                vm.model.isShowPopEditor1(false);
            }
        };
        this.editorOptions2 = {
            apiHost: apiHost,
            courseUrl: gaea_js_properties.auxo_course_url,
            onCancelCommand: function () {
                vm.model.isShowPopEditor(false);
            },
            onSubmitSuccess: function (newNote) {
                var index = -1;
                var list = vm.model.myNoteitems;
                var i = 0, ln = list().length;
                for (; i < ln; i++) {
                    if (newNote.id === list()[i].id) {
                        index = i;
                        break;
                    }
                }
                list.splice(i, 1, newNote);
                vm.model.isShowPopEditor(false);
            }

        };

        // 数据仓库
        this.store = {
            // 获取我的笔记卡片列表
            getNoteCardList: function (data) {
                var url = gaea_js_properties.auxo_note_gateway + '/v1/my_notebooks';
                return $.ajax({
                    url: url,
                    type: 'GET',
                    data: data
                });
            },
            // //获取全部笔记列表和搜索
            getAllNoteList: function (filter) {
                var url = gaea_js_properties.auxo_note_gateway + '/v1/notes';
                return $.ajax({
                    url: url,
                    type: 'GET',
                    data: filter
                });
            },
            //获取有孩子的我的笔记列表题目
            getChildNoteList: function (filter) {
                var notebook_id = filter.notebook_id;
                var url = gaea_js_properties.auxo_note_gateway + '/v1/notebooks/' + notebook_id + '/noteBookAndChildren';
                return $.ajax({
                    url: url,
                    type: 'GET',
                    data: {
                        unit_id: filter.unit_id
                    }
                });
            },

            //获取有孩子的我的笔记列表详情 和  有孩子的我的笔记列表详情
            getChildNoteDetail: function (data) {
                var url = gaea_js_properties.auxo_note_gateway + '/v1/notebooks/' + data.notebook_id + '/my_notes';
                return $.ajax({
                    url: url,
                    type: 'GET',
                    data: data
                });
            },

            //获取无孩子的我的笔记题目
            getNoChildNoteList: function (filter) {
                var notebook_id = filter.notebook_id;
                var url = gaea_js_properties.auxo_note_gateway + '/v1/notebooks/' + notebook_id;
                return $.ajax({
                    url: url,
                    type: 'GET',
                    data: {
                        unit_id: filter.unit_id
                    }
                });
            },
            //删除笔记
            deleteNotes: function (note_id) {
                var url = apiHost + '/v1/notes/' + note_id;
                return $.ajax({
                    url: url,
                    type: 'DELETE'
                });
            },
            // 获取我的笔记总数
            getNoteCounts: function () {
                var url = gaea_js_properties.auxo_note_gateway + '/v1/my_notes';
                return $.ajax({
                    url: url,
                    type: 'GET'
                });
            }
        };
        this.initModel();
    }

    /**
     * ko组件共享事件定义
     * @type {Object}
     */
    NoteModel.prototype = {
        initModel: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.noteBookTitle = ko.observable(this.model.noteBookTitle);
            this.model.editNote = ko.observable(null);
            this.initData();
        },
        /**
         * 初始化数据
         */
        initData: function () {
            if (typeof __mode != 'undefined' && __mode != -1) {
                this.switchTab(__mode);
                $('.n-ui-tab2').remove();
            } else {
                this.switchTab(3);
            }
        },
        getNodeCardList: function () {
            var that = this;
            var pager = ko.toJS(that.model.pager3);
            this.model.detailIndex(1);
            this.model.isLoading(true);
            this.store.getNoteCardList({page: pager.page, size: pager.size}).done(function (data) {
                $.each(data.items, function (i, v) {
                    if (!v.cover_url) {
                        v.cover_url = STATIC_URL + "auxo/front/certificate/images/course.png";
                    } else {
                        v.cover_url += '!m270x180.jpg';
                    }
                });

                that.model.noteCardList(data.items || []);
                that.page3(data.count, that.model.pager3.page());
                that.model.isLoading(false);
            });
            this.store.getNoteCounts().then(function (data) {
                that.model.totalCount(data.count);
            })
        },
        enterPress: function (obj, evt) {
            if (evt.keyCode == 13) {
                this.searchNote();
            }
        },
        /**
         *
         * @param 切换我的笔记和全部笔记tabIndex
         */
        switchTab: function (tabIndex, page) {
            var that = this;
            //我的笔记卡片

            if (page === 0) { //切换tabIndex时页码置0
                that.model.pager3.page(0);
                that.model.filter.page(0);
            }
            if (tabIndex === 3) {
                that.getNodeCardList();
            }
            // 全部笔记
            if (tabIndex === 2) {
                this.model.detailIndex(1);
                this.switchHotTab(1);  //初始是最热
            }
            this.model.tabIndex(tabIndex);
        },
        /**
         *
         * @param 切换最热和最新tabIndex
         */
        switchHotTab: function (tabHotIndex, page) {
            var that = this;

            if (typeof page != 'undefined')
                that.model.filter.page(0);

            if (typeof tabHotIndex == 'undefined')
                tabHotIndex = that.model.tabHotIndex();

            this.model.filter.order_by(tabHotIndex);
            var filter = ko.mapping.toJS(this.model.filter);

            this.store.getAllNoteList(filter).done(function (data) {
                that.model.allNoteList(data.items || []);
                that.model.allNoteCounts(data.count);
                that.page2(data.count, that.model.filter.page());
            });

            this.model.tabHotIndex(tabHotIndex);

        },
        /**
         *
         * @param 点击进入笔记详情
         */
        detailNote: function (has_child, unit_id, notebook_id, page) {
            var that = this;

            if (typeof page != 'undefined')
                this.model.filter1.page(0);


            if (typeof has_child != 'undefined')
                this.model.filter1.has_child(has_child);

            if (typeof unit_id != 'undefined')
                this.model.filter1.unit_id(unit_id);

            if (typeof notebook_id != 'undefined')
                this.model.filter1.notebook_id(notebook_id);

            var filter = ko.mapping.toJS(this.model.filter1);


            if (has_child) {
                this.model.detailIndex(3);  //含有笔记本
                this.store.getChildNoteList(filter).done(function (data) {
                    that.model.noteBookTitle(data.note_book_vo);
                    //todo
                    that.model.titleList(data.children_note_book_vos);
                })
            } else {
                this.model.detailIndex(2);  //无笔记本
                this.store.getNoChildNoteList(filter).done(function (data) {
                    that.model.noteBookTitle(data);
                    that.model.note_number1(data.note_number);
                });
                this.store.getChildNoteDetail(filter).done(function (data) {
                    that.model.myNoteitems(data.items);
                    that.page1(data.count, that.model.filter1.page());
                })
            }
        },
        /**
         *
         * @param 返回
         */
        comeBack: function (index) {
            this.model.detailIndex(index);
            this.switchTab(3, 0);
        },
        /**
         *
         * @param 点击查看折叠笔记列表
         */
        showChildren: function (data) {
            var that = this;
            var id = this.model.showNoteBookId();
            if (id != data.id)
                this.model.showNoteBookId(data.id);
            else
                this.model.showNoteBookId(0);

            this.store.getChildNoteDetail({notebook_id: data.id, page: 0, size: 9999}).then(function (data) {
                that.model.myNoteitems(data.items);
            })
        },
        /**
         *
         * @param 搜索
         */
        searchNote: function () {
            this.model.filter.page(0);
            var filter = ko.mapping.toJS(this.model.filter),
                that = this;
            this.store.getAllNoteList(filter).then(function (data) {
                that.model.allNoteList(data.items || []);
                that.model.allNoteCounts(data.count);
                that.page2(data.count, that.model.filter.page());
            })
        },
        /**
         *
         * @param 转换时间
         */
        forMatter: function (time) {
            if (!time)
                return '';

            var str = time.substring(0, 16);
            return str.replace('T', ' ');
        },
        /**
         *
         * @param 关闭删除框
         */
        closeDelete1: function () {
            this.model.showDelete1(false);
        },
        deleteNote1: function () {
            var _self = this;
            var id = this.model.deleteNoteId(), that = this;
            this.store.deleteNotes(id).then(function () {
                var arr = that.model.allNoteList;
                for (var i = 0; i < arr().length; i++) {
                    if (id == arr()[i].id) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            });
            this.model.showDelete1(false);
            this.model.allNoteCounts(this.model.allNoteCounts() - 1);
        },
        closeDelete: function () {
            this.model.showDelete(false);
        },
        deleteNote: function () {
            var _self = this;
            var id = this.model.deleteNoteId(), that = this;
            this.store.deleteNotes(id).then(function () {
                var arr = that.model.myNoteitems;
                for (var i = 0; i < arr().length; i++) {
                    if (id == arr()[i].id) {
                        arr.splice(i, 1);
                        break;
                    }
                }
                _self.model.noteBookTitle().note_number = _self.model.noteBookTitle().note_number - 1;
                _self.model.note_number1(_self.model.noteBookTitle().note_number);
                /*刷新页面*/
                //setTimeout(_self.detailNote.bind(_self), 500);
            });
            this.model.showDelete(false);
        },
        page3: function (totalCount, currentPage) {
            var self = this;
            $('#pagination3').pagination(totalCount, {
                items_per_page: self.model.pager3.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: function (pageNum) {
                    if (pageNum != currentPage) {
                        self.model.pager3.page(pageNum);
                        self.switchTab(3);
                    }
                }
            });
        },
        page2: function (totalCount, currentPage) {
            var self = this;
            $('#pagination2').pagination(totalCount, {
                items_per_page: self.model.filter.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: function (pageNum) {
                    if (pageNum != currentPage) {
                        self.model.filter.page(pageNum);
                        self.switchHotTab();
                    }
                }
            });
        },
        page1: function (totalCount, currentPage) {
            var self = this;
            $('#pagination1').pagination(totalCount, {
                items_per_page: self.model.filter1.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: function (pageNum) {
                    if (pageNum != currentPage) {
                        self.model.filter1.page(pageNum);
                        self.detailNote();
                    }
                }
            });
        }
    };

    /**
     * 注册ko组件my-certificate
     */
    ko.components.register('x-my-note', {
        synchronous: true,
        viewModel: NoteModel,
        template: '<div class="n-mod-user-center n-mod-mynote">\
                 <div class="n-ui-tab2">\
                     <a data-bind="click:switchTab.bind($component,3,0,$element), css: {\'on\': model.tabIndex() === 3}" href="javascript:;" class="btn-tab ">\
                         <!--ko translate:{key: "myStudy.myNote.myNotes"}-->\
                         <!--/ko -->\
                     </a>\
                     <a data-bind="click:switchTab.bind($component,2,0,$element), css: {\'on\': model.tabIndex() === 2}" href="javascript:;" class="btn-tab">\
                         <!--ko translate:{key: "myStudy.myNote.allNotes"}-->\
                         <!--/ko -->\
                     </a>\
                 </div>\
                 <div data-bind="visible: model.tabIndex() === 3 || model.tabIndex()=== 1">\
                     <div data-bind="visible: model.detailIndex() === 1">\
                         <p data-bind="visible: model.totalCount()" style="padding: 0 50px" class="user-tip">HI~<span data-bind="text: model.noteNickName"></span>\
                             <!--ko translate:{key: "myStudy.myNote.haveRecord"}-->\
                             <!--/ko -->\
                         <span class="strong" data-bind="text: model.totalCount"></span>\
                             <!--ko translate:{key: "myStudy.myNote.haveNotes"}-->\
                             <!--/ko -->\
                         </p>\
                         <ul data-bind="foreach:model.noteCardList, visible:model.noteCardList().length, style:{height: model.more.myNote() ? \'710px\' : \'auto\'}" class="u-ui-list"  style="padding-left:50px; overflow: hidden">\
                             <li class="u-ui-item">\
                                 <a class="item" href="javascript:;" data-bind="click: $component.detailNote.bind($component,has_child,unit_id,id,0)">\
                                     <div class="item-img">\
                                         <img class="lazy-image loaded" data-bind="attr:{src:cover_url}" style="display: inline;">\
                                     </div>\
                                     <div class="item-info">\
                                         <div class="item-info-title" data-bind="text: name"></div>\
                                         <div class="item-info-other">\
                                             <span class="strong" data-bind="text: note_number"></span>\
                                             <span>\
                                                 <!--ko translate:{key: "myStudy.myNote.haveNotes"}-->\
                                                 <!--/ko -->\
                                             </span>\
                                         </div>\
                                         <div class="item-info-foot">\
                                             <span class="item-info-tag">\
                                                 <!--ko translate:{key: "myStudy.myNote.updateTime"}-->\
                                                 <!--/ko -->\
                                             </span>\
                                             <span data-bind="text: $component.forMatter(update_time)"></span>\
                                         </div>\
                                     </div>\
                                 </a>\
                             </li>\
                         </ul>\
                         <div class="note-empty" data-bind="visible: model.noteCardList().length <= 0">\
                             <i class="note-empty-icon"></i>\
                             <p class="note-empty-tips">\
                                 <!--ko translate:{key: "myStudy.myNote.noRecordNote"}-->\
                                 <!--/ko -->\
                             </p>\
                             <a class="note-empty-btn" data-bind="click:switchTab.bind($component,2,$element)">\
                                 <!--ko translate:{key: "myStudy.myNote.seeOthersNote"}-->\
                                 <!--/ko -->\
                             </a>\
                         </div>\
                     </div>\
                     <div data-bind="visible: model.detailIndex() === 3">\
                         <p class="user-tip2 pdl20" ><span data-bind="text: model.noteBookTitle().name"></span>\
                             <span class="ml10 mr10">/</span>\
                                 <!--ko translate:{key: "myStudy.myNote.total"}-->\
                                 <!--/ko -->\
                             <span class="strong" data-bind="text: model.note_number"></span>\
                                 <!--ko translate:{key: "myStudy.myNote.notes"}-->\
                                 <!--/ko -->\
                             <span class="ml10 mr10">/</span>\
                                 <!--ko translate:{key: "myStudy.myNote.updateAt"}-->\
                                 <!--/ko -->\
                             <span data-bind="text: forMatter(model.noteBookTitle().update_time)"></span>\
                             <a href="javascript:;" class="btn-return" style="margin-right: 30px;" data-bind="click: $component.comeBack.bind($component,1)">\
                                 <!--ko translate:{key: "myStudy.myNote.comeBack"}-->\
                                 <!--/ko -->\
                             </a>\
                         </p>\
                         <!--ko foreach: model.titleList-->\
                             <div class="note-wrap"  data-bind="css: {\'on\': $component.model.showNoteBookId()==id}" >\
                                 <div class="note-wrap-btn" data-bind="click: $component.showChildren.bind($component)">\
                                      <span class="tit">\
                                          <!--ko translate:{key: "myStudy.myNote.course"}-->\
                                          <!--/ko -->\
                                      <span data-bind="text: name"></span></span>\
                                      <span class="info">\
                                          <!--ko translate:{key: "myStudy.myNote.total"}-->\
                                          <!--/ko -->\
                                      <span class="strong" data-bind="text: note_number"></span>\
                                          <!--ko translate:{key: "myStudy.myNote.notes"}-->\
                                          <!--/ko -->\
                                      <span class="ml10 mr10">/</span>\
                                          <!--ko translate:{key: "myStudy.myNote.updateAt"}-->\
                                          <!--/ko -->\
                                      <span data-bind="text: $component.forMatter(update_time)"></span></span>\
                                 </div>\
                                 <div class="n-ui-note-item person-note">\
                                     <!--ko foreach: $component.model.myNoteitems-->\
                                         <div data-bind="component:{name: \'x-note-item-a\', params:{note: $data, options: $component.options2}}"></div>\
                                     <!--/ko-->\
                                 </div>\
                             </div>\
                         <!--/ko-->\
                     </div>\
                     <div data-bind="visible: model.detailIndex() === 2">\
                         <p class="user-tip2 pdl20" ><span data-bind="text: model.noteBookTitle().name"></span>\
                             <span class="ml10 mr10">/</span>\
                                 <!--ko translate:{key: "myStudy.myNote.total"}-->\
                                 <!--/ko -->\
                             <span class="strong" data-bind="text: model.note_number"></span>\
                                 <!--ko translate:{key: "myStudy.myNote.notes"}-->\
                                 <!--/ko -->\
                             <span class="ml10 mr10">/</span>\
                                 <!--ko translate:{key: "myStudy.myNote.updateAt"}-->\
                                 <!--/ko -->\
                             <span data-bind="text:forMatter(model.noteBookTitle().update_time)"></span>\
                             <a href="javascript:;" class="btn-return" style="margin-right: 30px;" data-bind="click: $component.comeBack.bind($component,1)">\
                                 <!--ko translate:{key: "myStudy.myNote.comeBack"}-->\
                                 <!--/ko -->\
                             </a>\
                         </p>\
                         <!--我的笔记-->\
                         <div class="n-ui-note-item person-note">\
                             <!--ko foreach: $component.model.myNoteitems-->\
                                 <div data-bind="component:{name: \'x-note-item-a\', params:{note: $data, options: $component.options2}}"></div>\
                             <!--/ko-->\
                         </div>\
                     </div>\
                 </div>\
                 <div data-bind="visible: model.tabIndex() === 2">\
                     <div class="edupf-faq-content" style="padding-left:0px;">\
                        <div class="filter-bar clearfix">\
                            <div class="search-con-usercenter fr clearfix">\
                                <input id="searchEvent" data-bind="value: model.filter.keyword, event: {keyup: $component.enterPress.bind($component)}" class="input-area" type="text" placeholder="请输入笔记内容关键词" />\
                                <a data-bind=" click: $component.searchNote" class="btn-search-fake" href="javascript:;"><i></i></a>\
                            </div>\
                        </div>\
                        <div class="usercenter-tab">\
                            <a data-bind="click:switchHotTab.bind($component,1,0,$element), css: {\'on\': model.tabHotIndex() === 1}" href="javascript:;">\
                                 <!--ko translate:{key: "myStudy.myNote.Hot"}-->\
                                 <!--/ko -->\
                            </a>\
                            <a class="btn-tab" data-bind="click:switchHotTab.bind($component,0,0,$element), css: {\'on\': model.tabHotIndex() === 0}" href="javascript:;">\
                                 <!--ko translate:{key: "myStudy.myNote.New"}-->\
                                 <!--/ko -->\
                            </a>\
                        </div>\
                        <div class="edupf-all-notes-con"></div>\
                     </div>\
                     <!--ko foreach: model.allNoteList-->\
                        <div data-bind="component:{name: \'x-note-item-a\', params:{note: $data, options: $component.options1}}"></div>\
                     <!--/ko-->\
                     <div class="note-empty" data-bind="visible: model.allNoteCounts() == 0">\
                        <i class="note-empty-icon"></i>\
                        <p class="note-empty-tips">\
                            <!--ko translate:{key: "myStudy.myNote.NoNotes"}-->\
                            <!--/ko -->\
                        </p>\
                     </div>\
                </div>\
                <!--ko if:model.isShowPopEditor1()-->\
                <div data-bind="component:{name: \'x-note-editor\', params:{note:$component.model.editNote(), options: $component.editorOptions1}}"></div>\
                <!--/ko-->\
                <!--ko if:model.isShowPopEditor()-->\
                <div data-bind="component:{name: \'x-note-editor\', params:{note:$component.model.editNote(), options: $component.editorOptions2}}"></div>\
                <!--/ko-->\
                <div class="u-ui-mask" data-bind="visible: model.showDelete()">\
                    <div class="u-ui-pop adjustPopPosition">\
                        <h3 class="pop-tit"><span class="tit-left">\
                            <!--ko translate:{key: "myStudy.myNote.tip"}-->\
                            <!--/ko -->\
                        </span><span class="pop-close" data-bind="click: $component.closeDelete"></span></h3>\
                        <div class="pop-content">\
                            <p class="tip">\
                               <!--ko translate:{key: "myStudy.myNote.sureDelete"}-->\
                               <!--/ko -->\
                            </p>\
                        </div>\
                        <div class="pop-footer">\
                            <a href="javascript:;" class="u-ui-btn" data-bind="click: $component.deleteNote">\
                               <!--ko translate:{key: "myStudy.myNote.sure"}-->\
                               <!--/ko -->\
                            </a>\
                            <a href="javascript:;" class="u-ui-btn ml10" data-bind="click: $component.closeDelete">\
                               <!--ko translate:{key: "myStudy.myNote.cancle"}-->\
                               <!--/ko -->\
                            </a>\
                        </div>\
                    </div>\
                </div>\
                <div class="u-ui-mask" data-bind="visible: model.showDelete1()">\
                    <div class="u-ui-pop adjustPopPosition">\
                        <h3 class="pop-tit"><span class="tit-left">\
                            <!--ko translate:{key: "myStudy.myNote.tip"}-->\
                            <!--/ko -->\
                        </span><span class="pop-close" data-bind="click: $component.closeDelete1"></span></h3>\
                        <div class="pop-content">\
                            <p class="tip">\
                               <!--ko translate:{key: "myStudy.myNote.sureDelete"}-->\
                               <!--/ko -->\
                            </p>\
                        </div>\
                        <div class="pop-footer">\
                            <a href="javascript:;" class="u-ui-btn" data-bind="click: $component.deleteNote1">\
                               <!--ko translate:{key: "myStudy.myNote.sure"}-->\
                               <!--/ko -->\
                            </a>\
                            <a href="javascript:;" class="u-ui-btn ml10" data-bind="click: $component.closeDelete1">\
                               <!--ko translate:{key: "myStudy.myNote.cancle"}-->\
                               <!--/ko -->\
                            </a>\
                        </div>\
                    </div>\
                </div>\
                <div class="pagination-box" data-bind="visible: model.tabIndex() === 3 && model.detailIndex()==1" style="padding: 0 50px;height:40px">\
                    <div id="pagination3"></div>\
                </div>\
                <div class="pagination-box" data-bind="visible: model.tabIndex() === 2 && model.detailIndex()==1" style="padding: 0 50px;height:40px">\
                    <div id="pagination2"></div>\
                </div>\
                <div class="pagination-box" data-bind="visible:  model.detailIndex()==2" style="padding: 0 50px;height:40px">\
                    <div id="pagination1"></div>\
                </div>\
            </div>'
    });
})(jQuery, window);