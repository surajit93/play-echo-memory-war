export class Telemetry {
  constructor() { this.events = []; }
  capture(type, payload) { this.events.push({ ts: performance.now(), type, payload }); }
  summarize() { return { total: this.events.length, last: this.events.at(-1) || null }; }
}
