"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  PlaneGeometry,
  ShaderMaterial,
} from "three";
import { BED_RADIUS, heightAt, seeded } from "@/features/garden/scene/terrain";

const VERTEX = /* glsl */ `
  attribute vec3 aOffset;
  attribute vec2 aShape; // x: altura, y: ângulo
  uniform float uTime;
  varying float vTip;
  varying float vDepth;
  void main() {
    vec3 p = position;
    float tip = p.y;
    p.y *= aShape.x;
    float c = cos(aShape.y);
    float s = sin(aShape.y);
    p.xz = mat2(c, -s, s, c) * p.xz;
    float sway = sin(uTime * 1.5 + aOffset.x * 0.8 + aOffset.z * 0.6) * 0.16 * tip * tip;
    p.x += sway;
    p.z += sway * 0.4;
    vec4 mv = modelViewMatrix * vec4(p + aOffset, 1.0);
    vTip = tip;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uTip;
  uniform vec3 uFog;
  uniform float uNear;
  uniform float uFar;
  varying float vTip;
  varying float vDepth;
  void main() {
    vec3 color = mix(uBase, uTip, vTip);
    float fog = smoothstep(uNear, uFar, vDepth);
    gl_FragColor = vec4(mix(color, uFog, fog), 1.0);
  }
`;

interface GrassProps {
  count: number;
  animate: boolean;
  night: boolean;
  fog: string;
}

/** Milhares de lâminas de grama em uma única chamada de desenho. O vento é calculado na GPU. */
export function Grass({ count, animate, night, fog }: GrassProps) {
  const material = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const blade = new PlaneGeometry(0.07, 1, 1, 3);
    blade.translate(0, 0.5, 0);
    // Afina a ponta: vértices do topo viram um ponto.
    const pos = blade.getAttribute("position");
    for (let i = 0; i < pos.count; i++) pos.setX(i, pos.getX(i) * (1 - pos.getY(i) * 0.85));

    const geo = new InstancedBufferGeometry();
    geo.index = blade.index;
    geo.setAttribute("position", blade.getAttribute("position"));

    const rand = seeded(42);
    const offsets = new Float32Array(count * 3);
    const shapes = new Float32Array(count * 2);
    let placed = 0;
    while (placed < count) {
      const radius = BED_RADIUS - 0.1 + Math.sqrt(rand()) * 26;
      const angle = rand() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius * 0.9 - 4;
      if (Math.hypot(x, z) < BED_RADIUS - 0.2 || z > 5.5) continue;
      offsets.set([x, heightAt(x, z), z], placed * 3);
      shapes.set([0.3 + rand() * 0.45, rand() * Math.PI], placed * 2);
      placed++;
    }
    geo.setAttribute("aOffset", new InstancedBufferAttribute(offsets, 3));
    geo.setAttribute("aShape", new InstancedBufferAttribute(shapes, 2));
    geo.instanceCount = count;
    return geo;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBase: { value: new Color("#4f6a2c") },
      uTip: { value: new Color("#a9c26f") },
      uFog: { value: new Color("#fcf8df") },
      uNear: { value: 14 },
      uFar: { value: 38 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    const mat = material.current;
    if (!mat) return;
    if (animate) mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uFog.value.set(fog);
    mat.uniforms.uBase.value.set(night ? "#2c3b1c" : "#4f6a2c");
    mat.uniforms.uTip.value.set(night ? "#6f8350" : "#a9c26f");
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        side={DoubleSide}
      />
    </mesh>
  );
}
