import fs from "node:fs";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const filename = fileURLToPath(new URL("../components/possession/possession-play.ts", import.meta.url));
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2020 },
}).outputText;
const { playActions, samplePossession } = await import(
  "data:text/javascript;base64," + Buffer.from(compiled).toString("base64")
);
const distance = (a, b) => Math.hypot(...a.map((value, i) => value - b[i]));
const angleDistance = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
let minimumBallY = Infinity;
let maximumCameraStep = 0;
let priorCamera = null;
const owners = new Set();
for (let i = 0; i <= 10000; i++) {
  const phase = i / 10000, frame = samplePossession(phase);
  const values = [...frame.ball, ...frame.cameraDirection,
    ...frame.players.flatMap(player => [...player.position, player.heading,
      player.gait, player.locomotion, player.arms, player.reachBlend, player.reachBoth,
      ...(player.reachTarget ?? [])])];
  assert.ok(values.every(Number.isFinite), `Nonfinite frame at ${phase}`);
  minimumBallY = Math.min(minimumBallY, frame.ball[1]);
  assert.ok(frame.ball[1] >= .22, `Ball enters floor at ${phase}`);
  assert.ok(frame.players.every(player => player.position[1] >= -1e-8));
  assert.ok(frame.players.every(player => player.reachBlend >= -1e-12 && player.reachBlend <= 1 + 1e-12));
  if (priorCamera) maximumCameraStep = Math.max(maximumCameraStep,
    angleDistance(Math.atan2(priorCamera[0], priorCamera[2]), Math.atan2(frame.cameraDirection[0], frame.cameraDirection[2])));
  priorCamera = frame.cameraDirection;
  if (frame.owner !== null) owners.add(frame.owner);
  if (frame.kind === 'pass' || frame.kind === 'shot') assert.equal(frame.owner, null);
  if (frame.kind === 'dribble') {
    assert.equal(frame.players.filter(player => player.role === 'dribbler').length, 1);
    assert.equal(frame.players[frame.owner].role, 'dribbler');
  }
}
assert.deepEqual([...owners], [2, 3, 4, 0]);
assert.ok(maximumCameraStep < .01, `Camera turns too abruptly: ${maximumCameraStep}`);
const boundaryChecks = [];
for (const action of playActions.slice(0, -1)) {
  const phase = action.end, epsilon = 1e-6;
  const left = samplePossession(phase - epsilon);
  const center = samplePossession(phase);
  const right = samplePossession(phase + epsilon);
  const ballJump = distance(left.ball, right.ball);
  const leftVelocity = center.ball.map((value, i) => (value - left.ball[i]) / epsilon);
  const rightVelocity = center.ball.map((value, i) => (right.ball[i] - value) / epsilon);
  const ballVelocityJump = distance(leftVelocity, rightVelocity);
  assert.ok(ballJump < 1e-5, `Ball position jumps at ${phase}: ${ballJump}`);
  assert.ok(ballVelocityJump < .05, `Ball velocity jumps at ${phase}: ${ballVelocityJump}`);
  let maxPlayerJump = 0, maxHeadingJump = 0;
  for (let index = 0; index < center.players.length; index++) {
    const playerJump = distance(left.players[index].position, right.players[index].position);
    const headingJump = angleDistance(left.players[index].heading, right.players[index].heading);
    maxPlayerJump = Math.max(maxPlayerJump, playerJump);
    maxHeadingJump = Math.max(maxHeadingJump, headingJump);
    assert.ok(playerJump < .001, `Player ${index} position jumps at ${phase}: ${playerJump}`);
    assert.ok(headingJump < .001, `Player ${index} heading jumps at ${phase}: ${headingJump}`);
    for (const key of ['arms', 'reachBlend', 'reachBoth']) {
      assert.ok(Math.abs(left.players[index][key] - right.players[index][key]) < .001,
        `Player ${index} ${key} jumps at ${phase}`);
    }
    if (left.players[index].reachBlend > .001 && right.players[index].reachBlend > .001) {
      assert.ok(distance(left.players[index].reachTarget, right.players[index].reachTarget) < .001,
        `Player ${index} reach target jumps at ${phase}`);
    }
  }
  boundaryChecks.push({ phase, ballJump, ballVelocityJump, maxPlayerJump, maxHeadingJump });
}
const passes = [];
for (const action of playActions.filter(action => action.kind === 'pass')) {
  const start = samplePossession(action.start), middle = samplePossession((action.start + action.end) / 2), end = samplePossession(action.end);
  assert.equal(middle.owner, null);
  const participants = [action.passer, action.receiver];
  for (const index of participants) {
    assert.ok(distance(start.players[index].position, middle.players[index].position) < .001,
      `Player ${index} chases ball in ${action.start} pass`);
    assert.ok(distance(middle.players[index].position, end.players[index].position) < .001,
      `Player ${index} chases ball before ${action.end} catch`);
    assert.ok(distance(middle.ball, middle.players[index].position) > 2,
      `Player ${index} tethered to ball in ${action.start} pass`);
  }
  passes.push({ from: action.passer, to: action.receiver, start: action.start, end: action.end });
}
for (const phase of [.07, .17, .23, .3, .337, .38, .46, .57, .66, .715, .81, .93, .96]) {
  const expected = JSON.stringify(samplePossession(phase));
  for (const seek of [.98, 0, .68, .2, 1]) samplePossession(seek);
  assert.equal(JSON.stringify(samplePossession(phase)), expected, `Rewind differs at ${phase}`);
}
console.log(`Motion checks passed: 10,001 samples, ${boundaryChecks.length} action boundaries, ${passes.length} passes, four ball handlers, continuous poses, and exact rewind.`);

