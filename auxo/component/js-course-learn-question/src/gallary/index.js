import tpl from './template.html';
import ko from 'knockout';

/*
* GalleryImage
*/ 

function GalleryImage(src) {
    if (!(this instanceof GalleryImage)) {
        return new GalleryImage(src);
    }
    var self = this;
    this.width = ko.observable(0);
    this.height = ko.observable(0);
    
    var instance = new Image();
    instance.onload =  function() {
        self.width(instance.width);
        self.height(instance.height);
    }
    instance.src = src;
    this.instance = instance;
}

function ViewModel(params) {
    this.model = {
        isShow: ko.observable(false),
        imageArr:  ko.utils.arrayMap(params.imageArr|| [], GalleryImage),
        current: ko.observable(params.current || 0)
    }
    this.openGallay = function(index) {
        this.model.current(index);
        this.model.isShow(true);
    },
    this.closeGallay = function() {
        this.model.isShow(false);
    }
    this.prev = function(){
        var len = ko.unwrap(this.model.imageArr).length;
        var current = ko.unwrap(this.model.current);
        if(current > 0) {
            current -= 1;
            this.model.current(current)
        }
    },
    this.next = function(){
        var len = ko.unwrap(this.model.imageArr).length;
        var current = ko.unwrap(this.model.current);
        if(current < len - 1) {
            current += 1;
            this.model.current(current)
        }
    }
}


ko.components.register('x-course-learn-image-gallery', {
    viewModel: ViewModel,
    template: tpl
});