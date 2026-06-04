const godrays = `precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color;

float hash(float n) { return fract(sin(n) * 43758.5453123); }
float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  vec2 origin = vec2(0.30 * aspect, 1.08);
  vec2 d = p - origin;
  float ang = atan(d.y, d.x);
  float dist = length(d);

  float t = u_time * 0.06;
  float shafts = 0.5 + 0.5 * sin(ang * 17.0 + t * 6.0 + noise(ang * 5.0 + t) * 3.0);
  shafts *= 0.5 + 0.5 * sin(ang * 6.0 - t * 3.0);
  shafts = pow(clamp(shafts, 0.0, 1.0), 2.2);

  float falloff = smoothstep(1.35, 0.12, dist);
  float topMask = smoothstep(-0.1, 0.65, uv.y);
  float a = shafts * falloff * topMask * 0.45;

  gl_FragColor = vec4(u_color * a, a);
}`;

export default godrays;
