/* global $ */

import React, { PropTypes, Component } from 'react'

import DataModel from '../../Metamaps/DataModel'
import Visualize from '../../Metamaps/Visualize'

// TODO all of these should be largely turned into passed-in callbacks
const bindShowCardListeners = (topic, ActiveMapper) => {
  var authorized = topic.authorizeToEdit(ActiveMapper)
  var selectingMetacode = false
  // attach the listener that shows the metacode title when you hover over the image
  $('.showcard .metacodeImage').mouseenter(function() {
    $('.showcard .icon').css('z-index', '4')
    $('.showcard .metacodeTitle').show()
  })
  $('.showcard .linkItem.icon').mouseleave(function() {
    if (!selectingMetacode) {
      $('.showcard .metacodeTitle').hide()
      $('.showcard .icon').css('z-index', '1')
    }
  })

  var metacodeLiClick = function() {
    selectingMetacode = false
    var metacodeId = parseInt($(this).attr('data-id'))
    var metacode = DataModel.Metacodes.get(metacodeId)
    $('.CardOnGraph').find('.metacodeTitle').html(metacode.get('name'))
      .append('<div class="expandMetacodeSelect"></div>')
      .attr('class', 'metacodeTitle mbg' + metacode.id)
    $('.CardOnGraph').find('.metacodeImage').css('background-image', 'url(' + metacode.get('icon') + ')')
    topic.save({
      metacode_id: metacode.id
    })
    Visualize.mGraph.plot()
    $('.metacodeSelect').hide().removeClass('onRightEdge onBottomEdge')
    $('.metacodeTitle').hide()
    $('.showcard .icon').css('z-index', '1')
  }

  var openMetacodeSelect = function(event) {
    var TOPICCARD_WIDTH = 300
    var METACODESELECT_WIDTH = 404
    var MAX_METACODELIST_HEIGHT = 270

    if (!selectingMetacode) {
      selectingMetacode = true

      // this is to make sure the metacode
      // select is accessible onscreen, when opened
      // while topic card is close to the right
      // edge of the screen
      var windowWidth = $(window).width()
      var showcardLeft = parseInt($('.showcard').css('left'))
      var distanceFromEdge = windowWidth - (showcardLeft + TOPICCARD_WIDTH)
      if (distanceFromEdge < METACODESELECT_WIDTH) {
        $('.metacodeSelect').addClass('onRightEdge')
      }

      // this is to make sure the metacode
      // select is accessible onscreen, when opened
      // while topic card is close to the bottom
      // edge of the screen
      var windowHeight = $(window).height()
      var showcardTop = parseInt($('.showcard').css('top'))
      var topicTitleHeight = $('.showcard .title').height() + parseInt($('.showcard .title').css('padding-top')) + parseInt($('.showcard .title').css('padding-bottom'))
      var distanceFromBottom = windowHeight - (showcardTop + topicTitleHeight)
      if (distanceFromBottom < MAX_METACODELIST_HEIGHT) {
        $('.metacodeSelect').addClass('onBottomEdge')
      }

      $('.metacodeSelect').show()
      event.stopPropagation()
    }
  }

  var hideMetacodeSelect = function() {
    selectingMetacode = false
    $('.metacodeSelect').hide().removeClass('onRightEdge onBottomEdge')
    $('.metacodeTitle').hide()
    $('.showcard .icon').css('z-index', '1')
  }

  if (authorized) {
    $('.showcard .metacodeTitle').click(openMetacodeSelect)
    $('.showcard').click(hideMetacodeSelect)
    $('.metacodeSelect > ul > li').click(function(event) {
      event.stopPropagation()
    })
    $('.metacodeSelect li li').click(metacodeLiClick)
  }
}

class Metacode extends Component {
  componentDidMount = () => {
    bindShowCardListeners(this.props.topic, this.props.ActiveMapper)
  }

  metacodeOptions = () => {
    return (
      <div id="metacodeOptions">
        <ul>
          {this.props.metacodeSets.map(set => {
            <li key={set.name}>
              <span>{set.name}</span>
              <div class="expandMetacodeSet"></div>
              <ul>
                {set.metacodes.map(m => {
                  <li key={m.id} data-id={m.id}>
                    <img width="24" height="24" src={m.icon_path} alt={m.name} />
                    <div class="mSelectName">{m.name}</div>
                    <div class="clearfloat"></div>
                  </li>
                })}
              </ul>
            </li>
          })}
        </ul>
      </div>
    )
  }


  render = () => {
    const { metacode } = this.props
    // the code for this is stored in /views/main/_metacodeOptions.html.erb
    const metacodeSelectHTML = $('#metacodeOptions').html()

    return (
      <div className="linkItem icon">
        <div className={`metacodeTitle mbg${metacode.get('id')}`}>
          {metacode.get('name')}
          <div className="expandMetacodeSelect"></div>
        </div>
        <div className="metacodeImage" style={{backgroundImage: `url(${metacode.get('icon')})`}} title="click and drag to move card"></div>
        <div className="metacodeSelect">
          {this.metacodeOptions()}
        </div>
      </div>
    )
  }
}

Metacode.propTypes = {
  topic: PropTypes.object, // backbone object
  metacode: PropTypes.object, // backbone object
  ActiveMapper: PropTypes.object,
  updateTopic: PropTypes.func,
  metacodeSets: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    metacodes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      icon_path: PropTypes.string, // url
      name: PropTypes.string
    }))
  }))
}

export default Metacode
