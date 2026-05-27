import { REPLAY_SCHEMA, FRAME_RATE } from '../core/constants.js';

export class ReplayEngine {
  constructor(seedPipeline) {
    this.seedPipeline = seedPipeline;
    this.observationLog = [];
    this.overlayEvents = [];
    this.checksum = 0;
  }
  recordFrame(frameIndex, entitiesSnapshot, inputs) {
    const entry = { t: frameIndex / FRAME_RATE, frameIndex, entitiesSnapshot, inputs };
    this.observationLog.push(entry);
    this.checksum = (this.checksum + JSON.stringify(entry).length) >>> 0;
  }
  applyMutationOverlay(mutationEvent) { this.overlayEvents.push(mutationEvent); }
  serialize() {
    return { schema: REPLAY_SCHEMA, seedPipeline: this.seedPipeline, observationLog: this.observationLog, overlayEvents: this.overlayEvents, checksum: this.checksum };
  }
  validate(serialized) { return serialized.checksum === this.checksum && serialized.observationLog.length === this.observationLog.length; }
}
