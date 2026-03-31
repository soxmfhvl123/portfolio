'use client';

import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import FluxEngine from './FluxEngine';
import { gsap } from 'gsap';
import { Upload, Download, Settings, Layers, Box, Maximize2, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  { id: 'particle', name: 'Particle & Data', effects: ['Grain Mist', 'Zero-G Points', 'Grid Float'] },
  { id: 'kinetic', name: 'Kinetic & Flow', effects: ['Kinetic Smear', 'Fluid Ripple', 'Entropy Field'] },
  { id: 'optical', name: 'Optical & Neural', effects: ['Luminescent Neural', 'Binary Horizon', 'Temporal Glitch'] }
];

export default function ShaderLab({ image, onDrop, onReset }) {
  const [activeEffect, setActiveEffect] = useState('Luminescent Neural');
  const [intensity, setIntensity] = useState(0.5);
  
  const getModeId = (effect) => {
    const mapping = {
      'Luminescent Neural': 1,
      'Kinetic Smear': 2,
      'Binary Horizon': 3,
      'Temporal Glitch': 4,
      'Grain Mist': 5,
      'Zero-G Points': 6,
      'Grid Float': 7,
      'Entropy Field': 8,
      'Cellular Void': 9,
      'Data Rainfall': 10
    };
    return mapping[effect] || 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onDrop(file);
  };

  const captureMoment = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `flux-imgen-${activeEffect.toLowerCase().replace(/ /g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="dashboard-grid">
      {/* LEFT PANEL: Input & Effects */}
      <aside className="left-panel">
        <div className="sidebar-section">
          <span className="section-title">Input</span>
          <label className="dashboard-dropzone">
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            <Upload size={16} className="mx-auto mb-2 opacity-40" />
            <p className="flux-hud-text !text-[9px] opacity-40">Drop file or click to browse</p>
          </label>
        </div>

        <div className="sidebar-section flex-1 overflow-y-auto custom-scroll">
          <span className="section-title">Effects</span>
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="mb-6">
              <p className="flux-hud-text !text-[9px] opacity-20 mb-3 px-4">{cat.name}</p>
              {cat.effects.map(eff => (
                <button
                  key={eff}
                  onClick={() => setActiveEffect(eff)}
                  className={`effect-item ${activeEffect === eff ? 'active' : ''}`}
                >
                  {eff}
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* CENTER PANEL: Viewport */}
      <main className="center-panel">
        <header className="viewport-header">
          <span className="flux-hud-text">• {activeEffect}</span>
          <span className="flux-hud-text opacity-20 text-[9px]">[WEBGL ENGINE]</span>
          <div className="ml-auto flex gap-4">
            <Maximize2 size={14} className="opacity-20 hover:opacity-100 cursor-pointer" />
          </div>
        </header>

        <div className="flex-1 relative bg-[#050505]">
          {image ? (
            <Canvas 
              camera={{ position: [0, 0, 5], fov: 45 }}
              gl={{ preserveDrawingBuffer: true }}
            >
              <FluxEngine image={image} mode={getModeId(activeEffect)} intensity={intensity} />
            </Canvas>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Box size={40} className="opacity-10 animate-pulse" />
              <p className="flux-hud-text opacity-20">Awaiting Input Data</p>
            </div>
          )}
        </div>

        <footer className="viewport-footer">
          <div className="flex gap-6">
            <span className="flux-hud-text !text-[9px] opacity-40">X: 0.00 Y: 0.00</span>
            <span className="flux-hud-text !text-[9px] opacity-40">Zoom: 100%</span>
          </div>
          <span className="flux-hud-text !text-[9px] opacity-40">Ready</span>
        </footer>
      </main>

      {/* RIGHT PANEL: Settings & Export */}
      <aside className="right-panel">
        <div className="sidebar-section">
          <div className="flex justify-between items-center mb-6">
            <span className="section-title !mb-0">Settings</span>
            <RefreshCw size={12} className="opacity-20 hover:opacity-100 cursor-pointer" onClick={() => setIntensity(0.5)} />
          </div>
          
          <div className="mb-8">
            <p className="flux-hud-text !text-[9px] opacity-40 mb-4">{activeEffect} Intensity</p>
            <input 
              type="range" 
              min="0" max="1" step="0.01" 
              value={intensity} 
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full accent-[#E0FF00]"
            />
          </div>
        </div>

        <div className="sidebar-section">
          <span className="section-title">Post-Processing</span>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center opacity-20">
              <span className="flux-hud-text !text-[10px]">Grain Mist</span>
              <span className="flux-hud-text !text-[10px]">8%</span>
            </div>
            <div className="flex justify-between items-center opacity-20">
              <span className="flux-hud-text !text-[10px]">Neural Bloom</span>
              <span className="flux-hud-text !text-[10px]">Off</span>
            </div>
          </div>
        </div>

        <div className="sidebar-section mt-auto !border-b-0">
          <span className="section-title">Export</span>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button className="p-3 border border-white/10 rounded hover:border-[#E0FF00] transition-colors">
              <span className="flux-hud-text !text-[9px] block">PNG</span>
              <span className="flux-hud-text !text-[8px] opacity-20">.png</span>
            </button>
            <button className="p-3 border border-white/10 rounded hover:border-[#E0FF00] transition-colors">
              <span className="flux-hud-text !text-[9px] block">VIDEO</span>
              <span className="flux-hud-text !text-[8px] opacity-20">.mp4</span>
            </button>
          </div>
          <button 
            onClick={captureMoment}
            className="w-full p-4 bg-[#E0FF00] text-black font-bold uppercase text-[10px] tracking-widest rounded hover:brightness-110 active:scale-95 transition-all"
          >
            Capture Moment
          </button>
        </div>
      </aside>

      <style jsx>{`
        .mx-auto { margin-left: auto; margin-right: auto; }
        .ml-auto { margin-left: auto; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .block { display: block; }
        .rounded { border-radius: 4px; }
      `}</style>
    </div>
  );
}
