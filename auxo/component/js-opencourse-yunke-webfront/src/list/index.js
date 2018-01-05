import tpl from './template.html'
import ko from 'knockout';
import {OpenCourse} from '../OpenCourse';

function Model(){
  let $vm = this;
  $vm.coursesAuditStatus = ko.observable(null);
  $vm.pageNum = ko.observable(1);
  $vm.courses = ko.observableArray([]);
  $vm.totalPages = ko.observable(0);
  $vm.inputPageNum = ko.observable();
  $vm.isLoading = ko.observable(false);

  $vm.searchByStatus = searchByStatus;
  $vm.searchByPage = searchByPage;
  $vm.modifyCourse = modifyCourse;
  $vm.checkCourseDetail = checkCourseDetail;

  // 初始化，搜索
  searchCourses();

  // 按状态搜索
  function searchByStatus(status){
    $vm.coursesAuditStatus(status);
    searchCourses();
  }

  // 按分页搜索
  function searchByPage(pageNum){
    pageNum = window.parseInt(pageNum, 10);
    if(window.isNaN(pageNum)){
      return;
    }
    if(pageNum > $vm.totalPages() || pageNum < 0 || pageNum === $vm.pageNum()){
      return
    }
    $vm.pageNum(pageNum);
    searchCourses();
  }

  function searchCourses(){
    if($vm.isLoading()){ return; }
    $vm.isLoading(true);
    // 初始化加载课程列表
    OpenCourse.search($vm.coursesAuditStatus(), $vm.pageNum())
      .then(({courses, total}) => {
        let totalPages = Math.ceil(total/10);
        $vm.courses(courses);
        $vm.totalPages(totalPages);
      })
      .always(()=>{
        $vm.isLoading(false);
      });
  }

  function modifyCourse(id){
    $vm.isLoading(true);
    OpenCourse.fetch(id)
      .then(course=>{
        $vm.isLoading(false);
        this.modifyCourse(course);
      });
  }

  function checkCourseDetail(id){
    $vm.isLoading(true);
    OpenCourse.fetch(id)
      .then(course=>{
        $vm.isLoading(false);
        this.openCourseDetail(course);
      });
  }
}

ko.components.register("x-opencoures-yunke-list", {
  viewModel: Model,
  template: tpl
});