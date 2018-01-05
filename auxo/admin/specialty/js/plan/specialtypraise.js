;
(function(window, $) {

    function ViewModel() {
        this.title = ko.observable(specialtyName);
        this.logo_url = ko.observable(logoUrl);
        this.id = ko.observable(specialtyId);
        $('.appraise_container_js').show();
    }

    $(function() {
        ko.applyBindings(new ViewModel());
    })
})(window, jQuery);
