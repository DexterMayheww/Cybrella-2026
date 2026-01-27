"use client";
import { Magnet } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

interface MagneticParticlesProps {
    particleColor?: string;
    particleCountDensity?: number; // Lower is more particles (default: 15000)
    magneticRadius?: number;      // How far the pull reaches (default: 250)
    magneticStrength?: number;    // How fast they move toward mouse (default: 0.4)
    baseSpeed?: number;           // Background drift speed (default: 0.5)
}

class Particle {
    x: number; y: number; baseSize: number; size: number;
    vx: number; vy: number; density: number;

    constructor(width: number, height: number, baseSpeed: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseSize = Math.random() * 2 + 0.5;
        this.size = this.baseSize;
        // Drift Speed Control
        this.vx = (Math.random() - 0.5) * baseSpeed;
        this.vy = (Math.random() - 0.5) * baseSpeed;
        this.density = (Math.random() * 20) + 1;
    }

    update(
        width: number,
        height: number,
        mouse: { x: number; y: number },
        radius: number,
        strength: number,
        isAttracting: boolean
    ) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // --- MAGNETIC LOGIC ---
        if (distance < radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            // Formula: (Radius - Distance) / Radius creates a 1 to 0 gradient
            const force = (radius - distance) / radius;

            // Toggle logic: multiply by -1 for repulsion
            const directionMultiplier = isAttracting ? 1 : -1;

            this.x += forceDirectionX * force * this.density * strength * directionMultiplier;
            this.y += forceDirectionY * force * this.density * strength * directionMultiplier;
            this.size = this.baseSize * 1.5;
        } else {
            this.size = this.baseSize;
        }
    }

    draw(ctx: CanvasRenderingContext2D, color: string) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    // Inside the Particle class
    burst(mouseX: number, mouseY: number) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = 15; // Explosive power

        // Set velocity to fly away from center
        this.vx = (dx / distance) * force + (Math.random() - 0.5) * 5;
        this.vy = (dy / distance) * force + (Math.random() - 0.5) * 5;
    }
}

export const MagneticParticles = ({
    particleColor = "rgba(34, 211, 238, 0.9)",
    particleCountDensity = 5000,
    magneticRadius = 450,
    magneticStrength = 0.4,
    baseSpeed = 0.7
}: MagneticParticlesProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0 });

    const [isAttracting, setIsAttracting] = useState(magneticStrength > 0);
    const isAttractingRef = useRef(isAttracting);
    useEffect(() => {
        isAttractingRef.current = isAttracting;
    }, [isAttracting]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;

        const init = () => {
            particles = [];
            // QUANTITY: Decreasing the divisor (15000) increases the number of particles
            const count = (canvas.width * canvas.height) / particleCountDensity;
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(canvas.width, canvas.height, baseSpeed));
            }
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Inside the animate function, after ctx.clearRect
            let particlesInCenter = 0;
            const captureRadius = 40; // Tightness of the collection

            particles.forEach((p) => {
                p.update(canvas.width, canvas.height, mouse.current, magneticRadius, magneticStrength, isAttractingRef.current);
                p.draw(ctx, particleColor);

                // Check proximity
                const dx = mouse.current.x - p.x;
                const dy = mouse.current.y - p.y;
                if (Math.sqrt(dx * dx + dy * dy) < captureRadius) particlesInCenter++;
            });

            // Trigger Easter Egg
            if (
                isAttractingRef.current &&
                particlesInCenter > particles.length * 0.95 &&
                !isBurstingRef.current
            ) {
                isBurstingRef.current = true;

                // Make particles explode
                particles.forEach(p => p.burst(mouse.current.x, mouse.current.y));

                // Reset after 1.5 seconds
                setTimeout(() => {
                    isBurstingRef.current = false;
                    // Optional: normalize speeds back to drift speed
                    particles.forEach(p => {
                        p.vx = (Math.random() - 0.5) * 0.5;
                        p.vy = (Math.random() - 0.5) * 0.5;
                    });
                }, 2500);
            }
            particles.forEach((p) => {
                p.update(canvas.width, canvas.height, mouse.current, magneticRadius, magneticStrength, isAttractingRef.current);
                p.draw(ctx, particleColor);
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);
        resize();
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [particleColor, particleCountDensity, magneticRadius, magneticStrength, baseSpeed]);

    const isBurstingRef = useRef(false);

    return (
        <div className="absolute inset-0 z-100 h-full w-full pointer-events-none">
            <canvas
                ref={canvasRef}
                className="pointer-events-none absolute inset-0 opacity-90 w-full"
            />

            {/* Magnet Toggle Button */}
            <button
                onClick={() => setIsAttracting(!isAttracting)}
                className={`
          pointer-events-auto absolute top-6 right-6 flex items-center gap-2 
          px-4 py-2 rounded-full border transition-all duration-300
          ${isAttracting
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                        : "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]"}
        `}
            >
                <Magnet className={`w-4 h-4 transition-transform ${!isAttracting ? "rotate-180" : ""}`} />
                <span className="text-xs font-bold uppercase tracking-wider">
                    {isAttracting ? "Attract" : "Repel"}
                </span>
            </button>
        </div>
    );
};