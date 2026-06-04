const glassShimmer = `precision highp float;

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

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = u_time * 0.05;

  float n = noise(uv * 3.0 + vec2(t, t * 0.6));
  float bands = 0.5 + 0.5 * sin((uv.x + uv.y) * 6.0 + n * 4.0 + t * 4.0);
  float sheen = pow(bands, 3.0) * 0.12;
  sheen *= smoothstep(0.0, 1.0, uv.y) * 0.7 + 0.3;

  gl_FragColor = vec4(u_color * sheen, sheen);
}`;

export default glassShimmer;
