"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  PCFShadowMap,
  Vector3,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type MeshToonMaterial,
  type PerspectiveCamera,
} from "three";
import { Plant, PLANT_SPOTS, type BumpRef } from "@/features/garden/components/Plants";
import {
  heightAt,
  PLACES,
  placeById,
  type PlaceId,
  type Season,
  type Unlock,
} from "@/features/garden/island/places";
import {
  BED_SPOTS,
  makeBeds,
  makeBlob,
  makeCabin,
  makeDock,
  makeGroundLabel,
  makeIslet,
  makeIslandBody,
  makeLighthouse,
  makeTree,
  makeUnlock,
  rng,
  ROCK,
} from "@/features/garden/island/scene/builders";
import { breathAt } from "@/features/garden/island/boatTrip";
import { Animals } from "@/features/garden/island/scene/Animals";
import { Effects } from "@/features/garden/island/scene/Effects";
import { Beach, GratitudeLanterns, Highlights } from "@/features/garden/island/scene/Extras";
import { makeFallenLeaves, makeFoliage, type Foliage } from "@/features/garden/island/scene/foliage";
import { Fox } from "@/features/garden/island/scene/Fox";
import { IslandGrass } from "@/features/garden/island/scene/IslandGrass";
import { Sea } from "@/features/garden/island/scene/Sea";
import { Weather } from "@/features/garden/island/scene/Weather";
import type { PlantKind, PlantState } from "@/features/garden/types";

export interface IslandCanvasProps {
  plants: PlantState[];
  selected: PlaceId | null;
  unlocked: Unlock[];
  season: Season;
  night: boolean;
  animate: boolean;
  quality: "high" | "low";
  /** Muda o número quando ela deve pular de alegria (ganhou gota, regou). */
  joy: number;
  onSelect: (place: PlaceId) => void;
  /** Toque no chão: a raposa vai até ali (e o painel aberto fecha). */
  onGround: () => void;
  onPet: () => void;
  onSelectPlant?: (kind: PlantKind) => void;
  /** Entrada de cinema: a câmera desce do céu girando até a ilha. */
  intro?: boolean;
  /** Está chovendo (a página decide quando chove, para o som acompanhar). */
  raining?: boolean;
  /** Travessia de barco respirando: quando saiu do cais e quantas respirações. */
  trip?: { startedAt: number; cycles: number } | null;
  /** Muda a cada pedra jogada no mar, na Praia. */
  throwId?: number;
  /** Quantas lanternas da gratidão acender no céu à noite. */
  lanterns?: number;
  /** Lugares com novidade: ganham um brilho em cima. */
  highlights?: PlaceId[];
  /** A cena 3D já está na tela (para a intro começar junto). */
  onReady?: () => void;
}

const BED_AT = placeById("canteiros");

const FLY_SECONDS = 3.2;
const NO_HIGHLIGHTS: PlaceId[] = [];

/**
 * Câmera alta e em diagonal (como o portfólio do Bruno Simon), que chega perto do lugar escolhido.
 * Arrastar para os lados gira a ilha; no celular a câmera fica mais de cima, para a ilha caber em pé.
 * Com `intro`, ela começa lá no alto e desce girando até a ilha.
 */
function CameraRig({
  selected,
  animate,
  intro,
  follow,
}: {
  selected: PlaceId | null;
  animate: boolean;
  intro: boolean;
  /** Na travessia, a câmera acompanha o barco. */
  follow: MutableRefObject<Vector3> | null;
}) {
  const target = useRef(new Vector3(0, 1, 0));
  const cur = useRef({ r: 25, theta: 0.5, phi: 0.84 });
  const shift = useRef({ x: 0, y: 0 });
  const fly = useRef<number | null>(intro && animate ? 0 : null);
  const spin = useRef({ yaw: 0, down: false, lastX: 0 });
  const gl = useThree((state) => state.gl);

  // Arrastar na horizontal gira; na vertical a página continua rolando (touch-action: pan-y).
  useEffect(() => {
    const el = gl.domElement;
    const s = spin.current;
    const down = (e: PointerEvent) => {
      s.down = true;
      s.lastX = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (!s.down) return;
      s.yaw -= (e.clientX - s.lastX) * 0.006;
      s.lastX = e.clientX;
    };
    const up = () => {
      s.down = false;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  useFrame(({ camera, size }, delta) => {
    const place = selected ? placeById(selected) : null;
    const goal = follow
      ? new Vector3(follow.current.x, 1.5, follow.current.z)
      : place
        ? new Vector3(place.x, 1.6, place.z)
        : new Vector3(0, 1, 0);
    const aspect = size.width / size.height;
    const portrait = aspect < 1;
    // Tela em pé: recua só um pouco e olha mais de cima (assim a ilha não fica minúscula).
    const fit = portrait ? Math.min(2, 0.95 / aspect) : Math.max(1, 1.55 / aspect);
    const base = follow ? 20 : place ? (place.id === "cabana" ? 12 : place.id === "farol" ? 18 : 14) : 25;
    const r = base * fit;
    const phi = follow ? 0.95 : place?.id === "cabana" ? 0.62 : portrait ? 0.62 : 0.84;
    const theta = (place ? Math.atan2(place.x, place.z) + 0.35 : 0.5) + spin.current.yaw;
    const k = animate ? Math.min(1, delta * 2.5) : 1;
    target.current.lerp(goal, k);
    const c = cur.current;
    if (fly.current !== null && intro && !spin.current.down) {
      // Intro: do alto (quase de cima) até o lugar de sempre, girando, com freio no fim.
      fly.current += Math.min(delta, 0.05);
      const t = Math.min(1, fly.current / FLY_SECONDS);
      const away = Math.pow(1 - t, 3);
      c.r = r * (1 + 1.8 * away);
      c.phi = phi + (0.08 - phi) * away;
      c.theta = theta + 2.4 * away;
      if (t >= 1) fly.current = null;
    } else {
      // Pulou a intro: segue dali mesmo, suave.
      fly.current = null;
      c.r += (r - c.r) * k;
      c.phi += (phi - c.phi) * k;
      // Girar com o dedo responde na hora; ir até um lugar é suave.
      c.theta += (theta - c.theta) * (spin.current.down ? 1 : k);
    }
    camera.position.set(
      target.current.x + c.r * Math.sin(c.phi) * Math.sin(c.theta),
      target.current.y + c.r * Math.cos(c.phi),
      target.current.z + c.r * Math.sin(c.phi) * Math.cos(c.theta),
    );
    camera.lookAt(target.current);
    // Com o cartão do lugar aberto, a cena sai da frente dele: para a esquerda nas telas largas
    // (cartão ao lado) e para cima no celular (cartão embaixo).
    const wide = typeof window !== "undefined" && window.innerWidth >= 768;
    const wantX = place && wide ? size.width * 0.18 : 0;
    const wantY = place && !wide ? size.height * 0.2 : 0;
    const sh = shift.current;
    sh.x += (wantX - sh.x) * k;
    sh.y += (wantY - sh.y) * k;
    const cam = camera as PerspectiveCamera;
    if (Math.abs(sh.x) > 0.5 || Math.abs(sh.y) > 0.5)
      cam.setViewOffset(size.width, size.height, sh.x, sh.y, size.width, size.height);
    else if (cam.view?.enabled) cam.clearViewOffset();
  });
  return null;
}

/**
 * Árvores fixas pela semente, longe dos lugares. A copa é feita de folhinhas (como no portfólio
 * do Bruno Simon), balança e muda de cor com a estação; embaixo, folhas caídas pelo chão.
 */
function Trees({ season, animate, high }: { season: Season; animate: boolean; high: boolean }) {
  const { trees, fallen } = useMemo(() => {
    const r = rng(1407);
    const list: { group: Group; crown: Group; foliage: Foliage; phase: number }[] = [];
    for (let i = 0; i < 34 && list.length < 22; i++) {
      const a = r() * Math.PI * 2;
      const d = 4.5 + r() * 6.2;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (PLACES.some((p) => Math.hypot(x - p.x, z - p.z) < 3.2) || Math.hypot(x, z - 2) < 2) continue;
      const t = makeTree(i * 31 + 7, 0.6 + r() * 0.6);
      t.group.position.set(x, heightAt(x, z), z);
      const blob = makeBlob(1.6);
      blob.position.set(0, 0.035, 0);
      t.group.add(blob);
      t.leaves.forEach((m) => (m.userData.base = (m.material as MeshToonMaterial).color.clone()));
      const foliage = makeFoliage(t.crown, t.leaves, 4242 + i, high ? 1 : 0.5);
      t.crown.add(foliage.mesh);
      list.push({ group: t.group, crown: t.crown, foliage, phase: x * 0.7 + z * 0.3 });
    }
    const fallenLeaves = makeFallenLeaves(
      list.flatMap((t) => t.foliage.centers),
      high ? 1800 : 900,
    );
    return { trees: list, fallen: fallenLeaves };
  }, [high]);

  // Os objetos do three.js são mexidos por uma ref (o React não acompanha essas mudanças).
  const live = useRef({ trees, fallen });
  useLayoutEffect(() => {
    live.current = { trees, fallen };
  }, [trees, fallen]);
  useLayoutEffect(() => {
    live.current.trees.forEach((t) => t.foliage.recolor(season));
    live.current.fallen.recolor(season);
  }, [season, trees, fallen]);

  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.elapsedTime;
    live.current.trees.forEach((tree) => {
      tree.crown.rotation.z = Math.sin(t * 1.3 + tree.phase) * 0.04;
      tree.crown.rotation.x = Math.cos(t * 1.1 + tree.phase) * 0.03;
    });
  });

  return (
    <>
      {trees.map((t, i) => (
        <primitive key={i} object={t.group} />
      ))}
      <primitive object={fallen.mesh} />
    </>
  );
}

const DOCK_AT: [number, number] = [-1, 12.5];
const BOAT_HOME: [number, number] = [2.6, 3.5];
const BOAT_AWAY: [number, number] = [6.6, 19.5];

function Places({
  selected,
  night,
  animate,
  unlocked,
  onSelect,
  trip,
  boatAt,
}: Pick<IslandCanvasProps, "selected" | "night" | "animate" | "unlocked" | "onSelect"> & {
  trip: IslandCanvasProps["trip"];
  /** Onde o barco está no mundo (a câmera e a raposa usam). */
  boatAt: MutableRefObject<Vector3>;
}) {
  const cabin = useMemo(() => makeCabin(), []);
  const light = useMemo(() => makeLighthouse(), []);
  const dock = useMemo(() => makeDock(), []);
  const islet = useMemo(() => makeIslet(), []);
  const labels = useMemo(
    () =>
      [
        ["CABANA", -2.4, 1.4, 4.4],
        ["CANTEIROS", BED_AT.x, BED_AT.z + 2.85, 3.6],
        ["FAROL", 5.9, -3.4, 3.6],
      ].map(([text, x, z, w]) => {
        const m = makeGroundLabel(text as string, w as number);
        m.position.set(x as number, heightAt(x as number, z as number) + 0.06, z as number);
        m.rotation.y = 0.5;
        return m;
      }),
    [],
  );
  const unlockedKey = unlocked.join(",");
  const extras = useMemo(
    () => (unlockedKey ? unlockedKey.split(",") : []).map((id) => ({ id, group: makeUnlock(id) })),
    [unlockedKey],
  );
  const flags = extras.find((e) => e.id === "bandeirinhas");

  const live = useRef({ cabin, light, dock, roofLift: 0 });
  useLayoutEffect(() => {
    live.current.cabin.windowMat.emissiveIntensity = night ? 1.4 : 0;
    live.current.light.lampMat.emissiveIntensity = night ? 1.8 : 1.0;
    // O facho do farol quase some de dia (virava uma faixa clara por cima da cena) e acende à noite.
    const cone = live.current.light.beam.children[0] as Mesh;
    (cone.material as MeshBasicMaterial).opacity = night ? 0.16 : 0.035;
  }, [night]);

  useFrame((_, delta) => {
    const l = live.current;
    const open = selected === "cabana" ? 1 : 0;
    l.roofLift += (open - l.roofLift) * (animate ? Math.min(1, delta * 3) : 1);
    l.cabin.roof.position.y = l.roofLift * 4.2;
    l.cabin.roof.rotation.z = l.roofLift * 0.12;
    if (animate) l.light.beam.rotation.y += delta * 0.7;
    // O barco: no cais, ou indo para a ilhota enquanto a pessoa respira (a vela enche com o ar).
    const boat = l.dock.boat;
    const breath = trip ? breathAt((performance.now() - trip.startedAt) / 1000, trip.cycles) : null;
    const travel = breath ? breath.travel : 0;
    const k = animate ? Math.min(1, delta * (breath ? 2 : 0.8)) : 1;
    boat.position.x += (BOAT_HOME[0] + (BOAT_AWAY[0] - BOAT_HOME[0]) * travel - boat.position.x) * k;
    boat.position.z += (BOAT_HOME[1] + (BOAT_AWAY[1] - BOAT_HOME[1]) * travel - boat.position.z) * k;
    boat.position.y = Math.sin(performance.now() * 0.0012) * 0.12 - 0.05;
    const sail = breath ? 0.35 + 0.65 * breath.fill : 1;
    l.dock.sail.scale.y += (sail - l.dock.sail.scale.y) * (animate ? Math.min(1, delta * 6) : 1);
    boatAt.current.set(DOCK_AT[0] + boat.position.x, boat.position.y, DOCK_AT[1] + boat.position.z);
  });

  const click = (id: PlaceId) => (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.delta > 8) return; // foi um arrasto para girar, não um toque
    onSelect(id);
  };
  const hover = {
    onPointerOver: () => (document.body.style.cursor = "pointer"),
    onPointerOut: () => (document.body.style.cursor = ""),
  };

  return (
    <>
      <group
        position={[-4, heightAt(-4, -2) - 0.1, -2]}
        rotation-y={0.3}
        onClick={click("cabana")}
        {...hover}
      >
        <primitive object={cabin.group} />
        {flags && <primitive object={flags.group} />}
      </group>
      <group position={[8, heightAt(8, -6) - 0.2, -6]} onClick={click("farol")} {...hover}>
        <primitive object={light.group} />
      </group>
      <group position={[DOCK_AT[0] + BOAT_AWAY[0] + 1.2, 0, DOCK_AT[1] + BOAT_AWAY[1] + 3.6]}>
        <primitive object={islet} />
      </group>
      <group position={[DOCK_AT[0], 0, DOCK_AT[1]]} onClick={click("cais")} {...hover}>
        <primitive object={dock.group} />
      </group>
      {labels.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
      {extras
        .filter((e) => e.id !== "bandeirinhas")
        .map((e) => (
          <primitive key={e.id} object={e.group} />
        ))}
    </>
  );
}

/** Pequenos lugares: garrafa, caixa de correio e placa da consulta. */
function SmallPlaces({ onSelect }: { onSelect: (id: PlaceId) => void }) {
  const bottle = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (bottle.current)
      bottle.current.position.y = heightAt(-9.4, -5.2) + 0.25 + Math.sin(clock.elapsedTime * 1.4) * 0.05;
  });
  const props = (id: PlaceId) => ({
    onClick: (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      if (event.delta > 8) return;
      onSelect(id);
    },
    onPointerOver: () => (document.body.style.cursor = "pointer"),
    onPointerOut: () => (document.body.style.cursor = ""),
  });
  const mail = placeById("correio");
  const sign = placeById("consulta");
  return (
    <>
      <group
        ref={bottle}
        position={[-9.4, heightAt(-9.4, -5.2) + 0.25, -5.2]}
        rotation-z={Math.PI / 2.4}
        {...props("garrafa")}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.25, 0.8, 10]} />
          <meshStandardMaterial color="#9fd8c0" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        <mesh position-y={0.48}>
          <cylinderGeometry args={[0.085, 0.075, 0.14, 8]} />
          <meshStandardMaterial color="#b08660" />
        </mesh>
      </group>
      <group position={[mail.x, heightAt(mail.x, mail.z), mail.z]} rotation-y={0.3} {...props("correio")}>
        <mesh position-y={0.5} castShadow>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="#8a5a3c" />
        </mesh>
        <mesh position-y={1.12} castShadow>
          <boxGeometry args={[0.34, 0.26, 0.5]} />
          <meshStandardMaterial color="#6fb0c8" />
        </mesh>
        <mesh position={[0.19, 1.35, -0.02]}>
          <boxGeometry args={[0.03, 0.4, 0.03]} />
          <meshStandardMaterial color="#d0443a" />
        </mesh>
      </group>
      <group position={[sign.x, heightAt(sign.x, sign.z), sign.z]} rotation-y={0.5} {...props("consulta")}>
        <mesh position-y={0.75} castShadow>
          <boxGeometry args={[0.1, 1.5, 0.1]} />
          <meshStandardMaterial color="#8a5a3c" />
        </mesh>
        <mesh position-y={1.35} castShadow>
          <boxGeometry args={[1.0, 0.52, 0.06]} />
          <meshStandardMaterial color="#f4ebdd" />
        </mesh>
      </group>
    </>
  );
}

function Scene(props: IslandCanvasProps) {
  const {
    plants,
    selected,
    unlocked,
    season,
    night,
    animate,
    quality,
    joy,
    onSelect,
    onGround,
    onPet,
    onSelectPlant,
    intro = false,
    raining = false,
    trip = null,
    throwId = 0,
    lanterns = 0,
    highlights = NO_HIGHLIGHTS,
  } = props;
  const high = quality === "high";
  const fox = useRef(new Vector3(0, 0, 2));
  const boatAt = useRef(new Vector3(1.6, 0, 16));
  const bumps: BumpRef = useRef({});
  const body = useMemo(() => makeIslandBody(), []);
  const beds = useMemo(() => makeBeds(), []);
  const rocks = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 10 }, (_, i) => {
      const rock = ROCK(i + 3);
      const a = r() * Math.PI * 2;
      const d = 12.4 + r() * 1.8;
      rock.position.set(Math.cos(a) * d, 0.25, Math.sin(a) * d);
      return rock;
    });
  }, []);

  // Para onde a raposa vai: o lugar escolhido ou o ponto tocado no chão.
  const [ground, setGround] = useState<[number, number] | null>(null);
  const place = selected ? placeById(selected) : null;
  const target = place ? place.stop : ground;
  const face: [number, number] | null = place ? [place.x, place.z] : null;

  const sky = night ? "#16202e" : "#bfe0e6";
  // De dia a névoa puxa para o rosa (como o pôr do sol do portfólio do Bruno).
  const haze = night ? sky : "#cac8d7";

  return (
    <>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[haze, 42, 130]} />
      <hemisphereLight
        args={[night ? "#7f8fc4" : "#fff1dc", night ? "#2a3326" : "#8a7ab0", night ? 0.35 : 0.62]}
      />
      <directionalLight
        position={night ? [-30, 40, -20] : [30, 45, 20]}
        color={night ? "#9fb4d8" : "#fff0d8"}
        intensity={night ? 0.35 : 0.78}
        castShadow={high}
        shadow-mapSize={[high ? 2048 : 1024, high ? 2048 : 1024]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0008}
      />
      <CameraRig selected={selected} animate={animate} intro={intro} follow={trip ? boatAt : null} />
      <Sea night={night} animate={animate} />
      <primitive
        object={body}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          if (event.delta > 8) return;
          setGround([event.point.x, event.point.z]);
          onGround();
        }}
      />
      {rocks.map((r, i) => (
        <primitive key={i} object={r} />
      ))}
      <IslandGrass count={high ? 18000 : 8000} fox={fox} animate={animate} season={season} />
      <Trees season={season} animate={animate} high={high} />
      <Weather
        raining={raining}
        night={night}
        animate={animate}
        sky={sky}
        haze={haze}
        drops={high ? 1100 : 500}
      />
      <Animals night={night} animate={animate} fox={fox} />
      <Effects night={night} animate={animate} season={season} cabinOpen={selected === "cabana"} />
      <Places
        selected={selected}
        night={night}
        animate={animate}
        unlocked={unlocked}
        onSelect={onSelect}
        trip={trip}
        boatAt={boatAt}
      />
      <SmallPlaces onSelect={onSelect} />
      <Beach onSelect={onSelect} throwId={throwId} animate={animate} />
      <GratitudeLanterns count={lanterns} night={night} animate={animate} />
      <Highlights places={highlights} animate={animate} />

      {/* Os canteiros com as plantas do jardim (as mesmas gotas, as mesmas plantas): uma por canteiro,
          na ordem em que nascem. Canteiro sem planta mostra um montinho de terra com estaca. */}
      <group
        position={[BED_AT.x, heightAt(BED_AT.x, BED_AT.z) - 0.1, BED_AT.z]}
        onClick={(event) => {
          event.stopPropagation();
          if (event.delta > 8) return;
          onSelect("canteiros");
        }}
      >
        <primitive object={beds.group} />
        {beds.seedSpots.map((spot, k) => (
          <primitive key={k} object={spot} visible={!plants[k]} />
        ))}
        {plants.slice(0, BED_SPOTS.length).map((plant, index) => {
          const [bx, bz] = BED_SPOTS[index];
          const [px, pz] = PLANT_SPOTS[plant.kind];
          return (
            <group key={plant.kind} position={[bx, 0.3, bz]} scale={0.78}>
              <group position={[-px, 0, -pz]}>
                <Plant
                  kind={plant.kind}
                  growth={plant.growth}
                  index={index}
                  sway={animate}
                  bumps={bumps}
                  onSelect={onSelectPlant}
                />
              </group>
            </group>
          );
        })}
      </group>

      <Suspense fallback={null}>
        <Fox
          target={target}
          face={face}
          position={fox}
          animate={animate}
          joy={joy}
          onPet={onPet}
          seat={trip ? boatAt : null}
        />
      </Suspense>
    </>
  );
}

/** A ilha em 3D. Importe via next/dynamic (three.js é pesado e só roda no navegador). */
export default function IslandCanvas(props: IslandCanvasProps) {
  return (
    <Canvas
      flat
      // Ajuste de cor final (mais vivo, um pouco mais de contraste), sem custo de pós-processamento.
      style={{ touchAction: "pan-y", filter: "saturate(1.18) contrast(1.05)" }}
      shadows={{ type: PCFShadowMap }}
      camera={{ position: [10, 20, 18], fov: 38, near: 0.1, far: 400 }}
      dpr={props.quality === "high" ? [1, 1.75] : [1, 1.25]}
      frameloop={props.animate ? "always" : "demand"}
      gl={{ antialias: true }}
      onCreated={() => props.onReady?.()}
    >
      <Scene {...props} />
    </Canvas>
  );
}
