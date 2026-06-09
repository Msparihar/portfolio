"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import pollenGlsl from "@/shaders/pollen.js";
import sootInteractiveGlsl from "@/shaders/sootInteractive.js";

const VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const NUM_SPRITES = 3;

const WAYPOINTS = [
	[0.5, 0.09],
	[0.13, 0.84],
	[0.15, 0.22],
	[0.5, 0.6],
	[0.85, 0.8],
	[0.87, 0.55],
	[0.8, 0.2],
];

function hashFloat(n) {
	const x = Math.sin(n) * 43758.5453123;
	return x - Math.floor(x);
}

function getWaypoint(n) {
	return [...WAYPOINTS[Math.floor(hashFloat(n) * 7)]];
}

const LEG_DURS = [2.8, 3.35, 3.9];
const SPRITE_OFFSETS = [0, 4, 8];

function computeSpritePos(s, time) {
	const legDur = LEG_DURS[s];
	const offset = SPRITE_OFFSETS[s];
	const tt = time / legDur + offset;
	const leg = Math.floor(tt);
	const ft = tt - leg;
	const A = getWaypoint(leg + s * 17);
	const B = getWaypoint(leg + 1 + s * 17);
	const t60 = ft / 0.6;
	const e = ft < 0.6 ? t60 * t60 * (3 - 2 * t60) : 1;
	const moving = ft < 0.55 ? 1 : ft < 0.62 ? 1 - (ft - 0.55) / 0.07 : 0;
	const x = A[0] + (B[0] - A[0]) * e;
	const y = A[1] + (B[1] - A[1]) * e;
	const bounceY = Math.abs(Math.sin(ft * Math.PI * 5)) * 0.022 * moving;
	const driftX = Math.sin(time * 1.6 + s) * 0.003 * (1 - moving);
	return [x + driftX, y + bounceY];
}

const CLICK_RADIUS_PX = 36;
const REACTION_DURATION = 1.0;

function ShaderPlane({ fragmentShader, trackMouse, renderOrder }) {
	const meshRef = useRef(null);
	const { size } = useThree();
	const mouse = useRef(new THREE.Vector2(0, 0));

	useEffect(() => {
		if (!trackMouse) return;
		const handler = (e) => {
			mouse.current.set(e.clientX, size.height - e.clientY);
		};
		window.addEventListener("mousemove", handler, { passive: true });
		return () => window.removeEventListener("mousemove", handler);
	}, [trackMouse, size.height]);

	const material = useMemo(() => {
		const hasMouse = fragmentShader.includes("u_mouse");
		const uniforms = {
			u_time: { value: 0 },
			u_resolution: { value: new THREE.Vector2(size.width, size.height) },
		};
		if (hasMouse) uniforms.u_mouse = { value: new THREE.Vector2(0, 0) };
		if (fragmentShader.includes("u_color_top")) {
			uniforms.u_color_top = { value: new THREE.Color("#fff1c4") };
			uniforms.u_color_bottom = { value: new THREE.Color("#ffb24a") };
		}
		return new THREE.ShaderMaterial({
			vertexShader: VERTEX,
			fragmentShader,
			uniforms,
			transparent: true,
			depthWrite: false,
			depthTest: false,
		});
	}, [fragmentShader, size.width, size.height]);

	useFrame(({ clock }) => {
		material.uniforms.u_time.value = clock.getElapsedTime();
		if (material.uniforms.u_mouse) {
			material.uniforms.u_mouse.value.copy(mouse.current);
		}
	});

	return (
		<mesh ref={meshRef} renderOrder={renderOrder}>
			<planeGeometry args={[2, 2]} />
			<primitive object={material} attach="material" />
		</mesh>
	);
}

function InteractiveSootPlane({ renderOrder, spriteStates }) {
	const meshRef = useRef(null);
	const { size, clock } = useThree();
	const mouse = useRef(new THREE.Vector2(0, 0));

	useEffect(() => {
		const handler = (e) => {
			mouse.current.set(e.clientX, size.height - e.clientY);
		};
		window.addEventListener("mousemove", handler, { passive: true });
		return () => window.removeEventListener("mousemove", handler);
	}, [size.height]);

	const material = useMemo(() => {
		return new THREE.ShaderMaterial({
			vertexShader: VERTEX,
			fragmentShader: sootInteractiveGlsl,
			uniforms: {
				u_time: { value: 0 },
				u_resolution: { value: new THREE.Vector2(size.width, size.height) },
				u_mouse: { value: new THREE.Vector2(0, 0) },
				u_pos0: { value: new THREE.Vector2(0.5, 0.1) },
				u_pos1: { value: new THREE.Vector2(0.13, 0.84) },
				u_pos2: { value: new THREE.Vector2(0.15, 0.22) },
				u_state0: { value: 0 },
				u_state1: { value: 0 },
				u_state2: { value: 0 },
				u_react0: { value: 0 },
				u_react1: { value: 0 },
				u_react2: { value: 0 },
			},
			transparent: true,
			depthWrite: false,
			depthTest: false,
		});
	}, [size.width, size.height]);

	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

		const handler = (e) => {
			const t = clock.getElapsedTime();
			const { width, height } = size;
			if (!width || !height) return;

			for (let s = 0; s < NUM_SPRITES; s++) {
				const [px, py] = computeSpritePos(s, t);
				const screenX = px * width;
				const screenY = (1 - py) * height;
				const dx = e.clientX - screenX;
				const dy = e.clientY - screenY;

				if (Math.sqrt(dx * dx + dy * dy) <= CLICK_RADIUS_PX) {
					const st = spriteStates.current[s];
					if (st.reactionStart > 0) continue;

					st.state = mq.matches ? 1 : Math.random() < 0.5 ? 1 : 2;
					st.reactionStart = t;
					material.uniforms[`u_state${s}`].value = st.state;
					break;
				}
			}
		};

		window.addEventListener("pointerdown", handler);
		return () => window.removeEventListener("pointerdown", handler);
	}, [clock, size, spriteStates, material]);

	useFrame(({ clock: c }) => {
		const t = c.getElapsedTime();
		material.uniforms.u_time.value = t;
		material.uniforms.u_mouse.value.copy(mouse.current);

		const aspect = size.width / size.height;
		const mxNorm = mouse.current.x / size.width;
		const myNorm = mouse.current.y / size.height;

		for (let s = 0; s < NUM_SPRITES; s++) {
			const [px, py] = computeSpritePos(s, t);
			const st = spriteStates.current[s];

			if (st.reactionStart > 0) {
				const elapsed = t - st.reactionStart;
				const prog = Math.min(1, elapsed / REACTION_DURATION);
				material.uniforms[`u_react${s}`].value = prog < 1 ? 1 - prog : 0;
				if (prog >= 1) {
					st.reactionStart = 0;
					st.state = 0;
					material.uniforms[`u_state${s}`].value = 0;
				}
			} else {
				material.uniforms[`u_react${s}`].value = 0;
			}

			let rx = px;
			let ry = py;

			if (st.reactionStart === 0) {
				const dxA = px * aspect - mxNorm * aspect;
				const dyA = py - myNorm;
				const distA = Math.sqrt(dxA * dxA + dyA * dyA);
				const scare =
					distA < 0.2 ? Math.max(0, (0.2 - distA) / (0.2 - 0.07)) : 0;

				if (scare > 0) {
					const len = distA > 0.0001 ? distA : 0.0001;
					const driftStrength = scare * 0.035;
					rx = Math.max(
						0.05,
						Math.min(0.95, px + ((dxA / len) * driftStrength) / aspect),
					);
					ry = Math.max(0.05, Math.min(0.95, py + (dyA / len) * driftStrength));
				}
			}

			material.uniforms[`u_pos${s}`].value.set(rx, ry);
		}
	});

	return (
		<mesh ref={meshRef} renderOrder={renderOrder}>
			<planeGeometry args={[2, 2]} />
			<primitive object={material} attach="material" />
		</mesh>
	);
}

export default function GlslCanvas({
	showPollen = true,
	showSoot = true,
	zIndex,
}) {
	const spriteStates = useRef(
		Array.from({ length: NUM_SPRITES }, () => ({ state: 0, reactionStart: 0 })),
	);

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				pointerEvents: "none",
				zIndex: zIndex ?? "var(--sg-z-shaders, 4)",
			}}
			aria-hidden="true"
		>
			<Canvas
				gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
				camera={{ near: 0.1, far: 10 }}
				style={{ width: "100%", height: "100%", pointerEvents: "none" }}
				dpr={[1, 1]}
				events={false}
			>
				{showPollen && (
					<ShaderPlane
						fragmentShader={pollenGlsl}
						trackMouse={false}
						renderOrder={0}
					/>
				)}
				{showSoot && (
					<InteractiveSootPlane renderOrder={1} spriteStates={spriteStates} />
				)}
			</Canvas>
		</div>
	);
}
