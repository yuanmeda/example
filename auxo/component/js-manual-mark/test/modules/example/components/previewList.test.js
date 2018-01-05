import React from 'react'
import PreviewList from 'modules/example/components/preview/previewList'
import {shallow, mount, render} from 'enzyme'
import {expect} from 'chai'
import sinon from 'sinon'
import {mountWithIntl, intl} from 'helpers/intlEnzymeTestHelper.js'

describe('<PreviewList />', () => {
  const props = {
    articleList: [
      {
        id: 1,
        title: 'title 1',
        description: 'description 1',
        date: '2017-05-18'
      }
    ],
    articleGet: function () {},
    push: function () {}
  }
  let previewList = mountWithIntl(<PreviewList {...props}/>)

  it("PreviewList defined", function () {
    expect(previewList.find('div')).to.exist
  })

  it("Preview defined", function () {
    expect(previewList.find('article')).to.have.lengthOf(props.articleList.length)
  })

  it("Preview content", function () {
    const {formatDate} = intl
    let preview = previewList.find('article').first()
    let article = props.articleList[0]
    expect(preview.find('.title')).to.have.className('title')
    expect(preview.find('.title')).to.have.text(article.title)
    expect(preview.find('.desc')).to.have.className('desc')
    expect(preview.find('.desc')).to.have.text(article.description)
    expect(preview.find('.date')).to.have.className('date')
    expect(preview.find('.date')).to.have.text(formatDate(article.date))
  })
})
