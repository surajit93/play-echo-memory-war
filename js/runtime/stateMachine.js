export const RuntimeStates = Object.freeze({
  Boot:'Boot', PlayerProfileLoad:'PlayerProfileLoad', ChamberLoad:'ChamberLoad', ObservationIntro:'ObservationIntro', ObservationActive:'ObservationActive', ObservationFreeze:'ObservationFreeze', ReplayPreparation:'ReplayPreparation', ReplayPlayback:'ReplayPlayback', SuspicionSelection:'SuspicionSelection', ConfidenceSelection:'ConfidenceSelection', PsychologicalResponse:'PsychologicalResponse', AdaptationUpdate:'AdaptationUpdate', RewardAllocation:'RewardAllocation', HintStore:'HintStore', ChamberTransition:'ChamberTransition'
});

const transitions = {
  Boot:[RuntimeStates.PlayerProfileLoad], PlayerProfileLoad:[RuntimeStates.ChamberLoad], ChamberLoad:[RuntimeStates.ObservationIntro],
  ObservationIntro:[RuntimeStates.ObservationActive], ObservationActive:[RuntimeStates.ObservationFreeze], ObservationFreeze:[RuntimeStates.ReplayPreparation],
  ReplayPreparation:[RuntimeStates.ReplayPlayback], ReplayPlayback:[RuntimeStates.SuspicionSelection], SuspicionSelection:[RuntimeStates.ConfidenceSelection],
  ConfidenceSelection:[RuntimeStates.PsychologicalResponse], PsychologicalResponse:[RuntimeStates.AdaptationUpdate], AdaptationUpdate:[RuntimeStates.RewardAllocation],
  RewardAllocation:[RuntimeStates.HintStore], HintStore:[RuntimeStates.ChamberTransition], ChamberTransition:[RuntimeStates.ChamberLoad]
};

export class StateMachine {
  constructor() { this.state = RuntimeStates.Boot; }
  canTransition(to) { return (transitions[this.state] || []).includes(to); }
  transition(to) { if (!this.canTransition(to)) throw new Error(`Invalid transition ${this.state} -> ${to}`); this.state = to; }
}
