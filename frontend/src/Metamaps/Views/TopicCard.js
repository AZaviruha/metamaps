/* global $ */

import React from 'react'
import ReactDOM from 'react-dom'

import Active from '../Active'
import DataModel from '../DataModel'
import GlobalUI from '../GlobalUI'
import Mapper from '../Mapper'
import Router from '../Router'
import Visualize from '../Visualize'

import ReactTopicCard from '../../components/TopicCard'

const TopicCard = {
  openTopicCard: null, // stores the topic that's currently open
  init: function() {
    // initialize topic card draggability and resizability
    $('.showcard').draggable({
      handle: '.metacodeImage',
      stop: function() {
        $(this).height('auto')
      }
    })
  },
  populateShowCard: function(topic) {
    var self = TopicCard
    const topicCardObj = {
      topic: topic,
      ActiveMapper: Active.Mapper,
      removeLink: () => {
        topic.save({
          link: null
        },{success: topic => self.populateShowCard(topic)})
      },
      addLink: link => {
        topic.save({link},{success: topic => self.populateShowCard(topic)})
      }
    }
    ReactDOM.render(
      React.createElement(ReactTopicCard, topicCardObj),
      document.getElementById('showcard')
    )
  },
  showCard: function(node, opts) {
    var self = TopicCard
    if (!opts) opts = {}
    var topic = node.getData('topic')
    self.openTopicCard = topic
    // populate the card that's about to show with the right topics data
    self.populateShowCard(topic)
    return $('.showcard').fadeIn('fast', () => opts.complete && opts.complete())
  },
  hideCard: function() {
    var self = TopicCard
    $('.showcard').fadeOut('fast')
    self.openTopicCard = null
  }
}

export default TopicCard
