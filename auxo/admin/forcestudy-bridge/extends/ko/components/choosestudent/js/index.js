/**
 * @file 选择学员组件  jQuery、knockoutjs、bootstrap部分样式等
 * @author cjf
 */
ko.components.register('x-choosestudent', {
    /**
     * 组件viewModel类
     *
     * @class
     * @param params 组件viewModel实例化时的参数 studentList：可选列表，selectStudentList：已选列表
     */
    viewModel: function (params) {
        /**
         * viewModel的数据对象
         *
         * @property key 可选列表的查询关键字
         * @property selectKey 已选列表的查询关键字
         * @property studentList 可选列表   必须含有user_id、realname和checked属性的对象集合 性能问题只有checked属性是observable的
         * @property selectStudentList 已选列表
         */
        this.model = {
            id: params.id,
            title: params.title,
            key: ko.observable(""),
            selectKey: ko.observable(""),
            studentList: ko.isObservable(params.studentList) ? params.studentList : ko.observableArray(params.studentList),
            selectStudentList: ko.isObservable(params.selectStudentList) ? params.selectStudentList : ko.observableArray(params.selectStudentList)
        };
        /**
         * 学员列表项的点击事件
         *
         *@event
         * @param $index 点击项的索引
         * @param event 点击项的事件对象
         * @param $data 点击项的ko绑定值
         */
        this.activeClick = function ($index, event, $data) {
            var bl = $(event.currentTarget).hasClass("x-courselist-active");
            var selectItems = model.selectItems.peek();
            if (!selectItems)
                return;
            if (!bl) {
                model.selectItems.push({
                    id: $data.id,
                    title: $data.title
                });
                return
            }
            for (var i = selectItems.length - 1; i >= 0; i--) {
                if (selectItems[i].id == $data.id) {
                    model.selectItems.remove(selectItems[i]);
                }
            }
            model.selectItems.valueHasMutated();
        }
        /**
         * 学员列表项的点击
         *
         * @event
         * @param $index 当前项的索引
         * @param event 当前项的事件对象
         * @param $data 当前项的ko绑定值
         */
        this.studentClick = function ($data, event, mode) {
            var target = event.target, node;
            if (target.parentNode.tagName == "LI")
                node = target.parentNode;
            else if (target.tagName == "LI")
                node = target;
            var bindingContext = ko.contextFor(node);
            bindingContext.$data.checked(bindingContext.$data.checked.peek());
            if (!event.ctrlKey) {
                var list = mode == 1 ? bindingContext.$parent.model.studentList.peek() : bindingContext.$parent.model.selectStudentList.peek();
                $.each(list, function (index, value) {
                    value.checked(false);
                })
                bindingContext.$data.checked(true);
            }
            else {
                bindingContext.$data.checked(!bindingContext.$data.checked.peek());
            }
        }
        /**
         * 文本框的学员关键字查询
         *
         * @event
         * @param val 关键字
         * @param timer setTimeout的返回值
         * @param list 学员列表
         */
        this.searchStudent = function (val, timer, list, mode) {
            clearTimeout(timer.id);
            timer.id = setTimeout(function () {
                if (!val) {
                    $.each(list, function (index, value) {
                        value.checked(false);
                    })
                    return;
                }
                $.each(list, function (index, value) {
                    if (!val || (value[model.title].indexOf(val) < 0 && value[model.id].toString().indexOf(val) < 0))
                        value.checked(false);
                    else
                        value.checked(true);
                })
                ko.tasks.runEarly();
                var node = $(), parent = $();
                if (mode == 1)
                    node = $(".x-choosestudent-left li[class*='active']:first");
                else
                    node = $(".x-choosestudent-right li[class*='active']:first");
                parent = node.closest("ul");
                if (node.length > 0)
                    parent.scrollTop(node.position().top + parent.scrollTop() + 3);
            }, 500);
        }
        /**
         * 学员的左/右移动操作
         *
         * @event
         * @param type 关键字 1:全移， 2：选中移动
         * @param mode 点击类型 1：右移，2：左移
         * @param $data 当前项的ko绑定值
         */
        this.studentChecked = function (type, mode, $data) {
            var info = model,
                studentList = mode == 1 ? info.studentList : info.selectStudentList,
                selectStudentList = mode == 1 ? info.selectStudentList : info.studentList,
                oldList = [], newList = [], selectStudentData = ko.mapping.toJS(selectStudentList);
            $.each(studentList.peek(), function (index, value) {
                var isExist = false;
                $.each(selectStudentData, function (i, v) {
                    if (value[model.id] == v[model.id]) {
                        isExist = true;
                        return;
                    }
                })
                if ((type == 1 || value.checked.peek()) && !isExist)
                    newList.push(value);
                else if (type != 1 && !value.checked.peek())
                    oldList.push(value);
                value.checked(false);
            })
            studentList(oldList);
            selectStudentList(selectStudentList.peek().concat(newList));
        }

        var model = this.model;

        /**
         * key值改变时触发（匿名自执行所返回的函数）
         *
         * @event
         * @param val 新的key值
         */
        model.key.subscribe((function () {
            var timer = {id: undefined};
            return function (val) {
                this.searchStudent(val, timer, this.model.studentList.peek(), 1);
            }
        }()), this);

        /**
         * selectKey值改变时触发（匿名自执行所返回的函数）
         *
         * @event
         * @param val 新的selectKey值
         */
        model.selectKey.subscribe((function () {
            var timer = {id: undefined};
            return function (val) {
                this.searchStudent(val, timer, this.model.selectStudentList.peek(), 2);
            }
        }()), this);
    },
    /**
     * 组件模板
     */
    template: '<!-- ko template: { nodes: $componentTemplateNodes }--><!-- /ko -->'
})