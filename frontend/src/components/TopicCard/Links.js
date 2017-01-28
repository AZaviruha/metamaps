/* global $ */

import React, { PropTypes, Component } from 'react'

import Metacode from './Metacode'
import Permission from './Permission'

const inmaps = (topic) => {
  const inmapsArray = topic.get('inmaps') || []
  const inmapsLinks = topic.get('inmapsLinks') || []

  let html = ''
  if (inmapsArray.length < 6) {
    for (let i = 0; i < inmapsArray.length; i++) {
      const url = '/maps/' + inmapsLinks[i]
      html += '<li><a href="' + url + '">' + inmapsArray[i] + '</a></li>'
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const url = '/maps/' + inmapsLinks[i]
      html += '<li><a href="' + url + '">' + inmapsArray[i] + '</a></li>'
    }
    const extra = inmapsArray.length - 5
    html += '<li><span class="showMore">See ' + extra + ' more...</span></li>'
    for (let i = 5; i < inmapsArray.length; i++) {
      const url = '/maps/' + inmapsLinks[i]
      html += '<li class="hideExtra extraText"><a href="' + url + '">' + inmapsArray[i] + '</a></li>'
    }
  }

  return html
}

// TODO all of these should be largely turned into passed-in callbacks
const bindShowCardListeners = (topic, ActiveMapper) => {
  $('.links .mapCount').unbind().click(function(event) {
    $('.mapCount .tip').toggle()
    $('.showcard .hoverTip').toggleClass('hide')
  })
  $('.showcard').unbind('.hideTip').bind('click.hideTip', function() {
    $('.mapCount .tip').hide()
    $('.showcard .hoverTip').removeClass('hide')
  })

  var originalText = $('.showMore').html()
  $('.mapCount .tip .showMore').unbind().toggle(
    function(event) {
      $('.extraText').toggleClass('hideExtra')
      $('.showMore').html('Show less...')
    },
    function(event) {
      $('.extraText').toggleClass('hideExtra')
      $('.showMore').html(originalText)
    }
  )
}

class Links extends Component {
  componentDidMount = () => {
    bindShowCardListeners(this.props.topic, this.props.ActiveMapper)
  }

  render = () => {
    const { topic, ActiveMapper } = this.props
    const topicId = topic.isNew() ? topic.cid : topic.id // TODO should we really be using cid here?!?
    const metacode = topic.getMetacode()

    return (
      <div className="links">
        <Metacode
          topic={topic}
          metacode={metacode}
          ActiveMapper={ActiveMapper}
          updateTopic={this.props.updateTopic}
        />
        <div className="linkItem contributor">
          <a href={`/explore/mapper/${topic.get('user_id')}`} target="_blank"><img src={topic.get('user_image')} className="contributorIcon" width="32" height="32" /></a>
          <div className="contributorName">{topic.get('user_name')}</div>
        </div>
        <div className="linkItem mapCount">
          <div className="mapCountIcon"></div>
          {topic.get('map_count').toString()}
          <div className="hoverTip">Click to see which maps topic appears on</div>
          <div className="tip"><ul>{inmaps(topic)}</ul></div>
        </div>
        <a href={`/topics/${topicId}`} target="_blank" className="linkItem synapseCount">
          <div className="synapseCountIcon"></div>
          {topic.get('synapse_count').toString()}
          <div className="tip">Click to see this topics synapses</div>
        </a>
        <Permission
          topic={topic}
          ActiveMapper={ActiveMapper}
          updateTopic={this.props.updateTopic}
        />
        <div className="clearfloat"></div>
      </div>
    )
  }
}

Links.propTypes = {
  topic: PropTypes.object, // backbone object
  ActiveMapper: PropTypes.object,
  updateTopic: PropTypes.func
}

export default Links
