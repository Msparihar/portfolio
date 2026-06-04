const pollen = `precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color_top;
uniform vec3 u_color_bottom;

float hash(float n) { return fract(sin(n) * 43758.5453123); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p2 = uv; p2.x *= aspect;

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  const int COUNT = 64;
  for (int i = 0; i < COUNT; i++) {
    float fi = float(i);
    float seedX = hash(fi * 1.7);
    float seedY = hash(fi * 3.3);
    seedY = seedY * seedY;
    float speed = 0.012 + 0.04 * hash(fi * 5.1);
    float sway  = 0.05 * sin(u_time * (0.25 + hash(fi * 2.2) * 0.6) + fi);

    float py = mod(seedY - u_time * speed, 1.15) - 0.05;
    float px = seedX * aspect + sway;
    vec2 pp = vec2(px, py);

    float d = distance(p2, pp);
    float size = 0.0035 + 0.006 * hash(fi * 7.7);
    float twinkle = 0.55 + 0.45 * sin(u_time * (1.0 + hash(fi * 9.1) * 2.2) + fi * 1.3);

    float heightGain = mix(1.6, 0.45, clamp(py, 0.0, 1.0));
    float glow = pow(clamp(size / d * 0.5, 0.0, 1.0), 1.5) * twinkle * heightGain;

    vec3 tint = mix(u_color_bottom, u_color_top, clamp(py, 0.0, 1.0));

    alpha += glow;
    col += tint * glow;
  }

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), clamp(alpha, 0.0, 1.0));
}`;

export default pollen;
