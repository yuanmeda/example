import $ from 'jquery';

let host = window.self_host || '';
let HttpAdapter = {
  request(path, options){
    options = options || {};
    options.dataType= 'json';
    options.contentType = 'application/json; charset=utf-8';
    let url = `${host}/${projectCode}${path}`;
    return $.ajax(url, options);
  }
};

export {HttpAdapter};