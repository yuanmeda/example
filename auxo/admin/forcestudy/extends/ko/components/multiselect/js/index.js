/**
 * @file 多选框组件  依赖knockoutjs、bootstrap部分样式等
 * @author cjf
 */
ko.components.register('x-multiselect', {
    /**
     * 组件viewModel类
     *
     * @class
     * @param params 组件viewModel实例化时的参数 items：多选集合
     */
    viewModel: function (params) {
        /**
         * viewModel的数据对象
         *
         * @property id items中对象的绑定关键字
         * @property title items中对象的绑定关键字
         * @property items 多选集合
         */
        var model = this.model = {
            id: params.id,
            title: params.title,
            items: ko.isObservable(params.items) ? params.items : ko.observableArray(params.item)//可选列表
        };
        /**
         * 当前项的删除操作
         *
         * @event
         * @param $index 当前项的索引
         * @param $data 当前项的ko绑定值
         */
        this.removeClick = function ($index, $data) {
            model.items.remove($data);
        }
    },
    /**
     * 组件模板
     */
    template: '<!-- ko template: { nodes: $componentTemplateNodes }--><!-- /ko -->'
})