/**
 * Created by Administrator on 2017/6/17.
 */
import Correct from './correct';
import CorrectQuestionItem from './correct-question-item';
import Requset from '../../service/rest.service';
import _ from 'lodash'


export default class extends Correct{

	init(){
		return new Promise((resolve,reject)=>{
			//请求数据
			Requset.getCorrectQuestions().then((data)=>{
				this._initData(data);
				resolve();
			});
		});

	}

	//数据初始化
	_initData(data){
		let items = data.items;
		let list = [];
		_.forEach(items,(item)=>{
			list.push(new CorrectQuestionItem(item));
		});
	}

}
