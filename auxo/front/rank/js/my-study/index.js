(function(){
  var Model;
  var template;

  template = '<div class="iframe-container"><iframe id="rank-my-study-frame" frameborder="0" width="100%" height="800"  data-bind="attr:{src:rank_uri}"></iframe></div>';

  Model = function(params){
    var vm = this;
    var project_code = params.project_domain;
    var assist_gw_host = params.assist_gw_host;
    var rank_uri = params.rank_uri;
    //rank_uri = 'http://localhost:8003/{project_code}/rank/display?rank_range=all&__mac={__mac}';
    //rank_uri = 'http://pbl-ranking-web.debug.web.nd/#/home/learnHoursSumNodesTabs?project_id=1326&auth={auth}';

    vm.rank_uri = ko.observable();

    start();

    /*启动*/
    function start(){
      if(rank_uri.indexOf('__mac') > -1){
        assist_rank();
      }
     pbl_rank();
    }

    /*PBL提供的排行*/
    function pbl_rank(){
      var parsed_uri, auth, vorg;
      parsed_uri = parse_uri(rank_uri);
      auth = Nova.getMacToken(parsed_uri.protocol + '//' + parsed_uri.host + '/');
      rank_uri = rank_uri.replace('{auth}', encodeURIComponent(auth));
      rank_uri = rank_uri.replace('{project_code}', project_code);
      vm.rank_uri(rank_uri);
    }

    /*Assist提供的排行*/
    function assist_rank(){
      var mac;
      rank_uri = rank_uri.replace('{project_code}', project_code);
      rank_uri = rank_uri.replace('&__mac={__mac}', '');
      mac = Nova.getMacToB64(rank_uri);
      rank_uri += ('&__mac=' + mac);
      vm.rank_uri(rank_uri);
    }
  };

  /*解析url*/
  function parse_uri(href){
    var l = document.createElement('a');
    l.href = href;
    return l;
  }

  ko.components.register('x-rank-my-study', {
    viewModel: Model,
    template: template
  });
})();