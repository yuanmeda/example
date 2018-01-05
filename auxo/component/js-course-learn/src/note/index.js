import tpl from './template.html'
import ko from 'knockout'
import './note-add'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;
function getResourceName(res_type) {
    var result;
    switch (res_type) {
        case 0:
        case '101':
            result = 'video';
            break;
        case 1:
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
class ViewModel {
    constructor(params) {
        this.offset = 0;
        this.offsetAll = 0;
        this.oneTime = true;
        this.first = true;
        this.config = params.config;
        this.opts3 = {
            userId: window.userId,
            apiHost: this.config.urls.noteServiceUrl,
            isLogin: !!window.userId,
            showExcerpt: false,
            showBlowing: false,
            showEdit: true,
            showDel: true,
            onEditCommand: (note) => {
                this.model.createBuildNote.editNoteInfo(note);
            },
            onDelCommand: (id) => {
                $('.u-ui-mask').show();
                this.model.deleteId(id);
            }
        };
        this.opts4 = {
            userId: window.userId,
            apiHost: this.config.urls.noteServiceUrl,
            isLogin: !!window.userId,
            showExcerpt: true,
            showBlowing: true,
            showEdit: false,
            showDel: false
        };
        this.model = {
            scrollTopMy: ko.observable(null),
            scrollTopAll: ko.observable(null),
            deleteId: ko.observable(''),//待删除笔记的id
            myNoteList: ko.observableArray(),//我的笔记列表
            noQusMine: ko.observable(false),
            allNoteList: ko.observableArray(),//全部笔记列表
            noQusAll: ko.observable(false),
            isLoading: ko.observable(false),
            noteType: ko.observable(1),//切换类型，1为我的笔记，2为全部笔记
            buttonText: _i18nValue('courseLearn.note.add'),
            isShow: ko.observable(false),//切换显示，true显示我的笔记，false显示全部笔记
            total: ko.observable(0),//我的笔记数量
            allTotal: ko.observable(0),//全部笔记数量
            /*组件需要的*/
            createBuildNote: {
                biz_param: {
                    course_id: ko.observable(courseId),
                    resource_id: ko.observable(''),
                    resource_type: ko.observable(''),
                    course_title: ko.observable(''),
                    resource_title: ko.observable(''),
                    location: ko.observable('')
                },
                videoCurrentTime: ko.observable(''),
                docInfo: ko.observable(''),
                refreshNotes: ko.observable(false),
                editNoteInfo: ko.observable(null),
                excerpt_note_id: ko.observable(null),
                note_id: ko.observable(null)
            },
            filterMy: {
                page: ko.observable(0),
                size: ko.observable(20)
            },
            filterAll: {
                order_by: ko.observable(0),
                page: ko.observable(0),
                size: ko.observable(20)
            }
        };
        this.resource = ko.observable(null).subscribeTo('RESOURCE', this.resourceModify, this);
        this.model.playerData = ko.observable(null).subscribeTo('PLAYER_DATA', this.playerDataModify, this).publishOn('GET_PLAYER_DATA');
        this.store = {
            getMyNote: (filter) => {
                filter.target_id = getResourceName(this.resource().type) + ':' + this.resource().id;
                filter.course_id = this.config.courseId;
                return $.ajax({
                    url: `${this.config.urls.noteGatewayUrl}/v2/my_notes`,
                    data: filter,
                    cache: false
                });
            },
            getAllNote: (filter) => {
                filter.target_id = getResourceName(this.resource().type) + ':' + this.resource().id;
                filter.course_id = this.config.courseId;
                return $.ajax({
                    url: `${this.config.urls.noteGatewayUrl}/v2/notes`,
                    data: filter,
                    cache: false,
                });
            },
            deleteNote: (note_id) => {
                return $.ajax({
                    url: `${this.config.urls.noteServiceUrl}/v1/notes/${note_id}`,
                    type: 'delete'
                });
            }
        };
        this.init();
    }

    resourceModify(resource) {
        this.resource(resource);
        resource ? this.getNotes() : this.clearNotes();
    }

    clearNotes() {
        this.model.filterMy.page(0);
        this.model.filterMy.size(20);
        this.model.filterAll.page(0);
        this.model.filterAll.size(20);
        this.model.myNoteList([]);
        this.model.total(0);
        this.model.allNoteList([]);
        this.model.allTotal(0);
    }

    init() {
        var _self = this;
        if (window.innerHeight < 1000) {
            $('.note-tab-cont').css('height', '670px');
        }
        $('.note-tab-cont').on('scroll', function () {
            if ((this.scrollTop + this.clientHeight == this.scrollHeight) && _self.model.noteType() == '1') {
                if (_self.model.filterMy.page() == 0) {
                    _self.model.filterMy.page(1);
                }
                _self.model.filterMy.page(_self.model.filterMy.page() + 1);
                _self.model.filterMy.size(10);
                if (!_self.model.noQusMine()) {
                    _self.getMyNotes(true);
                }
            } else if ((this.scrollTop + this.clientHeight == this.scrollHeight) && _self.model.noteType() == '2') {
                if (_self.model.filterAll.page() == 0) {
                    _self.model.filterAll.page(1);
                }
                _self.model.filterAll.page(_self.model.filterAll.page() + 1);
                _self.model.filterAll.size(10);
                if (!_self.model.noQusAll()) {
                    _self.getAllNotes(true);
                }
            }
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
                }, 500);
                _self.model.createBuildNote.refreshNotes(false);
            }
        })
    }

    switchTab(type) {
        if (this.model.noteType() == type) return;
        this.model.noteType(type);
        if (type == '1') {
            this.model.isShow(true);
            this.model.filterMy.page(0);
            this.model.filterMy.size(20);
            if (this.resource()) this.getMyNotes();
        } else {
            this.model.isShow(false);
            this.model.filterAll.page(0);
            this.model.filterAll.size(20);
            if (this.resource()) this.getAllNotes();
        }

    }

    getMyNotes(flag) {
        let paramsMy = ko.mapping.toJS(this.model.filterMy);
        if(!userId)
            return;
        this.store.getMyNote(paramsMy).done((res) => {
            if (res && res.items && !flag) {
                this.model.myNoteList(res.items);
                this.model.total(res.count);
            } else {
                _.arrayForEach(res.items, (item) => {
                    this.model.myNoteList.push(item);
                });
                if (res.items.length) {
                    $('.note-tab-cont').scrollTop(0);
                } else {
                    this.model.noQusMine(true);
                }
            }
        });
    }

    getAllNotes(flag) {
        let paramsAll = ko.mapping.toJS(this.model.filterAll);
        this.store.getAllNote(paramsAll).done((res) => {
            if (res && res.items && !flag) {
                this.model.allNoteList(res.items);
                this.model.allTotal(res.count);
            } else {
                _.arrayForEach(res.items, (item) => {
                    this.model.allNoteList.push(item);
                });
                if (res.items.length) {
                    $('.note-tab-cont').scrollTop(0);
                } else {
                    this.model.noQusAll(true);
                }
            }
        });
    }

    getNotes() {
        if (this.resource()) {
            this.model.isShow(true);
            this.model.filterMy.page(0);
            this.model.filterMy.size(20);
            if (this.resource()) this.getMyNotes();
        }
    }

    playerDataModify(playerData) {
        if (playerData) {
            switch (playerData.resource.type) {
                case 0:
                    this.model.createBuildNote.videoCurrentTime(this.formatTime(playerData.currentPos));
                    break;
                case 1:
                    this.model.createBuildNote.docInfo(playerData.currentPos + '/' + playerData.resource.resource_data.page_count);
                    break;
            }
            /*编辑时resourceType会变成当前笔记的类型，所以这里要还原*/
            this.model.createBuildNote.biz_param.resource_id(playerData.resource.id);
            this.model.createBuildNote.biz_param.resource_type(playerData.resource.type);
            this.model.createBuildNote.biz_param.resource_title(playerData.resource.name);
            this.model.createBuildNote.excerpt_note_id(null);
            /*要删除原有笔记Id,否则更新某笔记过后再新建笔记还是会走更新接口*/
            this.model.createBuildNote.note_id(null);
            $('#tht').attr('checked', true);
            $('.add-note-input').removeClass('hide');
        }
    }

    /*显示笔记编辑*/
    showEdit() {
        this.model.playerData({});
    }

    /*格式化时间*/
    formatTime(val) {
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
    }

    /*确定删除*/
    confirmDelete() {
        this.store.deleteNote(this.model.deleteId()).done((res) => {
            $('.u-ui-mask').hide();
            $.each(this.model.myNoteList(), (index, item) => {
                if (item.id == this.model.deleteId()) {
                    this.model.myNoteList.splice(index, 1);
                    return false;
                }
            });
            this.model.total(this.model.total() - 1);
            /*setTimeout(function () {
             _self.model.note().viewModel.getNotes();
             }, 500)*/
        })
    }

    /*取消删除框*/
    deleteCancel() {
        $('.u-ui-mask').hide();
    }
}

ko.components.register('x-course-learn-note', {
    viewModel: ViewModel,
    template: tpl
});