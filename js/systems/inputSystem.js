export class InputSystem {
  constructor(canvas) { this.keys = new Set(); this.deltaX = 0; this.lastMoveTs = performance.now();
    window.addEventListener('keydown', e => this.keys.add(e.code));
    window.addEventListener('keyup', e => this.keys.delete(e.code));
    canvas.addEventListener('mousemove', e => { this.deltaX += Math.max(-100, Math.min(100, e.movementX)); });
  }
  sample() {
    const now = performance.now();
    const dt = Math.max(0.001, (now - this.lastMoveTs) / 1000);
    const angVel = Math.abs(this.deltaX) / dt;
    const data = { forward:this.keys.has('KeyW'), back:this.keys.has('KeyS'), left:this.keys.has('KeyA'), right:this.keys.has('KeyD'), sprint:this.keys.has('ShiftLeft'), focus:this.keys.has('KeyF'), scan:this.keys.has('KeyQ'), angVel };
    this.deltaX = 0; this.lastMoveTs = now;
    return data;
  }
}
