"use client";

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import InteractiveSootField, {
	makeSpriteStates,
} from "@/components/effects/InteractiveSootField";

export default function GhibliSootCanvas() {
	const spriteStates = useRef(makeSpriteStates());

	return (
		<div
			aria-hidden="true"
			style={{
				position: "fixed",
				inset: 0,
				pointerEvents: "none",
				zIndex: "var(--sg-z-soot, 15)",
			}}
		>
			<Canvas
				gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
				camera={{ near: 0.1, far: 10 }}
				style={{ width: "100%", height: "100%", pointerEvents: "none" }}
				dpr={[1, 1]}
				events={false}
			>
				<InteractiveSootField renderOrder={0} spriteStates={spriteStates} />
			</Canvas>
		</div>
	);
}
