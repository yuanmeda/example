void function () {
    var viewModel = {
        url: ko.observable(barrierUrl + '/#/gaming-card-list?barrier_project_id=' + examId + '&project_code=' + projectCode +'&__mac=' + Nova.getMacToB64(barrierUrl + '/#/gaming-card-list?barrier_project_id=' + examId + '&project_code=' + projectCode))
    };
    ko.applyBindings(viewModel);
}(jQuery);