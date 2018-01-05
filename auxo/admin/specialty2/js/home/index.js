(function (window, $) {
    var store = {
        getTree: function () {
            return $.ajax({
                url: '/' + projectCode + '/specialty/nodetree?is_show_all=1',
                type: 'GET'
            });
        },
        getUploadInfo: function () {
            return $.ajax({
                url: '/v1/upload_sessions',
                cache: false
            });
        },
        // 获取专业类别
        getProKind: function () {
            return $.ajax({
                url: window.envconfig.proApi + '/v1/manager/base/courses/prokinds'
            })
        },
        // 获取专业
        getPro: function (proKidId) {
            return $.ajax({
                url: window.envconfig.proApi + '/v1/manager/base/courses/pros/drop?couProKindId=' + proKidId
            })
        },
        search: function (data) {
            return $.ajax({
                url: window.envconfig.service + '/v1/specialty_plan_exts/search',
                data: data
            });
        },
        // 上线/下线
        changeStatus: function (data) {
            return $.ajax({
                url: window.envconfig.service + '/v1/specialty_plan_exts/status' + '?specialty_plan_ids=' +
                    data.specialty_plan_ids + '&status=' + data.status,
                type: 'PUT'
            })
        },
        // 复制培养计划
        copyPlans: function (data) {
            return $.ajax({
                url: window.envconfig.service + '/v1/specialty_plan_exts/' + data + '/actions/copy',
                type: 'POST'
            })
        },
        // 删除培养计划
        delete: function (data) {
            return $.ajax({
                url: window.envconfig.service + '/v1/specialty_plan_exts?specialty_plan_ids=' + data,
                type: 'DELETE'
            })
        }
    };
    var viewModel = {
        model: {
            filter: {
                name: '',
                pro_kind_id: '',
                pro_id: '',
                start_year: '',
                $offset: 0,
                $limit: 15
            },
            items: [],
            proKindList: [{id: '', title: '全部专业类别'}],
            proList: [],
            yearList: [{id: '', title: '全部年级'}],
            tree: {},
            delId: 0,
            listStyle: 'table',
            selectedArray: [],
            actionsType: '',
            actionsText: '',
            actionsResult: '成功',
            server_url: ''
        },
        init: function () {
            var t = this
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

            this.model.filter.pro_kind_id.subscribe(function (v) {
                store.getPro(v).then(function (res) {
                    if (res.ttl) {
                        var pros = [{id: '', title: '全部专业'}]
                        res.rows.forEach(function (v) {
                            pros.push({id: v.cou_pro_id, title: v.name})
                        })
                        t.model.proList(pros)
                    } else {
                        t.model.proList([])
                    }
                })
                t.search()
            }, this.model);

            this.model.filter.pro_id.subscribe(function () {
                t.search()
            })

            this.model.filter.start_year.subscribe(function () {
                t.search()
            }, this.model)

            store.getUploadInfo().then(function (res) {
                t.model.server_url(res.server_url)
                t.list();
            })
            this.init2();//初始化三个下拉框
            this._eventInit();//加载事件
        },
        init2: function () {
            var t = this;
            store.getProKind().then(function (res) {
                if (res.ttl) {
                    var proKinds = [{id: '', title: '全部专业类别'}]
                    res.rows.forEach(function (v) {
                        proKinds.push({id: v.cou_pro_kind_id, title: v.name})
                    })
                    t.model.proKindList(proKinds)
                }
            })
            store.getPro('').then(function (res) {
                if (res.ttl) {
                    var pros = [{id: '', title: '全部专业'}]
                    res.rows.forEach(function (v) {
                        pros.push({id: v.cou_pro_id, title: v.name})
                    })
                    t.model.proList(pros)
                } else {
                    t.model.proList([])
                }
            })
            t.model.yearList(t.getYear())
        },
        /**
         * 生成年级下拉框内容，当前年+前十年+后五年
         * @param {Number} year 参考点,非必传
         */
        getYear: function (year) {
            var flag = year || new Date().getFullYear()
            var startYear = flag - 11
            var ys = [{id: '', title: '全部年级'}]
            var i = 1
            while (i < 17) {
                ys.push({id: startYear + i, title: startYear + i})
                i++
            }
            return ys
        },
        /**
         * 构造封面URL
         */
        getCoverImg: function (id) {
            if (!id) {
                return ''
            }
            return 'http://' + this.model.server_url() + '/v0.1/download?dentryId=' + id
        },
        list: function () {
            var t = this;
            store.search(ko.mapping.toJS(this.model.filter)).then(function (returnData) {
                var items = returnData.items;
                items.forEach(function (v) {
                    v.cover = t.getCoverImg(v.cover)
                })
                t.model.items(items);
                t.pagination(returnData.count, t.model.filter.$offset());
                t.model.selectedArray([])
            });
        },
        search: function () {
            var t = this
            t.model.filter.$offset(0);
            store.search(ko.mapping.toJS(this.model.filter)).then(function (res) {
                var items = res.items
                items.forEach(function (v) {
                    v.cover = t.getCoverImg(v.cover)
                })
                t.model.items(items)
                t.pagination(res.count, t.model.filter.$offset())
                t.model.selectedArray([])
            })
        },
        del: function (obj, evt) {
            this.delId = obj.id;
            $('#delpop').modal();
        },
        delConfirm: function () {
            var t = this;
            store.delete(this.delId).done(function () {
                $('#delpop').modal('hide');
                t.list();
            });
        },
        switchListStyle: function (style) {
            this.model.listStyle(style)
        },
        // 列表勾选
        checkClick: function (item) {
            var selectedArray = this.model.selectedArray
            var index = this.model.selectedArray.indexOf(item)
            if (index > -1) {
                this.model.selectedArray.remove(item);
            } else {
                this.model.selectedArray.push(item)
            }
        },
        // 选择所有列表项
        selectedAll: function () {
            var selectedArray = this.model.selectedArray
            var items = this.model.items
            if (selectedArray().length !== items().length) {
              this.model.selectedArray(items().concat())
            } else {
                this.model.selectedArray([])
            }
        },
        // 批量操作选择
        actions: function (type) {
            var text = ''
            this.model.actionsType(type)
            
            switch (type) {
                case 'online':
                    text = '上线'
                    break
                case 'offline':
                    text = '下线'
                    break
                case 'copy':
                    text = '复制'
                    break
                default:
                    text = '删除'
            }
            this.model.actionsText(text)
            $('#actionspop').modal()
        },
        // 批量操作结果弹窗提示
        actionsPop: function (text) {
            this.model.actionsResult = text
            $('#actionsTipsPop').modal()
            setTimeout(function () {
                $('#actionsTipsPop').modal('hide')
            }, 2000)
        },
        // 批量操作确认
        actionsConfirm: function () {
            var t = this
            var ids = []
            var status = ''
            for (var i = 0; i < t.model.selectedArray().length; i++) {
                ids.push(t.model.selectedArray()[i].id)
            }
            switch (t.model.actionsType()) {
                // 上/下线
                case 'online':
                case 'offline':
                    status = t.model.actionsType() === 'online' ? 1 : 0
                    store.changeStatus({
                        specialty_plan_ids: ids.join(','),
                        status: status
                    }).done(function () {
                        // t.actionsPop('成功')
                        t.list()
                        $('#actionspop').modal('hide')
                    }).fail(function () {
                        // t.actionsPop('失败')
                        $('#actionspop').modal('hide')
                    })
                    break
                // 复制
                case 'copy':
                    store.copyPlans(ids.join(','))
                        .done(function () {
                            // t.actionsPop('成功')
                            $('#actionspop').modal('hide')
                            t.search()
                        })
                        .fail(function () {
                            // t.actionsPop('失败')
                            $('#actionspop').modal('hide')
                        })
                    break
                // 删除
                case 'del':
                    store.delete(ids.join(','))
                        .done(function () {
                            // t.actionsPop('成功')
                            $('#actionspop').modal('hide')
                            t.list()
                        })
                        .fail(function () {
                            // t.actionsPop('失败')
                            $('#actionspop').modal('hide')
                        })
                    break
                default:
                    return
            }
        },
        pagination: function (total, offset) {
            var that = this;
            $('#pagination').pagination(total, {
                items_per_page: that.model.filter.$limit(),
                num_display_entries: 5,
                current_page: offset / that.model.filter.$limit(),
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function (pageNum) {
                    if (pageNum != offset / that.model.filter.$limit()) {
                        that.model.filter.$offset(pageNum * that.model.filter.$limit());
                        that.list();
                    }
                }
            });
        },
        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventInit: function () {
            var _self = this,
                $jsRequire = $('#js-require');
            //item操作事件集
            $jsRequire.on('click', '.item-check', function () {
                var $checkItem = $(this),
                    hasCheck = $checkItem.hasClass('active');
                $jsRequire.find('.item-check').removeClass('active');
                if (!hasCheck) {
                    $checkItem.addClass('active');
                }
            });
            //回车搜索
            $('#js-query').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    _self.search()
                }
            });
        },
    };

    $(function () {
        viewModel.init();
    });
})(window, jQuery);
