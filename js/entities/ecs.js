export class ECSWorld {
  constructor(poolSize = 42) {
    this.nextId = 1; this.entities = new Map(); this.poolSize = poolSize;
  }
  create(components) {
    if (this.entities.size >= this.poolSize) throw new Error('Entity cap exceeded');
    const id = this.nextId++; this.entities.set(id, components); return id;
  }
  get(id) { return this.entities.get(id); }
  all() { return this.entities.entries(); }
}

export const Components = {
  TransformComponent: () => ({ x:0,y:0,rot:0 }),
  VisibilityComponent: () => ({ visible:true, detectability:1 }),
  ReplayStateComponent: () => ({ observed:[], replayed:[] }),
  MutationEligibilityComponent: () => ({ channels:['positional','temporal','audio'], frozen:false }),
  AudioSpatialComponent: () => ({ gain:1, pan:0, occlusion:0 }),
  RuntimeAuthorityComponent: () => ({ owner:'main-thread' }),
  EmotionalPurposeTag: (purpose='anchor') => ({ purpose }),
  TelemetryTag: () => ({ track:true })
};
