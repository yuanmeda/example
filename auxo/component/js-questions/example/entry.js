import ko from 'knockout';
import 'component';
import {params as pop_replies_params} from './params/pop-replies';
import {params_1 as question_params_1} from './params/question';
import {params_2 as question_params_2} from './params/question';


import './style/reset.css';
import '../css/blue/style.scss';
import './style/demo.scss';


const model = {
  question_params_1,
  question_params_2,
  pop_replies_params
};

ko.applyBindings(model, document.body);