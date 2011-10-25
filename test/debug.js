var StateMachine = require('../lib/state_machine');

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

var sm = aStateMachine();
sm.transition('X');
sm.transition('BEEF')

