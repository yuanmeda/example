import React from 'react'
import {Link, IndexLink, hashHistory} from 'react-router';

class Demo extends React.Component {
  render() {
    return (
      <div style={{fontSize: '24px', padding: '0 700px'}}>
        <ul>
          <li><Link to='/answerList/d625ee84-77de-4d09-ad9e-55a532cf2841'>作答列表</Link></li>
          <li><Link to='/correct-list'>批改列表</Link></li>
          <li><Link to='/correct-setting'>批改设置</Link></li>
        </ul>
      </div>
    )
  }
}

export default Demo
