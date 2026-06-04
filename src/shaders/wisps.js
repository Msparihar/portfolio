const wisps = `precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color_top;
uniform vec3 u_color_bottom;

float hash(float n) { return fract(sin(n) * 43758.5453123); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  const int N = 9;
  for (int i = 0; i < N; i++) {
    float fi = float(i);
    float sx = hash(fi * 1.3);
    float speed = 0.01 + 0.022 * hash(fi * 4.7);
    float py = mod(hash(fi * 2.9) + u_time * speed, 1.2) - 0.1;
    float wander = 0.06 * sin(u_time * (0.2 + hash(fi * 3.1) * 0.4) + fi * 2.0)
                 + 0.03 * sin(u_time * 0.5 + fi);
    float px = sx * aspect + wander;
    vec2 pp = vec2(px, py);

    float dd = distance(p, pp);
    float size = 0.012 + 0.020 * hash(fi * 6.1);
    float pulse = 0.7 + 0.3 * sin(u_time * (0.7 + hash(fi * 8.3) * 0.8) + fi);

    float halo = pow(clamp(size / dd * 0.5, 0.0, 1.0), 1.4) * pulse;
    float core = smoothstep(size * 0.55, 0.0, dd) * pulse;
    float g = halo * 0.5 + core;

    vec3 tint = mix(u_color_bottom, u_color_top, clamp(core * 1.5, 0.0, 1.0));
    alpha += g;
    col += tint * g;
  }

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), clamp(alpha, 0.0, 1.0));
}`;

export default wisps;
