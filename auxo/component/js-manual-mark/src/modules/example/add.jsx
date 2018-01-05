import React, {Component} from 'react'
import {connect} from 'react-redux'
import ArticleAdd from './components/article/articleAdd'
import {push} from 'react-router-redux/lib/actions'
import {articleAdd} from './actions'

@connect(state => {
  return {}
}, {
  articleAdd,
  push
})
export default class List extends Component {
  render() {
    return (
      <div>
        <ArticleAdd {...this.props} />
      </div>
    )
  }
}
