const mist = `precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  float t = u_time * 0.03;
  float n = fbm(vec2(p.x * 2.4 - t, p.y * 3.0 + t * 0.3));
  n = fbm(p * 2.0 + vec2(t, n * 0.6));

  float band = smoothstep(0.34, 0.0, uv.y);
  float a = clamp(n * band * 0.95, 0.0, 1.0) * 0.55;

  gl_FragColor = vec4(u_color * a, a);
}`;

export default mist;
