export class MutationSystem {
  constructor(rng) { this.rng = rng; this.maxChannels = 3; }
  chooseOverlay() {
    const candidates = ['positional','temporal','audio','lighting','peripheral','behavioral','environmental','statistical','meta'];
    const picked = [];
    while (picked.length < this.maxChannels) {
      const m = candidates[this.rng.nextInt(candidates.length)];
      if (!picked.includes(m)) picked.push(m);
      if (picked.includes('temporal') && picked.includes('lighting') && picked.includes('positional')) picked.pop();
    }
    return picked;
  }
}
