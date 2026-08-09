import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Word, UserWordRecord } from '../types';
import { speakWord, getWordAccent } from '../utils/tts';
import { Volume2, CheckCircle2, Clock } from 'lucide-react';

interface WordNebula3DProps {
  words: Word[];
  userRecords: Record<string, UserWordRecord>;
  onSelectWord: (word: Word) => void;
  soundEnabled: boolean;
}

export const WordNebula3D: React.FC<WordNebula3DProps> = ({
  words,
  userRecords,
  onSelectWord,
  soundEnabled,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090d16, 0.015);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 45;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Background Starfield Particles
    const starCount = 1200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 200;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.8,
      transparent: true,
      opacity: 0.5,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 5. Build Word Nodes Group
    const wordGroup = new THREE.Group();
    scene.add(wordGroup);

    // Node meshes map for raycasting
    const wordMeshes: THREE.Mesh[] = [];
    const radius = 22;

    words.forEach((wordItem, index) => {
      // Golden Spiral algorithm on sphere surface
      const phi = Math.acos(-1 + (2 * index) / words.length);
      const theta = Math.sqrt(words.length * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const record = userRecords[wordItem.id];
      let color = 0x38bdf8; // 新词: 冰蓝
      if (record?.status === 'mastered') {
        color = 0x39d353; // 已掌握: 赛博绿
      } else if (record?.status === 'reviewing') {
        color = 0xa855f7; // 复习中: 赛博紫
      }

      // Geometry & Material
      const geom = new THREE.SphereGeometry(0.85, 16, 16);
      const mat = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        shininess: 100,
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y, z);
      mesh.userData = { word: wordItem };

      wordGroup.add(mesh);
      wordMeshes.push(mesh);
    });

    // Ambient & Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x6366f1, 2, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 100);
    pointLight2.position.set(-20, -20, 20);
    scene.add(pointLight2);

    // Mouse Interaction Logic
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      wordGroup.rotation.y += deltaX * 0.005;
      wordGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(wordMeshes);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const clickedWord = clickedMesh.userData.word as Word;
        setSelectedWord(clickedWord);
        onSelectWord(clickedWord);

        if (soundEnabled) {
          speakWord(clickedWord.word, getWordAccent(clickedWord));
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      camera.position.z += e.deltaY * 0.03;
      camera.position.z = Math.max(15, Math.min(80, camera.position.z));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('click', onClick);
    domElement.addEventListener('wheel', onWheel);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        wordGroup.rotation.y += 0.002;
        starField.rotation.y += 0.0005;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('click', onClick);
      domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [words, userRecords, soundEnabled]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 120px)', minHeight: '560px' }}>
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Nebula Stats Legend Header */}
      <div
        className="glass-panel nebula-legend-box"
        style={{
          position: 'absolute',
          top: '20px',
          left: '24px',
          padding: '12px 18px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          fontSize: '0.85rem',
          zIndex: 20,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#39d353', boxShadow: '0 0 8px #39d353' }}></span>
          已掌握
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 8px #a855f7' }}></span>
          复习中
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }}></span>
          未探索
        </span>
        <span style={{ color: 'var(--text-muted)', marginLeft: '12px' }}>
          💡 拖拽 3D 旋转 | 滚轮缩放 | 点击节点探索发音
        </span>
      </div>

      {/* Clicked Word Focus Modal */}
      {selectedWord && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '480px',
            padding: '20px',
            border: '1px solid var(--color-primary-glow)',
            animation: 'fadeIn 0.3s ease-in-out',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: 800 }}>
                  {selectedWord.word}
                </h3>
                <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-code)', fontSize: '0.9rem' }}>
                  {selectedWord.phonetic}
                </span>
              </div>
              <p style={{ color: 'var(--text-main)', marginTop: '4px', fontSize: '1.05rem', fontWeight: 600 }}>
                {selectedWord.definition}
              </p>
            </div>

            <button
              onClick={() => speakWord(selectedWord.word)}
              className="cyber-button cyber-button-primary"
              style={{ padding: '8px 12px' }}
            >
              <Volume2 size={18} />
              发音
            </button>
          </div>

          <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
            <p style={{ color: '#e5e7eb', fontSize: '0.9rem', fontStyle: 'italic' }}>
              "{selectedWord.example}"
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
              {selectedWord.exampleTranslation}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
            {userRecords[selectedWord.id] ? (
              <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> 已列入艾宾浩斯复习计划 (间隔 {userRecords[selectedWord.id].interval} 天)
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={16} /> 尚未开始打卡
              </span>
            )}

            <button
              onClick={() => setSelectedWord(null)}
              className="cyber-button"
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
