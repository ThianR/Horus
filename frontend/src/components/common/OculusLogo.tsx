import { useEffect, useMemo, useRef, useState } from "react";

interface OculusLogoProps {
    width?: number;
    word?: string;
    revealStepMs?: number;
    hideStepMs?: number;
    className?: string;
}

export default function OculusLogo({
    width = 544,
    word = "OCULUS",
    revealStepMs = 45,
    hideStepMs = 30,
    className = ""
}: OculusLogoProps) {
    const [hover, setHover] = useState(false);
    const [visibleCount, setVisibleCount] = useState(0);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const letters = useMemo(() => word.split(""), [word]);

    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (hover) {
            setVisibleCount(0);
            timerRef.current = setInterval(() => {
                setVisibleCount((c) => {
                    const next = c + 1;
                    if (next >= letters.length) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        timerRef.current = null;
                        return letters.length;
                    }
                    return next;
                });
            }, revealStepMs);
        } else {
            timerRef.current = setInterval(() => {
                setVisibleCount((c) => {
                    const next = c - 1;
                    if (next <= 0) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        timerRef.current = null;
                        return 0;
                    }
                    return next;
                });
            }, hideStepMs);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [hover, letters.length, revealStepMs, hideStepMs]);

    const lineHidden = hover || visibleCount > 0;

    return (
        <svg
            viewBox="0 0 544 345"
            width={width}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className={`${className}`}
            style={{ cursor: "pointer", display: "block" }}
        >
            <defs>
                <radialGradient id="iris" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="#0a2336" />
                    <stop offset="55%" stopColor="#0b7fb0" />
                    <stop offset="100%" stopColor="#0fd0ff" />
                </radialGradient>

                <linearGradient id="outerShade" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0a0f1f" />
                    <stop offset="50%" stopColor="#0b1328" />
                    <stop offset="100%" stopColor="#0a0f1f" />
                </linearGradient>

                <filter id="glow" x="-40%" y="-120%" width="180%" height="340%">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <path
                d="M 10 172
           C 95 70, 185 25, 272 25
           C 359 25, 449 70, 534 172
           C 449 274, 359 319, 272 319
           C 185 319, 95 274, 10 172 Z"
                fill="url(#outerShade)"
            />

            <circle
                cx="272"
                cy="172"
                r="92"
                fill="none"
                stroke="url(#iris)"
                strokeWidth="34"
                opacity="0.95"
            />
            <circle cx="272" cy="172" r="60" fill="#0a1326" />

            <g opacity="0.30">
                <circle
                    cx="272"
                    cy="172"
                    r="92"
                    fill="none"
                    stroke="#a9f2ff"
                    strokeWidth="34"
                    strokeDasharray="18 12"
                    transform="rotate(-10 272 172)"
                />
            </g>

            <g
                filter="url(#glow)"
                style={{
                    opacity: lineHidden ? 0 : 1,
                    transform: lineHidden ? "scaleX(0.6)" : "scaleX(1)",
                    transformOrigin: "272px 172px",
                    transition: "opacity 140ms ease, transform 180ms ease"
                }}
            >
                <rect
                    x="72"
                    y="165"
                    width="400"
                    height="14"
                    rx="7"
                    fill="#21f3ff"
                    opacity="0.95"
                />
                <rect
                    x="72"
                    y="168"
                    width="400"
                    height="8"
                    rx="4"
                    fill="#6fffff"
                    opacity="0.35"
                />
            </g>

            <g
                filter="url(#glow)"
                style={{
                    opacity: visibleCount > 0 ? 1 : 0,
                    transition: "opacity 120ms ease"
                }}
            >
                {letters.map((ch, idx) => {
                    const shown = idx < visibleCount;

                    const spacing = 26;
                    const totalWidth = (letters.length - 1) * spacing;
                    const startX = 272 - totalWidth / 2;

                    const x = startX + idx * spacing;
                    const y = 176;

                    return (
                        <text
                            key={idx}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            fontFamily="Inter, Arial, sans-serif"
                            fontSize="44"
                            fontWeight="700"
                            letterSpacing="1"
                            fill="#21f3ff"
                            style={{
                                opacity: shown ? 1 : 0,
                                transform: shown ? "translate(0, 0)" : "translate(0, 10px)",
                                transformOrigin: `${x}px ${y}px`,
                                transition: "opacity 120ms ease, transform 140ms ease"
                            }}
                        >
                            {ch}
                        </text>
                    );
                })}
            </g>
        </svg>
    );
}
