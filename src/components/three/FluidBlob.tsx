"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface FluidBlobProps {
  /** Posição do cursor (-1..1). Sem ele, o blob não reage ao mouse. */
  pointer?: MutableRefObject<{ x: number; y: number }>;
  /**
   * Quando informado, a escala do blob é controlada de fora (ex.: respiração guiada).
   * Sem ele, o blob "respira" sozinho, bem de leve.
   */
  scaleRef?: MutableRefObject<{ scale: number }>;
}

const NO_POINTER = { current: { x: 0, y: 0 } };

export function FluidBlob({ pointer = NO_POINTER, scaleRef }: FluidBlobProps) {
  const meshRef = useRef<THREE.Mesh<THREE.IcosahedronGeometry, THREE.ShaderMaterial> | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const target = useMemo(() => new THREE.Vector2(), []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
        },
        vertexShader: `
          uniform float uTime;
          uniform vec2 uMouse;
          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {
            vNormal = normal;
            vec3 pos = position;

            float waveA = sin(pos.y * 2.1 + uTime * 0.65) * 0.055;
            float waveB = cos(pos.x * 1.8 + uTime * 0.55) * 0.045;
            float waveC = sin((pos.z + pos.x) * 2.3 + uTime * 0.4) * 0.03;
            float breath = sin(uTime * 0.52) * 0.05;
            float cursorInfluence = (uMouse.x * pos.x + uMouse.y * pos.y) * 0.04;

            pos += normal * (waveA + waveB + waveC + breath + cursorInfluence);

            vPosition = pos;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {
            vec3 light = normalize(vec3(0.35, 0.85, 0.45));
            float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.4);
            float diff = max(dot(normalize(vNormal), light), 0.0);

            vec3 baseA = vec3(0.20, 0.27, 0.12);
            vec3 baseB = vec3(0.56, 0.64, 0.40);
            vec3 color = mix(baseA, baseB, vPosition.y * 0.5 + 0.5);
            color += fresnel * 0.18;
            color += diff * 0.14;

            gl_FragColor = vec4(color, 0.8);
          }
        `,
        transparent: true,
      }),
    [],
  );

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    const t = state.clock.getElapsedTime();
    materialRef.current.uniforms.uTime.value = t;

    target.set(pointer.current.x, pointer.current.y);
    (materialRef.current.uniforms.uMouse.value as THREE.Vector2).lerp(target, 1 - Math.exp(-4 * delta));

    meshRef.current.rotation.y += delta * 0.22;
    meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    meshRef.current.scale.setScalar(scaleRef ? scaleRef.current.scale : 1 + Math.sin(t * 0.52) * 0.022);
  });

  return (
    <mesh ref={meshRef}>
      <primitive object={material} ref={materialRef} attach="material" />
      <icosahedronGeometry args={[1.58, 24]} />
    </mesh>
  );
}
