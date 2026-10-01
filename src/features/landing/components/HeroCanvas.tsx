"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FluidMesh({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const meshRef = useRef<THREE.Mesh<THREE.IcosahedronGeometry, THREE.ShaderMaterial> | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

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

            vec3 baseA = vec3(0.07, 0.20, 0.16);
            vec3 baseB = vec3(0.31, 0.41, 0.34);
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

    (materialRef.current.uniforms.uMouse.value as THREE.Vector2).lerp(
      new THREE.Vector2(pointer.current.x, pointer.current.y),
      1 - Math.exp(-4 * delta),
    );

    meshRef.current.rotation.y += delta * 0.22;
    meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    const scale = 1 + Math.sin(t * 0.52) * 0.022;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef}>
      <primitive object={material} ref={materialRef} attach="material" />
      <icosahedronGeometry args={[1.58, 24]} />
    </mesh>
  );
}

function CanvasFallback() {
  return <div className="absolute inset-0 bg-linear-to-br from-emerald-100/35 via-teal-100/20 to-stone-200/40 animate-pulse" />;
}

export function HeroCanvas() {
  const [isMobile, setIsMobile] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => setIsMobile(mq.matches);
    update();

    const onMouseMove = (event: MouseEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * -2;
    };

    window.addEventListener("mousemove", onMouseMove);
    mq.addEventListener("change", update);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      mq.removeEventListener("change", update);
    };
  }, []);

  if (isMobile) {
    return <CanvasFallback />;
  }

  return (
    <div className="absolute inset-0">
      <Suspense fallback={<CanvasFallback />}>
        <Canvas camera={{ position: [0, 0, 5], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.56} />
          <hemisphereLight args={["#d9f6ea", "#f5efe4", 0.45]} />
          <directionalLight position={[2, 2, 3]} intensity={0.95} color="#d9f6ea" />
          <directionalLight position={[-2, -1, 2]} intensity={0.45} color="#f5efe4" />
          <FluidMesh pointer={pointer} />
        </Canvas>
      </Suspense>
    </div>
  );
}
