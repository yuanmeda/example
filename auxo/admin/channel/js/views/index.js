(function ($) {

    var PREFIX = '/' + projectCode;
    var store = {
        query: function (data) {
            return $.ajax({
                url: PREFIX + '/channels/actions/query',
                cache: false,
                data: data
            })
        },
        create: function (data) {
            return $.ajax({
                url: PREFIX + '/channels',
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'appliction/json'
            })
        },
        move: function (id, nextId) {
            return $.ajax({
                url: PREFIX + '/channels/' + id + '/actions/move',
                type: 'PUT',
                data: JSON.stringify({
                    nextId: nextId
                })
            })
        },
        toggle: function (id, status) {
            return $.ajax({
                url: PREFIX + '/channels/' + id + '/actions/toggle',
                type: 'PUT',
                data: JSON.stringify({
                    status: status
                })
            })
        },
        remove: function (id) {
            return $.ajax({
                url: PREFIX + '/channels/' + id,
                type: 'DELETE'
            })
        }
    };
    var viewModel = {

        model: {
            items: [],
            count: 0,
            item: {
                title: '',
                web_enabled: true,
                mobile_enabeld: true,
                source_type: 1,
                web_url: '',
                mobile_url: '',
                url_redirect_mode: 1,
                is_visible: true,
                context_id: ''
            },
            search:{
                keyword: '',
                size: 20
            },
            init: false
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.validationBind();
            ko.applyBindingsWithValidation(this,{
                errorMessageClass: 'text-danger'
            });
            this.query();
        },
        validationBind: function () {
            var item = this.model.item;
            item.title.extend({
                required:{
                    params: true,
                    message: '请输入频道名'
                },
                maxLength: {
                    params: 20,
                    message: '频道名长度不能超过20个字符'
                },
                pattern: {
                    params: "^[0-9a-zA-Z\u4E00-\u9FA5]+$",
                    message: '请输入正确的字符、数字或字母！'
                }
            });
            item.mobile_url.extend({
                required:{
                    params: true,
                    message: '请输入移动端地址',
                    onlyIf: function(){
                        return item.source_type() == 2
                    }
                },
                maxLength: {
                    params: 100,
                    message: '移动端地址长度不能超过100个字符'
                },
                url:{
                    params: true,
                    message: '请输入合法的移动端地址'
                }
            });
            item.web_url.extend({
                required:{
                    params: true,
                    message: '请输入WEB端地址',
                    onlyIf: function(){
                        return item.source_type() == 2
                    }
                },
                maxLength: {
                    params: 100,
                    message: 'WEB端地址长度不能超过100个字符'
                },
                url:{
                    params: true,
                    message: '请输入合法的WEB端地址'
                }
            });
        },
        query: function () {
            var that = this,
                search = ko.mapping.toJS(this.model.search);
            store.query(search)
                .then(function (res) {
                    that.model.items(res.items);
                    that.model.count(res.total);
                    that.model.init(true);
                })
        },
        create: function () {
            var ref = ko.validation.group(this.model.item);
            if(ref().length){
                ref.showAllMessages();
                return;
            }
            var data = ko.mapping.toJS(this.model.item);
            if(!data.web_enabled && !data.mobile_enabeld){
                $.simplyToast('请选择启用范围','danger');
                return;
            }
            this.toggleCreateModal();
            store.create(data)
                .then($.proxy(this.query, this));
        },
        move: function (index, $data, evt) {
            var target = $(evt.target);
            if (target.hasClass('disabled')) return;
            var item = this.model.items()[index];
            var id = '';
            if (item) id = item.id;
            store.move($data.id, id)
                .then($.proxy(this.query, this));
        },
        toggle: function (status, id) {
            var that = this;
            bootbox.confirm({
                title: '系统提示',
                message: '是否切换当前频道状态',
                buttons:{
                    confirm:{
                        label: '确认'
                    },
                    cancel:{
                        label: '取消'
                    }
                },
                callback: function(result){
                    if(!result) return;
                    store.toggle(id,Number(!status)).then($.proxy(that.query, that));
                }
            })
        },
        remove: function ($data) {
            var  that = this,
                 id = $data.id;
            bootbox.dialog({
                title: '系统提示',
                message: '<p>删除频道，频道中的相关设置、布局将会全部删除，且无法回复，频道下资源的引用关系将会删除，资源不会删除，\
                在资源吃中仍然可以看到。<br/><br/> 您可以“停用频道“，以便在需要时再次启用</p>',
                buttons: {
                    cancel: {
                        label: '取消'
                    },
                    test: {
                        label: '删除频道',
                        className: 'btn-danger',
                        callback: function () {
                            store.remove(id).then($.proxy(that.query, that));
                        }
                    },
                    confirm: {
                        label: '停用频道',
                        className: 'btn-info',
                        callback: function () {
                            store.toggle(id, 0).then($.proxy(that.query, that));
                        }
                    }
                }
            })
        },
        formatTime: function (time) {
            time = time.replace('T',' ').substring(0,19);
            return time
        },
        toggleCreateModal: function (reset) {
            if (reset === true)
                ko.mapping.fromJS({
                    title: '',
                    web_enabled: true,
                    mobile_enabeld: true,
                    source_type: 1,
                    web_url: '',
                    mobile_url: '',
                    url_redirect_mode: 1,
                    is_visible: true,
                    context_id: ''
                }, {}, this.model.item);
            $('#js_dialog-create').modal('toggle');
        },
    };

    $(function () {
        viewModel.init();
    })

})(jQuery);