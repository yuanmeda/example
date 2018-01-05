import React from 'react'
import {Router, Route, IndexRoute} from 'react-router'
import Frame from '../correct/index'
import Intl from 'i18n/intl'

const Demo = (location, callback) => {
  require.ensure([], require => {
    callback(null, require('../correct/demo'), 'Demo')
  })
}

const AnswerList = (location, callback) => {
  require.ensure([], require => {
    callback(null, require('../correct/answerList'), 'AnswerList')
  })
}

const Answers = (location, callback) => {
  require.ensure([], require => {
    callback(null, require('modules/example/answer'))
  }, 'Answers')
}
const Log = (location, callback) => {
  require.ensure([], require => {
    callback(null, require('../correct/log'), 'Log')
  })
}

const CorrectByStudent = (location, callback) => {
  require.ensure([], require => {
    callback(null, require('../correct/correctByStudent'), 'CorrectByStudent')
  })
}

const PickCorrectorDemo = (location, callback) => {
  require.ensure([], require => {
    callback(null, require('../manager/pickCorrectorDemo'), 'PickCorrectorDemo')
  })
}
const CorrectSetting = (location, callback) => {
  require.ensure([], require => {
    callback(null, require('../manager/correct-setting/correct-setting'))
  }, 'CorrectSetting')
}

const CorrectList = (location, callback) => {
  require.ensure([], require => {
    callback(null, require('../manager/correct-list/correct-list'))
  }, 'CorrectList')
}


const routes = history => (
  <Router history={history}>
      <Route component={Intl}>
      <Route path='/' component={Frame}>
        <IndexRoute getComponent={CorrectList} />
        {/*<IndexRoute getComponent={CorrectByStudent} />*/}
        <Route path='/answers/:id' getComponent={Answers} />
        <Route path='/correct-setting' getComponent={CorrectSetting} />
        <Route path='/correct-list' getComponent={CorrectList} />
        <Route path='/answerList/:exam_id/:showName' getComponent={AnswerList} />  //作答列表
        <Route path='/log' getComponent={Log} />  //批改日志
        <Route path='/correctByStudent/:id/:type' getComponent={CorrectByStudent} />  //按卷批改 查看试卷 终审批改
        <Route path='/pickCorrectorDemo' getComponent={PickCorrectorDemo} />  //选取批改人员组件
      </Route>
    </Route>
  </Router>
)

export default routes
