"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide, BufferAttribute, BufferGeometry, Color, ShaderMaterial, type Points } from "three";
import { seeded } from "@/features/garden/scene/heightmap";

const VERTEX = /* glsl */ `
  varying float vY;
  void main() {
    vY = normalize(position).y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FRAGMENT = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  varying float vY;
  void main() {
    float t = smoothstep(-0.05, 0.55, vY);
    gl_FragColor = vec4(mix(uHorizon, uTop, t), 1.0);
  }
`;

interface SkyProps {
  top: string;
  horizon: string;
  night: boolean;
  lightPosition: [number, number, number];
  animate: boolean;
}

/** Cúpula de céu em degradê, com sol de dia e lua com estrelas à noite. */
export function Sky({ top, horizon, night, lightPosition, animate }: SkyProps) {
  const material = useRef<ShaderMaterial>(null);
  const stars = useRef<Points>(null);

  const uniforms = useMemo(() => ({ uTop: { value: new Color() }, uHorizon: { value: new Color() } }), []);

  const starGeometry = useMemo(() => {
    const rand = seeded(11);
    const positions = new Float32Array(260 * 3);
    for (let i = 0; i < 260; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(0.12 + rand() * 0.88);
      const r = 70;
      positions.set(
        [r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta) - 10],
        i * 3,
      );
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const mat = material.current;
    if (mat) {
      mat.uniforms.uTop.value.set(top);
      mat.uniforms.uHorizon.value.set(horizon);
    }
    if (stars.current && animate) stars.current.rotation.y = clock.elapsedTime * 0.003;
  });

  // O disco (sol ou lua) fica no fundo da cena, na direção da luz, sempre dentro do quadro.
  const [lx, ly] = lightPosition;
  const discPosition: [number, number, number] = [
    Math.max(-40, Math.min(40, lx * 3.2)),
    Math.min(19, ly * 1.8),
    -62,
  ];

  return (
    <group>
      <mesh>
        <sphereGeometry args={[85, 24, 16]} />
        <shaderMaterial
          ref={material}
          vertexShader={VERTEX}
          fragmentShader={FRAGMENT}
          uniforms={uniforms}
          side={BackSide}
          depthWrite={false}
        />
      </mesh>

      <mesh position={discPosition}>
        <sphereGeometry args={[night ? 2.4 : 4.2, 24, 16]} />
        <meshBasicMaterial color={night ? "#f2ece4" : "#fff3c4"} fog={false} />
      </mesh>
      <mesh position={discPosition}>
        <sphereGeometry args={[night ? 4.2 : 9, 24, 16]} />
        <meshBasicMaterial
          color={night ? "#b8c8ff" : "#ffe9a0"}
          transparent
          opacity={night ? 0.09 : 0.2}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      {night && (
        <points ref={stars} geometry={starGeometry}>
          <pointsMaterial color="#fdf6d8" size={2.2} sizeAttenuation={false} fog={false} />
        </points>
      )}
    </group>
  );
}
