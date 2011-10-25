var StateMachine = require('../lib/state_machine'),
    vows = require('vows'),
    assert = require('assert');

function aStateMachine () {
  return new StateMachine({
    state: 'q0',
    acceptingStates: ['q3'],
    transitions: {
      'q0': {
        'a':'q1',
        '*':'q2'},
      'q2': {
        'z': 'q3'
      }
    }
  })
}

vows.describe('state machine').addBatch({
  'start state': {
    topic: aStateMachine().state,
    'should return the start state as per the definition': function (state) {
      assert.equal(state, 'q0');
    }
  },
  'passing input': {
    topic: function () {
      var sm = aStateMachine();
      sm.transition('a');
      return sm;
    },
    'should cause a transition to a new state': function (stateMachine) {
      assert.equal(stateMachine.state, 'q1')
    }
  },
  'calling transition': {
    topic: function () {
      var sm = aStateMachine();
      var rtn = sm.transition('a');
      return [sm, rtn];
    },
    'should return the state machine': function (topic) {
      assert.instanceOf(topic[1], StateMachine);
      assert.strictEqual(topic[0], topic[1]);
    },
    'with an unrecognized input when there is a catch all' : {
      topic: function () {
        var sm  = aStateMachine();
        sm.transition('catch-all me');
        return sm;
      },
      'should move the machine into a new state': function (stateMachine) {
        assert.equal('q2', stateMachine.state)
      }
    },
    'with an unrecognized input when there is no catch-all': {
      topic: function () {
        var sm = aStateMachine();
        sm.transition('move to q2 by catch-all')
        return sm;
      },
      'should raise an error': function (stateMachine) {
        assert.throws(function () {
          stateMachine.transition('none-existent-input')
        }, Error);
      }
    },
    'when there are no transitions defined for the current state': {
      topic: function () {
        var sm = aStateMachine();
        sm.transition('a');
        return sm;
      },
      'should raise an error': function (stateMachine) {
        assert.throws(function () {
          stateMachine.transition('input');
        }, Error);
      }
    }
  },
  'in an accepting state, accept()': {
    topic: aStateMachine().transition('goto q2').transition('z').accept(),
    'should be true': function (result) {
      assert.ok(result);
    }
  },
  'in a non-accepting state, accept()': {
    topic: aStateMachine().accept(),
    'should be false': function (result) {
      assert.ok(!result);
    }
  }
}).export(module);
