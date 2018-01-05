import ko from 'knockout';
import $ from 'jquery';

/**
 *
 * @param params
 * {
 *   init_id,
 *   course_id,
 *   content,
 *   course_name,
 *   on_chapter_command,
 *   on_course_command
 * }
 * @constructor
 */
function Model(params){
  const vm = this;
  vm.content = JSON.parse(params.content || '[]');
  vm.course_name = params.course_name;
  vm.course_id = params.course_id;
  vm.selected = ko.observable({id:params.init_id});

  vm.toggle_list = toggle_list;
  vm.switch_chapter = switch_chapter;
  vm.select_course = select_course;


  rebuild_content();

  function rebuild_content(){
    $.each(vm.content, (idx, chapter)=>{
      $.each(chapter.children, (i, section)=>{
        section.parent = chapter;
      });
    });
  }

  function toggle_list($data, event){
    $(event.target).toggleClass('n-icon-minus');
    $(event.target).parent().toggleClass('open');
  }

  function switch_chapter($data, event){
    vm.selected($data);
    params.on_chapter_command($data, event);
  }

  function select_course(){
    params.on_course_command();
    vm.selected({id:params.course_id});
  }
}

export {Model}