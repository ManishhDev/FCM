import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MaterialTestId, SpecimenGeometry } from '../types/composite';
import { RotateCcw, Play, Pause, Maximize2 } from 'lucide-react';

interface Specimen3DViewerProps {
  testId: MaterialTestId;
  geometry: SpecimenGeometry;
  loadRatio: number; // 0..1.25 (1.0 = strength limit)
  isFailure: boolean;
  failureMode: string;
  trueDisplacementMm: number;
  displacementLabel: string;
  isBucklingMode?: boolean;
}

const _colorLow = new THREE.Color('#176B5B');
const _colorMid = new THREE.Color('#D97706');
const _colorHigh = new THREE.Color('#DC2626');
const _tempColor = new THREE.Color();

function mapStressToColor(stressNorm: number, target: THREE.Color) {
  const t = Math.max(0, Math.min(1, stressNorm));
  if (t < 0.6) {
    target.copy(_colorLow).lerp(_colorMid, t / 0.6);
  } else {
    target.copy(_colorMid).lerp(_colorHigh, (t - 0.6) / 0.4);
  }
}

export const Specimen3DViewer: React.FC<Specimen3DViewerProps> = ({
  testId,
  geometry,
  loadRatio,
  isFailure,
  failureMode,
  trueDisplacementMm,
  displacementLabel,
  isBucklingMode = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [animateSweep, setAnimateSweep] = useState(false);
  const [resetTick, setResetTick] = useState(0);

  // Mutable ref for animation loop without tearing down WebGL context
  const stateRef = useRef({
    testId,
    geometry,
    loadRatio,
    isFailure,
    isBucklingMode,
    animateSweep,
  });
  stateRef.current = {
    testId,
    geometry,
    loadRatio,
    isFailure,
    isBucklingMode,
    animateSweep,
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 360;

    // Software WebGL guard
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F1F5F2');
    scene.fog = new THREE.Fog('#F1F5F2', 9, 22);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.9, 1.85, 3.6);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);
    controls.minDistance = 1.8;
    controls.maxDistance = 8.5;

    // 3-Point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#E6F4F1', '#8FA39B', 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF6EA', 2.2);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#CBE7DF', 1.0);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Lab Bench Ground Plane + Subtle Grid
    const benchGeo = new THREE.PlaneGeometry(14, 14);
    const benchMat = new THREE.MeshStandardMaterial({
      color: '#E5ECE7',
      roughness: 0.88,
      metalness: 0.05,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.rotation.x = -Math.PI / 2;
    bench.position.y = -1.65;
    bench.receiveShadow = true;
    scene.add(bench);

    const grid = new THREE.GridHelper(10, 20, '#BCC9C2', '#D4DFD9');
    grid.position.y = -1.64;
    scene.add(grid);

    // Shared PBR Materials
    const steelMat = new THREE.MeshStandardMaterial({
      color: '#34403D',
      metalness: 0.86,
      roughness: 0.28,
    });
    const brassCollarMat = new THREE.MeshStandardMaterial({
      color: '#B87D32',
      metalness: 0.85,
      roughness: 0.25,
    });
    const specimenMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.55,
      metalness: 0.08,
    });
    const rollerMat = new THREE.MeshStandardMaterial({
      color: '#52605C',
      metalness: 0.9,
      roughness: 0.2,
    });
    const waterTankMat = new THREE.MeshStandardMaterial({
      color: '#7EC8E3',
      transparent: true,
      opacity: 0.28,
      roughness: 0.15,
      metalness: 0.05,
      depthWrite: false,
    });

    // Multi-part procedural assembly group
    const rigGroup = new THREE.Group();
    scene.add(rigGroup);

    // Subdivided specimen mesh for smooth deformation + stress color field
    const segX = 12;
    const segY = 28;
    const segZ = 4;
    const specGeo = new THREE.BoxGeometry(1, 1, 1, segX, segY, segZ);
    const basePositions = new Float32Array(specGeo.attributes.position.array);
    const colorAttr = new THREE.BufferAttribute(
      new Float32Array(specGeo.attributes.position.count * 3),
      3
    );
    specGeo.setAttribute('color', colorAttr);

    const specimenMesh = new THREE.Mesh(specGeo, specimenMat);
    specimenMesh.castShadow = true;
    specimenMesh.receiveShadow = true;
    rigGroup.add(specimenMesh);

    // Fixture parts (grips, platens, rollers, striker, base plate)
    const upperGrip = new THREE.Group();
    const upperJaw = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.36, 0.45), steelMat);
    const upperCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.45, 20), brassCollarMat);
    upperCollar.position.y = 0.38;
    upperGrip.add(upperJaw, upperCollar);
    upperGrip.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });

    const lowerGrip = new THREE.Group();
    const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.36, 0.45), steelMat);
    const lowerCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.45, 20), brassCollarMat);
    lowerCollar.position.y = -0.38;
    lowerGrip.add(lowerJaw, lowerCollar);
    lowerGrip.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });

    // Flexural / Shear rollers
    const leftRoller = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 20), rollerMat);
    leftRoller.rotation.x = Math.PI / 2;
    const rightRoller = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 20), rollerMat);
    rightRoller.rotation.x = Math.PI / 2;
    const topNose = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.72, 20), brassCollarMat);
    topNose.rotation.x = Math.PI / 2;

    // Impact hammer striker
    const impactArmGroup = new THREE.Group();
    const armShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.4, 16), steelMat);
    armShaft.position.y = -0.7;
    const strikerHead = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.26), brassCollarMat);
    strikerHead.position.y = -1.38;
    impactArmGroup.add(armShaft, strikerHead);
    impactArmGroup.position.set(0, 1.35, 0);

    // Water tank mesh
    const tankMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.1), waterTankMat);
    tankMesh.position.set(0, -0.1, 0);

    rigGroup.add(upperGrip, lowerGrip, leftRoller, rightRoller, topNose, impactArmGroup, tankMesh);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const updateSpecimenAndRig = (elapsed: number) => {
      const s = stateRef.current;
      const effRatio = s.animateSweep
        ? (0.5 - 0.5 * Math.cos(elapsed * 1.4)) * Math.max(0.95, s.loadRatio)
        : s.loadRatio;
      const clampedRatio = Math.max(0, Math.min(1.25, effRatio));

      // Reset visibilities
      upperGrip.visible = false;
      lowerGrip.visible = false;
      leftRoller.visible = false;
      rightRoller.visible = false;
      topNose.visible = false;
      impactArmGroup.visible = false;
      tankMesh.visible = false;

      // Normalized visual dimensions (preserving real aspect proportions safely)
      const wNorm = Math.max(0.22, Math.min(0.9, s.geometry.widthMm / 35));
      const tNorm = Math.max(0.1, Math.min(0.45, s.geometry.thicknessMm / 18));
      const lNorm = Math.max(1.2, Math.min(2.3, s.geometry.gaugeLengthMm / 65));

      const posAttr = specGeo.attributes.position as THREE.BufferAttribute;
      const colAttr = specGeo.attributes.color as THREE.BufferAttribute;

      if (s.testId === 'tensile') {
        upperGrip.visible = true;
        lowerGrip.visible = true;
        const axialStretch = 1 + clampedRatio * 0.22; // Visually clear elongation
        const poissonShrink = 1 - clampedRatio * 0.08;
        const halfH = (lNorm * axialStretch) / 2;

        upperGrip.position.set(0, halfH + 0.16, 0);
        lowerGrip.position.set(0, -halfH - 0.16, 0);
        specimenMesh.rotation.set(0, 0, 0);
        specimenMesh.position.set(0, 0, 0);

        for (let i = 0; i < posAttr.count; i++) {
          const bx = basePositions[i * 3];
          const by = basePositions[i * 3 + 1];
          const bz = basePositions[i * 3 + 2];

          // Slight dogbone necking in gauge zone when strained
          const gaugeMask = Math.exp(-Math.pow(by * 2.4, 2));
          const neckFactor = 1 - (1 - poissonShrink) * gaugeMask * (s.isFailure && clampedRatio >= 0.98 ? 1.6 : 1.0);
          const crackGap = s.isFailure && clampedRatio >= 0.98 ? (by >= 0 ? 0.05 : -0.05) : 0;

          posAttr.setXYZ(
            i,
            bx * wNorm * neckFactor,
            by * lNorm * axialStretch + crackGap,
            bz * tNorm * neckFactor
          );

          const localStress = clampedRatio * (0.72 + 0.28 * gaugeMask);
          mapStressToColor(localStress, _tempColor);
          colAttr.setXYZ(i, _tempColor.r, _tempColor.g, _tempColor.b);
        }
      } else if (s.testId === 'compression') {
        upperGrip.visible = true;
        lowerGrip.visible = true;
        const shorten = 1 - clampedRatio * 0.18;
        const halfH = (lNorm * shorten) / 2;
        upperGrip.position.set(0, halfH + 0.18, 0);
        lowerGrip.position.set(0, -halfH - 0.18, 0);
        specimenMesh.rotation.set(0, 0, 0);
        specimenMesh.position.set(0, 0, 0);

        for (let i = 0; i < posAttr.count; i++) {
          const bx = basePositions[i * 3];
          const by = basePositions[i * 3 + 1];
          const bz = basePositions[i * 3 + 2];

          const midMask = Math.cos(by * Math.PI); // 1 at center, 0 at ends
          let xShift = 0;
          let bulge = 1 + clampedRatio * 0.12 * Math.max(0, midMask);

          if (s.isBucklingMode) {
            xShift = Math.max(0, midMask) * clampedRatio * 0.34;
            bulge = 1.02;
          }

          posAttr.setXYZ(
            i,
            bx * wNorm * bulge + xShift,
            by * lNorm * shorten,
            bz * tNorm * bulge
          );

          const localStress = clampedRatio * (0.78 + 0.22 * Math.abs(midMask));
          mapStressToColor(localStress, _tempColor);
          colAttr.setXYZ(i, _tempColor.r, _tempColor.g, _tempColor.b);
        }
      } else if (s.testId === 'flexural' || s.testId === 'shear') {
        leftRoller.visible = true;
        rightRoller.visible = true;
        topNose.visible = true;

        const beamSpan = s.testId === 'shear' ? 1.35 : Math.max(1.5, Math.min(2.6, s.geometry.supportSpanMm / 40));
        const beamLen = beamSpan + 0.35;
        const maxDeflect = clampedRatio * (s.testId === 'shear' ? 0.16 : 0.34);

        leftRoller.position.set(-beamSpan / 2, -tNorm / 2 - 0.08, 0);
        rightRoller.position.set(beamSpan / 2, -tNorm / 2 - 0.08, 0);
        topNose.position.set(0, tNorm / 2 + 0.09 - maxDeflect, 0);
        specimenMesh.rotation.set(0, 0, 0);
        specimenMesh.position.set(0, 0, 0);

        for (let i = 0; i < posAttr.count; i++) {
          const bx = basePositions[i * 3];
          const by = basePositions[i * 3 + 1];
          const bz = basePositions[i * 3 + 2];

          // Rotate box conceptually: x along beam length, y along thickness, z along width
          const xWorld = by * beamLen; // by in [-0.5, 0.5]
          const normX = Math.max(-1, Math.min(1, xWorld / (beamSpan / 2)));
          // Parabolic simply supported beam deflection
          const bendY = -maxDeflect * Math.max(0, 1 - normX * normX);

          posAttr.setXYZ(
            i,
            xWorld,
            bx * tNorm + bendY,
            bz * wNorm
          );

          // Bending stress highest at mid-span top/bottom fibers
          const momentFactor = Math.max(0, 1 - Math.abs(normX));
          const fiberDepthFactor = Math.abs(bx) * 2;
          const localStress = clampedRatio * momentFactor * (0.35 + 0.65 * fiberDepthFactor);
          mapStressToColor(localStress, _tempColor);
          colAttr.setXYZ(i, _tempColor.r, _tempColor.g, _tempColor.b);
        }
      } else if (s.testId === 'impact') {
        lowerGrip.visible = true;
        impactArmGroup.visible = true;

        lowerGrip.position.set(0, -0.72, 0);
        const swingAngle = s.animateSweep
          ? Math.sin(elapsed * 2.5) * 0.9 - 0.2
          : -0.15 + clampedRatio * 0.35;
        impactArmGroup.rotation.z = swingAngle;
        specimenMesh.rotation.set(0, 0, 0);
        specimenMesh.position.set(0, -0.05, 0);

        for (let i = 0; i < posAttr.count; i++) {
          const bx = basePositions[i * 3];
          const by = basePositions[i * 3 + 1];
          const bz = basePositions[i * 3 + 2];

          const strikeRegion = Math.exp(-Math.pow(by * 3.5, 2));
          const hingeBend = s.isFailure && by > 0 ? by * 0.38 : strikeRegion * clampedRatio * 0.08;

          posAttr.setXYZ(
            i,
            bx * wNorm + hingeBend,
            by * 1.35,
            bz * tNorm
          );

          const localStress = clampedRatio * (0.25 + 0.75 * strikeRegion);
          mapStressToColor(localStress, _tempColor);
          colAttr.setXYZ(i, _tempColor.r, _tempColor.g, _tempColor.b);
        }
      } else {
        // Water absorption / Hardness & Density / Thermal & Fatigue coupon view
        tankMesh.visible = s.testId === 'water_absorption';
        specimenMesh.rotation.set(0, elapsed * 0.18, 0);
        specimenMesh.position.set(0, 0, 0);

        for (let i = 0; i < posAttr.count; i++) {
          const bx = basePositions[i * 3];
          const by = basePositions[i * 3 + 1];
          const bz = basePositions[i * 3 + 2];
          posAttr.setXYZ(i, bx * wNorm * 1.4, by * 1.3, bz * tNorm * 1.4);

          const pulse = s.testId === 'thermal_fatigue' ? 0.5 + 0.5 * Math.sin(elapsed * 4) : 0.45;
          mapStressToColor(clampedRatio * (0.55 + 0.45 * pulse), _tempColor);
          colAttr.setXYZ(i, _tempColor.r, _tempColor.g, _tempColor.b);
        }
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      specGeo.computeVertexNormals();
    };

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const st = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (st === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const elapsed = clock.getElapsedTime();
      updateSpecimenAndRig(elapsed);
      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      specGeo.dispose();
      benchGeo.dispose();
      benchMat.dispose();
      steelMat.dispose();
      brassCollarMat.dispose();
      specimenMat.dispose();
      rollerMat.dispose();
      waterTankMat.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, [resetTick]);

  // Compute visual exaggeration notice
  const magnificationLabel =
    testId === 'flexural'
      ? '15× Visual Bending Scale'
      : testId === 'tensile' || testId === 'compression'
      ? '35× Visual Strain Scale'
      : 'Conceptual Rig Scale';

  return (
    <div className="relative rounded-xl border border-[#DCE5DF] bg-[#F1F5F2] overflow-hidden">
      {/* Top Specimen Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white border-b border-[#DCE5DF] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#123B32]">3D Virtual Specimen Rig</span>
          <span className="text-[#DCE5DF]">|</span>
          <span className="font-mono text-[11px] text-[#64716C] tabular-nums">
            {geometry.widthMm} × {geometry.thicknessMm} × {geometry.gaugeLengthMm} mm
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#A96512] bg-[#FFF4DE] px-2 py-0.5 rounded-sm">
            {magnificationLabel} · True {displacementLabel}: {trueDisplacementMm.toFixed(3)} mm
          </span>
        </div>
      </div>

      {/* Three.js Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-[320px] sm:h-[360px] cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D composite specimen testing visualization"
      />

      {/* Bottom Dock Controls (Solid background, zero backdrop-blur over WebGL) */}
      <div className="px-4 py-2.5 bg-white border-t border-[#DCE5DF] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-[#64716C]">Stress Field:</span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="inline-block w-3 h-2.5 rounded-xs bg-[#176B5B]" />
            <span className="text-[#64716C]">Low</span>
            <span className="inline-block w-3 h-2.5 rounded-xs bg-[#D97706] ml-1" />
            <span className="text-[#64716C]">Mid</span>
            <span className="inline-block w-3 h-2.5 rounded-xs bg-[#DC2626] ml-1" />
            <span className="text-[#64716C]">Limit</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAnimateSweep((v) => !v)}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              animateSweep
                ? 'bg-[#123B32] text-white'
                : 'bg-[#F7F9F6] hover:bg-[#EAF5EF] text-[#123B32] border border-[#DCE5DF]'
            }`}
          >
            {animateSweep ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{animateSweep ? 'Pause Load Sweep' : 'Animate Load Cycle'}</span>
          </button>
          <button
            type="button"
            onClick={() => setResetTick((t) => t + 1)}
            className="px-2.5 py-1.5 rounded-lg bg-[#F7F9F6] hover:bg-slate-100 text-[#182522] border border-[#DCE5DF] flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
            title="Reset 3D camera"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#64716C]" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Failure Status Banner when limit exceeded */}
      {isFailure && (
        <div className="px-4 py-2 bg-[#FEE2E2] border-t border-[#DC2626]/30 text-xs text-[#991B1B] flex items-center justify-between">
          <span className="font-semibold">Predicted Failure: {failureMode}</span>
          <span className="font-mono text-[11px] flex items-center gap-1">
            <Maximize2 className="w-3 h-3" /> Drag to orbit · Scroll to zoom
          </span>
        </div>
      )}
    </div>
  );
};
