const soot = `precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

const float PI = 3.14159265;

float hash(float n) { return fract(sin(n) * 43758.5453123); }

vec2 pt(float idx) {
  if (idx < 0.5) return vec2(0.50, 0.09);
  else if (idx < 1.5) return vec2(0.13, 0.84);
  else if (idx < 2.5) return vec2(0.15, 0.22);
  else if (idx < 3.5) return vec2(0.50, 0.60);
  else if (idx < 4.5) return vec2(0.85, 0.80);
  else if (idx < 5.5) return vec2(0.87, 0.55);
  else return vec2(0.80, 0.20);
}
vec2 waypoint(float n) { return pt(floor(hash(n) * 7.0)); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  vec2 m = u_mouse / u_resolution;
  vec2 ma = vec2(m.x * aspect, m.y);

  vec4 outc = vec4(0.0);

  for (int s = 0; s < 3; s++) {
    float fs = float(s);

    float legDur = 2.8 + fs * 0.55;
    float tt = u_time / legDur + fs * 4.0;
    float leg = floor(tt);
    float ft = fract(tt);
    vec2 A = waypoint(leg + fs * 17.0);
    vec2 B = waypoint(leg + 1.0 + fs * 17.0);
    float e = smoothstep(0.0, 0.6, ft);
    vec2 c = mix(A, B, e);
    float moving = 1.0 - smoothstep(0.55, 0.62, ft);
    c.y += abs(sin(ft * PI * 5.0)) * 0.022 * moving;
    c.x += sin(u_time * 1.6 + fs) * 0.003 * (1.0 - moving);
    vec2 roamA = vec2(c.x * aspect, c.y);

    float distM = distance(roamA, ma);
    float scare = smoothstep(0.20, 0.07, distM);

    float fx = mix(0.94, 0.06, step(0.5, m.x));
    float fy = mix(0.90, 0.10, step(0.5, m.y));
    vec2 fleeA = vec2(fx * aspect, fy);
    vec2 posA = mix(roamA, fleeA, pow(scare, 0.5));

    posA += vec2(sin(u_time * 38.0 + fs * 2.0), cos(u_time * 41.0 + fs)) * 0.004 * scare;

    float r = 0.019 * (1.0 - 0.22 * scare);
    float body = smoothstep(r, r * 0.55, distance(p, posA));

    float er = 0.0048;
    float squint = mix(1.0, 2.4, scare);
    vec2 eL = posA + vec2(-0.0072, 0.005);
    vec2 eR = posA + vec2(0.0072, 0.005);
    float dEL = length(vec2(p.x - eL.x, (p.y - eL.y) * squint));
    float dER = length(vec2(p.x - eR.x, (p.y - eR.y) * squint));
    float eyes = max(smoothstep(er, er * 0.4, dEL), smoothstep(er, er * 0.4, dER));

    vec3 calmEye = vec3(0.96, 0.94, 0.86);
    vec3 angryEye = vec3(1.0, 0.34, 0.20);
    vec3 eyeCol = mix(calmEye, angryEye, scare);

    vec3 calmBody = vec3(0.09, 0.08, 0.07);
    vec3 angryBody = vec3(0.17, 0.06, 0.05);
    vec3 bodyCol = mix(calmBody, angryBody, scare);

    vec3 col = mix(bodyCol, eyeCol, clamp(eyes * body * 1.6, 0.0, 1.0));

    float aura = smoothstep(r * 2.2, r, distance(p, posA)) * scare * 0.35;
    col += vec3(0.6, 0.12, 0.05) * aura;
    float a = max(body, aura) * (1.0 - 0.2 * scare);

    outc.rgb = mix(outc.rgb, col, a);
    outc.a = max(outc.a, a);
  }

  gl_FragColor = outc;
}`;

export default soot;
