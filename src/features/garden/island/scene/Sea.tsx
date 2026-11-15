"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, ShaderMaterial, type Mesh } from "three";

/**
 * Mar: ondas no próprio shader (sem mexer em vértices pelo processador), água rasinha clara
 * perto da ilha, espuma na borda saindo em anéis e brilhinhos que piscam.
 */
export function Sea({ night, animate }: { night: boolean; animate: boolean }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uDeep: { value: new Color(night ? 0x203547 : 0x5faeb4) },
          uShallow: { value: new Color(night ? 0x2f4a5a : 0x8fdccc) },
          uNight: { value: night ? 1 : 0 },
        },
        vertexShader: `
          uniform float uTime;
          varying vec2 vXZ;
          void main() {
            vec3 p = position;
            p.z += sin(p.x * 0.12 + uTime * 0.9) * 0.22 + cos(p.y * 0.16 + uTime * 0.7) * 0.18;
            vXZ = vec2(position.x, -position.y);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }`,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uDeep;
          uniform vec3 uShallow;
          uniform float uNight;
          varying vec2 vXZ;
          float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
          void main() {
            float d = length(vXZ);
            float shallow = smoothstep(20.0, 13.2, d);
            vec3 col = mix(uDeep, uShallow, shallow * 0.75);
            float rings = smoothstep(0.82, 0.97, sin((d - uTime * 0.55) * 3.2)) * smoothstep(19.5, 13.5, d);
            float shore = smoothstep(14.0, 13.0, d);
            col = mix(col, vec3(1.0, 0.99, 0.95) * (1.0 - uNight * 0.45), clamp(shore * 0.9 + rings * 0.5, 0.0, 1.0) * 0.85);
            vec2 cell = floor(vXZ * 1.2);
            vec2 local = fract(vXZ * 1.2) - 0.5;
            float tw = hash(cell + floor(uTime * 1.2 + hash(cell) * 7.0));
            float spark = step(0.975, tw) * (1.0 - smoothstep(0.02, 0.07, abs(local.x) + abs(local.y))) * (1.0 - uNight * 0.5) * smoothstep(60.0, 18.0, d);
            gl_FragColor = vec4(col + spark, 0.96);
          }`,
      }),
    [night],
  );

  const sea = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const mat = sea.current?.material as ShaderMaterial | undefined;
    if (mat && animate) mat.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh ref={sea} rotation-x={-Math.PI / 2} material={material} position-y={0.05}>
      <planeGeometry args={[220, 220, 90, 90]} />
    </mesh>
  );
}
