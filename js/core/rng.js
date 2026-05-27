export class DeterministicRNG {
  constructor(seed) { this.state = seed >>> 0; }
  next() {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
  nextInt(max) { return Math.floor(this.next() * max); }
}

export function buildSeedPipeline(sessionSeed) {
  const mix = (s, v) => (((s ^ v) * 2654435761) >>> 0);
  const chamberSeed = mix(sessionSeed, 0xC11A);
  const replaySeed = mix(chamberSeed, 0xA11F);
  const mutationSeed = mix(replaySeed, 0xBEEF);
  const entityVariationSeed = mix(mutationSeed, 0xE771);
  return { sessionSeed, chamberSeed, replaySeed, mutationSeed, entityVariationSeed };
}
