;
(function(window, $) {
    var store = {
        coursesSearch: function() {
            var url = '/' + projectCode + '/specialty/plans/' + specialtyId + '/courses';
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        }
    };

    function ViewModel() {
        this.courseList = [];
        this.isComplete = ko.observable(false);
        this._init();
    }
    ViewModel.prototype = {
        _init: function() {
            this._loadDate();
        },
        _loadDate: function() {
            var vm = this;
            store.coursesSearch().done(function(d) {
                d=(d ? d : []).map(function(c){
                    return {
                        id:c.business_course_id,
                        name:c.name
                    };
                });
                vm.courseList = d;
                vm.isComplete(true);
            }).always(function(){
            	$('.appraise_container_js').show();
            });
        }
    };

    $(function() {
        ko.applyBindings(new ViewModel());
    })
})(window, jQuery);
