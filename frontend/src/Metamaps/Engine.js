import Matter, { Vector, Sleeping, World, Constraint, Composite, Runner, Common, Body, Bodies, Events } from 'matter-js'
import { last, sortBy, values } from 'lodash'

import $jit from '../patched/JIT'

import Active from './Active'
import Create from './Create'
import DataModel from './DataModel'
import Mouse from './Mouse'
import JIT from './JIT'
import Visualize from './Visualize'

const Engine = {
  focusBody: null,
  newNodeConstraint: null,
  newNodeBody:  Bodies.circle(Mouse.newNodeCoords.x, Mouse.newNodeCoords.y, 1),
  init: (serverData) => {
    Engine.engine = Matter.Engine.create() 
    Events.on(Engine.engine, 'afterUpdate', Engine.callUpdate)
    if (!serverData.ActiveMapper) Engine.engine.world.gravity.scale = 0
    else {
      Engine.engine.world.gravity.y = 0
      Engine.engine.world.gravity.x = -1
      Body.setStatic(Engine.newNodeBody, true)
    }
  },
  run: init => {
    if (init) {
      if (Active.Mapper) World.addBody(Engine.engine.world, Engine.newNodeBody)
      Visualize.mGraph.graph.eachNode(Engine.addNode)
      DataModel.Synapses.each(s => Engine.addEdge(s.get('edge')))
      if (Active.Mapper && Object.keys(Visualize.mGraph.graph.nodes).length) {
        Engine.setFocusNode(Engine.findFocusNode(Visualize.mGraph.graph.nodes))
      }
    }
    Engine.runner = Matter.Runner.run(Engine.engine)
  },
  endActiveMap: () => {
    Engine.runner && Runner.stop(Engine.runner)
    Matter.Engine.clear(Engine.engine)
  },
  setNodePos: (id, x, y) => {
    const body = Composite.get(Engine.engine.world, id, 'body')
    Body.setPosition(body, { x, y }) 
    Body.setVelocity(body, Vector.create(0, 0))
    Body.setAngularVelocity(body, 0)
    Body.setAngle(body, 0)
  },
  setNodeSleeping: (id, isSleeping) => { 
    const body = Composite.get(Engine.engine.world, id, 'body')
    Sleeping.set(body, isSleeping)
    if (!isSleeping) {
      Body.setVelocity(body, Vector.create(0, 0))
      Body.setAngularVelocity(body, 0)
      Body.setAngle(body, 0)
    }
  },
  addNode: node => {
    let body = Bodies.circle(node.pos.x, node.pos.y, 100)
    body.node_id = node.id 
    node.setData('body_id', body.id)
    World.addBody(Engine.engine.world, body)
  },
  removeNode: node => { 

  },
  findFocusNode: nodes => {
    return last(sortBy(values(nodes), n => new Date(n.getData('topic').get('created_at'))))
  },
  setFocusNode: node => {
    if (!Active.Mapper) return
    Create.newSynapse.focusNode = node
    const body = Composite.get(Engine.engine.world, node.getData('body_id'), 'body')
    Engine.focusBody = body 
    let constraint
    if (Engine.newNodeConstraint) {
      Engine.newNodeConstraint.bodyA = body
    }
    else {
      constraint = Constraint.create({
        bodyA: body,
        bodyB: Engine.newNodeBody,
        length: JIT.ForceDirected.graphSettings.levelDistance,
        stiffness: 0.2
      })
      World.addConstraint(Engine.engine.world, constraint)
      Engine.newNodeConstraint = constraint
    }
  },
  addEdge: edge => {
    const bodyA = Composite.get(Engine.engine.world, edge.nodeFrom.getData('body_id'), 'body')   
    const bodyB = Composite.get(Engine.engine.world, edge.nodeTo.getData('body_id'), 'body')   
    let constraint = Constraint.create({
      bodyA,
      bodyB,
      length: JIT.ForceDirected.graphSettings.levelDistance,
      stiffness: 0.2
    })
    edge.setData('constraint_id', constraint.id)
    World.addConstraint(Engine.engine.world, constraint)
  },
  removeEdge: synapse => {

  },
  callUpdate: () => {
    Engine.engine.world.bodies.forEach(b => {
      const node = Visualize.mGraph.graph.getNode(b.node_id)
      const newPos = new $jit.Complex(b.position.x, b.position.y)
      node && node.setPos(newPos, 'current')
    })
    if (Active.Mapper) {
      if (Engine.focusBody) Mouse.focusNodeCoords = Engine.focusBody.position
      Create.newSynapse.updateForm() 
      Create.newTopic.position()
    }
    Visualize.mGraph.plot()
  }
}

export default Engine
