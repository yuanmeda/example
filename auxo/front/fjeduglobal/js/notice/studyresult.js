(function ($, window) {
    var store = {
        tree: function () {
            return $.ajax({
                url: '/fjedu/teaching_materials/teaching_chapters'
            })
        },
        chart: function (data) {
            return $.ajax({
                url: '/fjedu/teaching_materials/objectives',
                data: data
            })
        },
        table: function (chapter_id) {
            return $.ajax({
                url: '/fjedu/teaching_materials/' + chapter_id + '/users/study_info'
            })
        },
        tableDetail: function (objective_id) {
            return $.ajax({
                url: '/fjedu/teaching_materials/users/study_info/' + objective_id
            })
        }
    };

    var option = {
        series: [
            {
                type: 'pie',
                data: [{value: 335, name: '直接访问'}],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    var myChart = echarts.init(document.getElementById('chart'));

    var viewModel = {
        model: {
            tree: [],
            chartData: [],
            targetList: [],
            detail: {
                target: '',
                experience: '',
                level: ''
            },
            detailList: [],
            scrollTop: 0,
            popShow: false
        },
        init: function () {
            var t = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this.onmessage();

            store.tree().done(function (data) {
                var d = t.buildTree(data.items)
                t.model.tree(d);
                t.treeclick(d[0]);
            });
        },
        showPop: function () {
            this.model.popShow(true);
        },
        closePop: function () {
            this.model.popShow(false);
        },
        onmessage: function () {
            var t = this;

            function adjustIframeHeight(ret) {
                var data = JSON.parse(ret.data);
                if (data.type === 'setScrollTop') {
                    var top = data.scrollTop + data.offsetTop;
                    if (t.model.scrollTop != top) {
                        t.model.scrollTop = top;
                    }
                    if (!$('.pop-content').is(':visible')) {
                        $('.pop-content').css({
                            'position': 'absolute',
                            'width': '1200px',
                            'left': '100px',
                            'top': top + 'px'
                        });
                    }
                }
            }

            if (window.addEventListener) {                    //所有主流浏览器，除了 IE 8 及更早 IE版本
                window.addEventListener("message", adjustIframeHeight, false);
            } else if (window.attachEvent) {                  // IE 8 及更早 IE 版本
                window.attachEvent('onmessage', adjustIframeHeight);
            }
        },
        detail: function (obj) {
            var t = this;
            t.model.detail.target(obj.objective_name);
            t.model.detail.experience(obj.experience);
            t.model.detail.level(obj.level);

            store.tableDetail(obj.objective_id).done(function (d) {
                t.model.detailList(d);
            });
        },
        treeclick: function (node) {
            var t = this;
            var data = {material_id: node.teaching_material, chapter_id: node.identifier};

            store.chart(data).done(function (d) {
                t.showChart(d);
            });
            store.table(node.identifier).done(function (d) {
                t.model.targetList(d);
            });
        },
        turnOff: function (o, e) {
            $(e.currentTarget).next().toggle();
            $(e.currentTarget).toggleClass('arrow-up');
            $(e.currentTarget).parent().toggleClass('active');
        },
        showChart: function (d) {
            var data = [];
            var map = d.level_map;
            for (var key in map) {
                data.push({value: map[key], name: '' + key + ' ' + map[key]});
            }
            this.model.chartData(data);
            option.series[0].data = data;
            myChart.setOption(option);
        },
        close: function () {
            $('.pop-wrap').hide();
        },
        formatTime: function (time) {
            return time;
        },
        buildTree: function (list) {
            var map = {},
                node,
                roots = [],
                i;

            list.sort(function (a, b) {
                return a.order_num - b.order_num;
            });

            for (i = 0; i < list.length; i += 1) {
                map[list[i].identifier] = i;
                list[i].children = [];
            }
            for (i = 0; i < list.length; i += 1) {
                node = list[i];
                if (node.parent && (node.parent != node.teaching_material)) {
                    list[map[node.parent]].children.push(node);
                } else {
                    roots.push(node);
                }
            }

            return roots;
        }
    };

    $(function () {
        setInterval(function () {
            window.iframeResizePostMessage && iframeResizePostMessage('notice');
        }, 200);

        viewModel.init();
    });

})(jQuery, window);
