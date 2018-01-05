
//ztree模态框
ko.components.register('catalogModal', {
    synchronous: true,
    viewModel: function (data) {
        this.model = ko.mapping.fromJS(data);
        this.data = data;
    },
    template: '<div class="modal fade" data-backdrop="static" data-bind="attr:{id:model.id}"><div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h3 data-bind="text:model.title"></h3></div>'+
                '<div class="modal-body"><ul id="tree" class="ztree"></ul></div>'+
                '<div class="modal-footer"><button class="btn btn-primary" data-bind="click: model.saveCatalog">确定</button><button class="btn" data-dismiss="modal" aria-hidden="true">关闭</button></div>'+
                '</div>'
});

//课程基本块
ko.components.register('courseItem', {
    synchronous: true,
    viewModel: function (data) {
        this.model = data.item;
        this.rule = data.rule;
    },
    template: 
    '<ul class="block-content item-list cf" data-bind="foreach: model">' + 
    '<li data-check class="item cf">' + 
        '<image-loader params="original:logo_url,element:$element,hasRule:!(/default/.test(logo_url)),container:\'#content\',imgRule:$parent.rule"></image-loader>' + 
        '<div class="item-dl">' + 
            '<div class="item-name ellipsis" data-bind="text: title, attr: { title: title }"></div>' + 
            '<div class="item-dd">' + 
                '<!--ko foreach:resources-->' +
                    '<!--ko if:type==1-->' +
                        '<span><i data-bind="text: count"></i>个视频<em></em></span>' +
                    '<!--/ko-->' +
                    '<!--ko if:type==2-->' +
                        '<span><i data-bind="text: count"></i>个文档<em></em></span>' +
                    '<!--/ko-->' +
                    '<!--ko if:type==3-->' +
                        '<span><i data-bind="text: count"></i>个练习</span>' +
                    '<!--/ko-->' +
                '<!--/ko-->' +
            '</div>' +
        '</div>' +
        '<div class="item-label-box">' +
            // '<i class="item-label" data-bind="text: status == 0 ? \'下线\' : \'上线\',css:{ \'off\':!status,\'\':status }"></i>' +
        '</div>' +
        '<a class="item-remove" href="javscript:;" data-bind="click:function(){$root.setCourse({id:id})}">' +
            '<i class="icon-close"></i>' +
        '</a>' +
        '<div class="mask"></div>' +
    '</li>' +
'</ul>'
});

//培训职业基本块
ko.components.register('otherItem', {
    synchronous: true,
    viewModel: function (data) {
        this.event = data.event;
        this.type=data.type;
        this.model = data.item;
        this.rule = data.rule;
    },
    template:
        '<li data-check class="item cf" data-bind="with:model">' + 
        '<a href="javascript:;" data-bind="attr: { title: title },click:function(){$root.directToDetail($component,$parent.type);}">' +
            '<image-loader params="original:logo_url,element:$element,hasRule:!(/default/.test(logo_url)),container:\'#content\',imgRule:$parent.rule"></image-loader>' + 
            '<div class="item-dl">' + 
                '<div class="item-name ellipsis" data-bind="text: title, attr: { title: title }"></div>' + 
                '<div class="item-dd">' + 
                    '<span><i data-bind="text: course_count"></i>门课程<em></em></span>' +
                    '<span><i data-bind="text: total_hour"></i>学时</span>' +
                '</div>' +
            '</div>' +
        '</a>' +
        '<div class="item-label-box">' +
            '<i class="item-label" data-bind="text: status == 0 ? \'下线\' : \'上线\',css:{ \'off\':status == 0,\'\':status == 2 }"></i>' +
        '</div>' +
        '<a class="item-remove" href="javscript:;" data-bind="click:function(){$parent.event({id:id})},attr:{title:($parent.type===\'job\'?\'从职业规划中删除\':\'从培训认证中删除\')}">' +
            '<i class="icon-close"></i>' +
        '</a>' +
        '<div class="mask"></div>' +
    '</li>'
});

    