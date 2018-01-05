import $ from 'jquery';

/*将标签数组拍平*/
function flatten_tags(tags, tags_map){
  tags_map = tags_map || {};
  $.each(tags, (idx, tag)=>{
    let children = [];
    foobar(tag.children);
    tag.children = children;
    function foobar(nodes){
      $.each(nodes, (i, node)=>{
        children.push(node);
        tags_map[node.id] = node;
        if(node.children && node.children.length>0){
          foobar(node.children);
        }
      });
    }
  });
  clean(tags);
  return tags;
}

/*清理标签数组*/
function clean(array) {
  for (let i = 0; i <array.length; i++) {
    if (array[i].children.length === 0) {
      array.splice(i, 1);
      i--;
    }
  }
}

export {flatten_tags, clean}