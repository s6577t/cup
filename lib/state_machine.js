/*
  node state machine
  * serialize
  * '*' catch-all
  * transitions definition {
    state: {
      input: newState
    }
  }
*/
var StateMachine = exports = module.exports = (function(){

  function StateMachine(definition){
    this.state = definition.state;
    this.transitions = definition.transitions;
    this.acceptingStates = definition.acceptingStates;
  }

  StateMachine.prototype = {
    transition: function (input) {
      var self = this,
          state = this.state;

      var trans = this.transitions[state];

      if (!trans) {
        throw new Exception('No transitions defined for current state: "'+ state + '"')
      }
      debugger;
      var newState = trans[input] || trans['*'];

      if (!newState) {
        throw new Exception('No transitions defined for current state: "'+ state + '", input: "'+ input + '"')
      }

      this.state = newState;
      return this;
    },
    accept: function () {
      return !!~this.acceptingStates.indexOf(this.state);
    },
    serialize: function () {
      return {
        state: this.state,
        transitions: this.transitions,
        acceptingStates: this.acceptingStates
      }
    }
  }


  return StateMachine;
})();