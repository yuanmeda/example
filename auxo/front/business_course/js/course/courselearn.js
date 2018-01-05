(function ($) {
    var store = {
        query: function () {
            var url = (window.selfUrl || '') + "/v1/business_courses/" + course_id + "/knowledges";
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'JSON',
                contentType: "application/json"
            });
        },
        lesson: {
            info: function (lessionId) {
                return $.ajax({
                    url: (window.selfUrl || '') + "/v1/business_courses/" + course_id + "/lessons/" + lessionId + "/resources",
                    type: 'GET',
                    dataType: 'JSON',
                    contentType: "application/json"
                });
            },
            progresses: function (data) {
                return $.ajax({
                    url: window.business_course_service_url + "/v1/business_course_study_activity/actions/search",
                    type: 'POST',
                    dataType: 'JSON',
                    data: JSON.stringify(data),
                    contentType: "application/json"
                });
            }
        }
    };

    var viewModel = {
        model: {
            tab: 1,
            knowledges: [],
            tree: null,
            keyword: "",
            lesson: {
                id: ko.observable(""),
                name: "",
                sort_num: "",
                description: [],
                knowledges: [],
                status: 0,
                resources: [],
                progresses: []
            }
        },
        init: function () {
            // this.model.lesson.id.subscribe(this.updateResources, this);
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
        },
        tabClick: function (mode) {
            this.model.tab(mode);
        },
        updateLesson: function (lesson) {
            this.model.lesson.id(lesson.id);
            this.model.lesson.name(lesson.name);
            this.model.lesson.sort_num(lesson.sort_num);
            this.model.lesson.description(lesson.description);
            this.model.lesson.status(lesson.status);
            this.model.lesson.knowledges(lesson.knowledges);
            this.model.lesson.resources([]);

            this.updateResources();
        },
        updateResources: function () {
            store.lesson.info(this.model.lesson.id()).done($.proxy(function (data) {
                var filter = {
                    "filter": this.getFilter(data),
                    "offset": 0,
                    "limit": 10000
                };

                store.lesson.progresses(filter).done($.proxy(function (progresses) {
                    $.each(data, function (i, resource) {
                        $.each(progresses.items, function (j, progress) {
                            if (progress.target_id == resource.id) {
                                resource.total_time = progress.total_time;
                                resource.effective_time = progress.effective_time;
                            }
                        });
                        if (!resource.total_time) {
                            resource.total_time = 10;
                            resource.effective_time = 0;
                        }
                    });

                    this.model.lesson.resources(data);
                    this.model.lesson.progresses(progresses);
                }, this));
            }, this));
        },
        getFilter: function (resources) {
            var filter = "business_course_id eq " + course_id + " and user_id eq " + user_id + " and context_id like '%lesson:" + this.model.lesson.id() + "%' and target_id in (";
            $.each(resources, $.proxy(function (i, item) {
                filter += "'" + item.id + "'"
                if (i < resources.length - 1)
                    filter += ","
            }, this));
            filter += ")";

            return filter;
        },
        getLearnUrl: function (data) {
            var url = window.selfUrl + "/" + project_code + "/course/" + course_id + "/learn?cata_type=0&cata_id=" + this.model.lesson.id() + "&resource_id=" + data.id
            window.parent.location = url;
        },
        getFrontCoverUrl: function (data) {
            if (data.type == 1) {
                return data.resource_data.preview;
            } else if (data.type == 0) {
                return data.resource_data.front_cover_url;
            }
        },
        toTimeString: function (span) {
            span = Math.ceil(parseInt((span / 1000) + ""));
            var h = parseInt((span / 3600) + "");
            var m = parseInt((span / 60) + "") % 60;
            var s = span % 60;

            return (h < 10 ? '0' + h : '' + h) + ":" + (m < 10 ? '0' + m : '' + m) + ":" + (s < 10 ? '0' + s : '' + s);
        }
    };

    $(function () {
        viewModel.init();
    })
})(jQuery);
