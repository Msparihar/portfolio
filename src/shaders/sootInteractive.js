const sootInteractive = `precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

uniform vec2 u_pos0;
uniform vec2 u_pos1;
uniform vec2 u_pos2;
uniform float u_state0;
uniform float u_state1;
uniform float u_state2;
uniform float u_react0;
uniform float u_react1;
uniform float u_react2;

void drawSprite(
  vec2 p, vec2 pos, float aspect,
  float state, float react,
  inout vec4 outc
) {
  vec2 posA = vec2(pos.x * aspect, pos.y);

  vec2 ma = vec2(u_mouse.x / u_resolution.x * aspect, u_mouse.y / u_resolution.y);
  float distM = distance(posA, ma);
  float alert = smoothstep(0.22, 0.06, distM) * (1.0 - step(0.5, state));

  float reacting = step(0.01, react);

  float angryReact = reacting * step(0.5, state) * (1.0 - step(1.5, state));
  float laughReact = reacting * step(1.5, state);

  float totalAngry = max(alert, angryReact);
  float totalLaugh = laughReact;

  float shakeX = 0.0;
  if (angryReact > 0.0) {
    shakeX = sin(u_time * 48.0) * 0.009 * angryReact;
  }

  float laughSquashY = 1.0;
  float laughBounce = 0.0;
  if (laughReact > 0.0) {
    float phase = u_time * 10.0;
    laughSquashY = 1.0 + sin(phase) * 0.35 * laughReact;
    laughBounce = abs(sin(phase * 0.5)) * 0.018 * laughReact;
  }

  float r = 0.019 * (1.0 - 0.22 * totalAngry);
  r = r / max(laughSquashY, 0.01);

  vec2 finalPos = posA + vec2(shakeX, laughBounce);

  vec2 diff = p - finalPos;
  float bodyDist = length(vec2(diff.x, diff.y * laughSquashY));
  float body = smoothstep(r, r * 0.55, bodyDist);

  float er = 0.0048;
  float squint = mix(1.0, 2.4, totalAngry);

  vec2 eL = finalPos + vec2(-0.0072, 0.005);
  vec2 eR = finalPos + vec2(0.0072, 0.005);

  float dEL, dER, eyes;
  if (laughReact > 0.0) {
    float archL = length(vec2((p.x - eL.x) * 1.8, max(0.0, p.y - eL.y - 0.002)));
    float archR = length(vec2((p.x - eR.x) * 1.8, max(0.0, p.y - eR.y - 0.002)));
    float laughEyes = max(
      smoothstep(er * 1.1, er * 0.5, archL),
      smoothstep(er * 1.1, er * 0.5, archR)
    );
    dEL = length(vec2(p.x - eL.x, (p.y - eL.y) * squint));
    dER = length(vec2(p.x - eR.x, (p.y - eR.y) * squint));
    float normalEyes = max(smoothstep(er, er * 0.4, dEL), smoothstep(er, er * 0.4, dER));
    eyes = mix(normalEyes, laughEyes, laughReact);
  } else {
    dEL = length(vec2(p.x - eL.x, (p.y - eL.y) * squint));
    dER = length(vec2(p.x - eR.x, (p.y - eR.y) * squint));
    eyes = max(smoothstep(er, er * 0.4, dEL), smoothstep(er, er * 0.4, dER));
  }

  vec3 calmEye = vec3(0.96, 0.94, 0.86);
  vec3 angryEye = vec3(1.0, 0.34, 0.20);
  vec3 laughEye = vec3(0.96, 0.94, 0.86);
  vec3 eyeCol = calmEye;
  eyeCol = mix(eyeCol, angryEye, totalAngry);
  eyeCol = mix(eyeCol, laughEye, totalLaugh);

  vec3 calmBody = vec3(0.09, 0.08, 0.07);
  vec3 angryBody = vec3(0.17, 0.06, 0.05);
  vec3 laughBody = vec3(0.09, 0.09, 0.08);
  vec3 bodyCol = calmBody;
  bodyCol = mix(bodyCol, angryBody, totalAngry);
  bodyCol = mix(bodyCol, laughBody, totalLaugh);

  vec3 col = mix(bodyCol, eyeCol, clamp(eyes * body * 1.6, 0.0, 1.0));

  float aura = smoothstep(r * 2.2, r, bodyDist) * totalAngry * 0.35;
  col += vec3(0.6, 0.12, 0.05) * aura;

  if (laughReact > 0.0) {
    float laughAura = smoothstep(r * 2.5, r * 0.8, bodyDist) * laughReact * 0.15;
    col += vec3(0.6, 0.7, 0.3) * laughAura;
    aura = max(aura, laughAura);
  }

  float a = max(body, aura) * (1.0 - 0.2 * totalAngry);

  outc.rgb = mix(outc.rgb, col, a);
  outc.a = max(outc.a, a);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  vec4 outc = vec4(0.0);

  drawSprite(p, u_pos0, aspect, u_state0, u_react0, outc);
  drawSprite(p, u_pos1, aspect, u_state1, u_react1, outc);
  drawSprite(p, u_pos2, aspect, u_state2, u_react2, outc);

  gl_FragColor = outc;
}`;

export default sootInteractive;
