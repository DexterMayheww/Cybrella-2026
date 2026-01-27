// Cursor Highlight - src/app/components/mouse-effects/CursorHighlight.tsx

"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useEffect } from "react";

export default function CursorHighlight() {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	useEffect(() => {
		const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
			mouseX.set(clientX);
			mouseY.set(clientY);
		};
		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [mouseX, mouseY]);

	return (
		<motion.div
			className="pointer-events-none fixed inset-0 z-0 transition duration-300 lg:absolute"
			style={{
				background: useMotionTemplate`
          radial-gradient(
            600px circle at ${mouseX}px ${mouseY}px,
            rgba(29, 78, 216, 0.15),
            transparent 80%
          )
        `,
			}}
		/>
	);
};