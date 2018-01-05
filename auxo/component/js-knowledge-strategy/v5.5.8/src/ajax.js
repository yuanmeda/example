import $ from 'jquery';

function ajax(path, options){
  options = options || {};
  options.dataType= 'json';
  options.contentType = 'application/json; charset=utf-8';
  options.url = path;
  return $.ajax(options);
}

export {ajax};