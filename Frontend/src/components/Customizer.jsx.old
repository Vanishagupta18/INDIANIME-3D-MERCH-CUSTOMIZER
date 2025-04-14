import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Html, useCursor } from '@react-three/drei';
import * as THREE from 'three';

// Preload the t-shirt model
useGLTF.preload('/models/t-shirt.glb');

// Text Design Dialog Component
function TextDesignDialog({ onClose, onAdd }) {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(80);
  const [fontFamily, setFontFamily] = useState('Arial');

  const handleAdd = () => {
    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }
    onAdd({ text, color, fontSize, fontFamily });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 32,
        maxWidth: 500,
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 24, fontWeight: 'bold' }}>
          ✏️ Add Text Design
        </h2>

        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
          Text Content
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here..."
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            fontSize: 14,
            marginBottom: 16,
            minHeight: 80,
            fontFamily: fontFamily,
            resize: 'vertical'
          }}
        />

        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
          Font Family
        </label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            fontSize: 14,
            marginBottom: 16,
            cursor: 'pointer'
          }}
        >
          <option value="Arial">Arial</option>
          <option value="Impact">Impact</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Verdana">Verdana</option>
          <option value="Times New Roman">Times New Roman</option>
        </select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="40"
              max="150"
              step="5"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              Text Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>

        {/* Preview */}
        <div style={{
          background: '#f9fafb',
          padding: 20,
          borderRadius: 8,
          marginBottom: 20,
          textAlign: 'center',
          minHeight: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            fontFamily: fontFamily,
            fontSize: Math.min(fontSize / 2, 40),
            color: color,
            fontWeight: 'bold'
          }}>
            {text || 'Preview text here...'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 12,
              background: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            style={{
              flex: 1,
              padding: 12,
              background: '#b30000',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Add to T-Shirt
          </button>
        </div>
      </div>
    </div>
  );
}

// 3D T-Shirt Model Component
function TShirtModel({ color = '#b30000', designs = [], onSurfaceClick, onDesignUpdate, selectedDesign }) {
  const { scene } = useGLTF('/models/t-shirt.glb');
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef();
  const initialSetupDone = useRef(false);

  // Initial setup - only runs once
  useEffect(() => {
    if (initialSetupDone.current) return;
    
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material ? child.material.clone() : new THREE.MeshStandardMaterial();
        child.material.color = new THREE.Color(color);
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material.map) {
          child.material.map.encoding = THREE.sRGBEncoding;
        }
      }
    });

    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    if (maxDim > 0) {
      const targetHeight = 1.6;
      const scale = targetHeight / maxDim;
      clonedScene.scale.setScalar(scale);
    }

    const box2 = new THREE.Box3().setFromObject(clonedScene);
    const center = box2.getCenter(new THREE.Vector3());
    clonedScene.position.sub(center);
    clonedScene.position.y += 0.02;

    clonedScene.name = 'tshirt-model';
    initialSetupDone.current = true;
  }, [clonedScene]); // Removed color from dependencies

  // Update color only - separate effect
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh && child.material && child.material.color) {
        child.material.color = new THREE.Color(color);
      }
    });
  }, [color, clonedScene]);

  const handleClick = (event) => {
    event.stopPropagation();
    if (onSurfaceClick && event.point) {
      onSurfaceClick(event.point);
    }
  };

  return (
    <group ref={groupRef} onClick={handleClick}>
      <primitive object={clonedScene} />
      {designs.map((design, index) => (
        <DesignDecal
          key={design.id}
          design={design}
          index={index}
          onUpdate={onDesignUpdate}
          onSelect={(id) => onDesignUpdate && onDesignUpdate(id, null, true)}
          isSelected={selectedDesign === design.id}
        />
      ))}
    </group>
  );
}

// Individual design decal with proper rendering
function DesignDecal({ design, index, onUpdate, onSelect, isSelected }) {
  const [hover, setHover] = useState(false);
  const meshRef = useRef();

  useCursor(hover || isSelected);

  const logoWidth = design.scale || 0.3;
  const logoHeight = logoWidth * (design.aspectRatio || 1);

  // Create text texture
  const textTexture = useMemo(() => {
    if (design.type !== 'text') return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = design.textColor || '#000000';
    ctx.font = `bold ${design.fontSize || 80}px ${design.fontFamily || 'Arial'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const words = design.text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 950) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    
    const lineHeight = (design.fontSize || 80) * 1.2;
    const startY = 512 - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, i) => {
      ctx.fillText(line, 512, startY + i * lineHeight);
    });
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [design.text, design.textColor, design.fontSize, design.fontFamily, design.type]);

  const displayTexture = design.type === 'text' ? textTexture : design.texture;

  return (
    <group>
      <mesh
        ref={meshRef}
        position={design.position}
        rotation={design.rotation || [0, 0, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelect(design.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHover(false);
        }}
      >
        <planeGeometry args={[logoWidth, logoHeight]} />
        <meshStandardMaterial 
          map={displayTexture} 
          transparent={true}
          opacity={hover || isSelected ? 0.9 : 1}
          side={THREE.DoubleSide}
          depthTest={false}
          depthWrite={false}
          polygonOffset={true}
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
      {(hover || isSelected) && (
        <Html position={[design.position[0], design.position[1] + logoHeight/2 + 0.15, design.position[2]]}>
          <div style={{
            background: isSelected ? 'rgba(179, 0, 0, 0.95)' : 'rgba(0,0,0,0.85)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            fontWeight: isSelected ? 'bold' : 'normal'
          }}>
            {isSelected ? '✓ Selected - Use controls →' : '👆 Click to select'}
          </div>
        </Html>
      )}
      {isSelected && (
        <lineSegments position={design.position} rotation={design.rotation || [0, 0, 0]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(logoWidth, logoHeight)]} />
          <lineBasicMaterial color="#b30000" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
}

// Showcase environment
function Showcase({ children }) {
  return (
    <>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[3.2, 1.9, 2.4]} />
        <meshStandardMaterial 
          color="#f8fafc" 
          side={THREE.BackSide} 
          metalness={0.05} 
          roughness={0.9} 
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.0} 
          roughness={1} 
        />
      </mesh>

      {children}
    </>
  );
}

// Main 3D Scene
function ThreeScene({ color, designs, onSurfaceClick, pendingDrop, onCanvasClick, onDesignUpdate, selectedDesign }) {
  const canvasRef = useRef();

  return (
    <div 
      ref={canvasRef}
      style={{
        width: '100%',
        height: 600,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
        background: 'linear-gradient(to br, #dbeafe, #fae8ff)',
        position: 'relative',
        border: pendingDrop ? '3px dashed #b30000' : 'none'
      }}
      onClick={onCanvasClick}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 6, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <Suspense fallback={null}>
          <Showcase>
            <TShirtModel 
              color={color} 
              designs={designs}
              onSurfaceClick={onSurfaceClick}
              onDesignUpdate={onDesignUpdate}
              selectedDesign={selectedDesign}
            />
          </Showcase>

          <Environment preset="studio" />
          <ContactShadows
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.56, 0]}
            opacity={0.45}
            width={2.6}
            height={2.6}
            blur={2}
            far={1}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={6}
          target={[0, 0, 0]}
        />
      </Canvas>
      
      {pendingDrop && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(179, 0, 0, 0.95)',
          color: 'white',
          padding: '20px 32px',
          borderRadius: 12,
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'center',
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'pulse 2s infinite'
        }}>
          📍 Click anywhere on the t-shirt to place your design
          <div style={{ fontSize: 14, marginTop: 8, opacity: 0.9, fontWeight: 'normal' }}>
            The design will appear exactly where you click
          </div>
        </div>
      )}
      
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(4px)',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 12,
        color: '#666',
        fontWeight: 500
      }}>
        🔄 Drag to rotate • Scroll to zoom
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.02); }
        }
      `}</style>
    </div>
  );
}

// Main App Component
const UploadDesignPage = () => {
  const [tshirtColor, setTshirtColor] = useState('#b30000');
  const [size, setSize] = useState('M');
  const [fabric, setFabric] = useState('cotton');
  const [designs, setDesigns] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [printSide, setPrintSide] = useState('front');
  const [pendingDesign, setPendingDesign] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showTextDialog, setShowTextDialog] = useState(false);

  const colorOptions = [
    { name: 'INDIANIME Red', value: '#b30000' },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Navy Blue', value: '#1e3a8a' },
    { name: 'Forest Green', value: '#065f46' },
    { name: 'Charcoal', value: '#374151' },
    { name: 'Hot Pink', value: '#db2777' },
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Gold', value: '#fbbf24' },
    { name: 'Orange', value: '#ea580c' }
  ];

  const fabricInfo = {
    cotton: { name: '100% Cotton', description: 'Soft, breathable, perfect for everyday wear', priceAdj: 0 },
    polyester: { name: '100% Polyester', description: 'Durable, moisture-wicking, wrinkle-resistant', priceAdj: 50 },
    'cotton-poly': { name: 'Cotton-Poly Blend', description: 'Combines comfort with durability', priceAdj: 30 },
    organic: { name: 'Organic Cotton', description: 'Eco-friendly, sustainably sourced', priceAdj: 80 }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImageAsTexture(file);
    } else {
      alert('Please drop an image file (PNG, JPG, etc.)');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  // Handle file input change
  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImageAsTexture(file);
    } else {
      alert('Please select an image file (PNG, JPG, etc.)');
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const loadImageAsTexture = (file) => {
    const url = URL.createObjectURL(file);
    const loader = new THREE.TextureLoader();
    
    loader.load(
      url,
      (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        texture.flipY = true; // Changed from false to true to fix inversion
        texture.needsUpdate = true;

        const aspectRatio = texture.image.height / texture.image.width;

        setPendingDesign({
          texture,
          url,
          aspectRatio,
          id: Date.now(),
          type: 'image'
        });
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
        URL.revokeObjectURL(url);
        alert('Failed to load image. Please try another file.');
      }
    );
  };

  const handleSurfaceClick = (point) => {
    if (!pendingDesign) return;

    const newDesign = {
      id: pendingDesign.id,
      texture: pendingDesign.texture,
      url: pendingDesign.url,
      position: [point.x, point.y, point.z + 0.02],
      rotation: [0, 0, 0],
      scale: 0.3,
      aspectRatio: pendingDesign.aspectRatio,
      type: pendingDesign.type || 'image',
      text: pendingDesign.text,
      textColor: pendingDesign.textColor,
      fontSize: pendingDesign.fontSize,
      fontFamily: pendingDesign.fontFamily
    };

    setDesigns([...designs, newDesign]);
    setPendingDesign(null);
    setSelectedDesign(newDesign.id);
  };

  const handleDesignUpdate = (designId, updates, selectOnly = false) => {
    if (selectOnly) {
      setSelectedDesign(designId);
      return;
    }
    
    setDesigns(designs.map(d => 
      d.id === designId ? { ...d, ...updates } : d
    ));
  };

  const getSelectedDesignObject = () => {
    return designs.find(d => d.id === selectedDesign);
  };

  const handleRemoveDesign = (designId) => {
    const design = designs.find(d => d.id === designId);
    if (design && design.url) {
      URL.revokeObjectURL(design.url);
    }
    setDesigns(designs.filter(d => d.id !== designId));
    if (selectedDesign === designId) {
      setSelectedDesign(null);
    }
  };

  const handleClearAll = () => {
    designs.forEach(design => {
      if (design.url) URL.revokeObjectURL(design.url);
    });
    setDesigns([]);
    setSelectedDesign(null);
    if (pendingDesign?.url) {
      URL.revokeObjectURL(pendingDesign.url);
    }
    setPendingDesign(null);
  };

  const handleAddText = (textData) => {
    setPendingDesign({
      id: Date.now(),
      type: 'text',
      text: textData.text,
      textColor: textData.color,
      fontSize: textData.fontSize,
      fontFamily: textData.fontFamily,
      aspectRatio: 1
    });
    setShowTextDialog(false);
  };

  const basePrice = 499;
  const sidePrice = printSide === 'both' ? 100 : 0;
  const totalPrice = (basePrice + (fabricInfo[fabric]?.priceAdj || 0) + sidePrice) * Math.max(1, quantity);

  const handlePlaceOrder = () => {
    const orderDetails = {
      color: tshirtColor,
      size,
      fabric: fabricInfo[fabric].name,
      quantity,
      printSide,
      totalPrice,
      designCount: designs.length
    };
    
    console.log('Order Details:', orderDetails);
    alert(`✅ Order placed successfully!\n\nTotal: ₹${totalPrice}\nSize: ${size}\nQuantity: ${quantity}\nDesigns: ${designs.length}\n\nOur team will contact you soon!`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to br, #f9fafb, #f3f4f6)', padding: 20 }}>
      {showTextDialog && (
        <TextDesignDialog 
          onClose={() => setShowTextDialog(false)}
          onAdd={handleAddText}
        />
      )}
      
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ fontSize: 36, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
           Personalize Your Anime Look
          </h1>
          <p style={{ color: '#6b7280', fontSize: 16 }}>
          Bring your ideas to life – Upload your design and let us craft it flawlessly!
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <ThreeScene 
              color={tshirtColor} 
              designs={designs}
              onSurfaceClick={handleSurfaceClick}
              pendingDrop={!!pendingDesign}
              selectedDesign={selectedDesign}
              onDesignUpdate={handleDesignUpdate}
              onCanvasClick={(e) => {
                if (pendingDesign) {
                  handleSurfaceClick({ x: 0, y: 0.3, z: 0.01 });
                }
              }}
            />

            <div style={{ 
              marginTop: 16, 
              textAlign: 'center',
              padding: 16,
              background: dragOver ? 'rgba(179, 0, 0, 0.1)' : 'rgba(255,255,255,0.5)',
              borderRadius: 8,
              border: dragOver ? '2px dashed #b30000' : '2px dashed #e5e7eb',
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>
                {dragOver ? '📥' : '🖼'}
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: dragOver ? '#b30000' : '#374151' }}>
                {dragOver ? 'Drop your image here!' : 'Add your design to the t-shirt'}
              </p>
              <p style={{ margin: '4px 0 12px 0', fontSize: 12, color: '#6b7280' }}>
                Drag & drop or browse files • After adding, click on the t-shirt to position
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <label style={{
                  padding: '10px 20px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#2563eb'}
                onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                >
                  📁 Browse Files
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                  />
                </label>
                <button
                  onClick={() => setShowTextDialog(true)}
                  style={{
                    padding: '10px 20px',
                    background: '#b30000',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#8b0000'}
                  onMouseOut={(e) => e.target.style.background = '#b30000'}
                >
                  ✏️ Add Text
                </button>
              </div>
            </div>

            {designs.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ 
                  background: 'white', 
                  padding: 16, 
                  borderRadius: 8,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 'bold' }}>
                      🎨 Your Designs ({designs.length})
                    </h4>
                    <button
                      onClick={handleClearAll}
                      style={{
                        padding: '6px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                    {designs.map((design) => (
                      <div 
                        key={design.id} 
                        style={{ 
                          position: 'relative',
                          border: selectedDesign === design.id ? '2px solid #b30000' : 'none',
                          borderRadius: 6,
                          padding: selectedDesign === design.id ? 2 : 0
                        }}
                        onClick={() => setSelectedDesign(design.id)}
                      >
                        {design.type === 'text' ? (
                          <div style={{
                            width: '100%',
                            height: 80,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6,
                            border: '2px solid #e5e7eb',
                            background: '#f9fafb',
                            fontSize: 12,
                            fontWeight: 'bold',
                            color: design.textColor,
                            fontFamily: design.fontFamily,
                            padding: 4,
                            textAlign: 'center',
                            overflow: 'hidden',
                            cursor: 'pointer'
                          }}>
                            {design.text.length > 15 ? design.text.substring(0, 15) + '...' : design.text}
                          </div>
                        ) : (
                          <img
                            src={design.url}
                            alt="Design"
                            style={{
                              width: '100%',
                              height: 80,
                              objectFit: 'contain',
                              borderRadius: 6,
                              border: '2px solid #e5e7eb',
                              background: '#f9fafb',
                              cursor: 'pointer'
                            }}
                          />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveDesign(design.id);
                          }}
                          style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: '#ef4444',
                            color: 'white',
                            border: '2px solid white',
                            cursor: 'pointer',
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
              <p style={{ margin: 0 }}>
                💡 Place your 3D model at <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>/public/models/t-shirt.glb</code>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedDesign && getSelectedDesignObject() && (
              <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '2px solid #b30000' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 'bold', color: '#b30000' }}>
                  🎯 Design Controls
                </h3>
                
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                  Size: {((getSelectedDesignObject().scale || 0.3) * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={getSelectedDesignObject().scale || 0.3}
                  onChange={(e) => handleDesignUpdate(selectedDesign, { scale: parseFloat(e.target.value) })}
                  style={{ width: '100%', marginBottom: 16 }}
                />

                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                  Position
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7280' }}>X (Left/Right)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={getSelectedDesignObject().position[0].toFixed(2)}
                      onChange={(e) => {
                        const pos = [...getSelectedDesignObject().position];
                        pos[0] = parseFloat(e.target.value);
                        handleDesignUpdate(selectedDesign, { position: pos });
                      }}
                      style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7280' }}>Y (Up/Down)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={getSelectedDesignObject().position[1].toFixed(2)}
                      onChange={(e) => {
                        const pos = [...getSelectedDesignObject().position];
                        pos[1] = parseFloat(e.target.value);
                        handleDesignUpdate(selectedDesign, { position: pos });
                      }}
                      style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#6b7280' }}>Z (Depth)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={getSelectedDesignObject().position[2].toFixed(2)}
                      onChange={(e) => {
                        const pos = [...getSelectedDesignObject().position];
                        pos[2] = parseFloat(e.target.value);
                        handleDesignUpdate(selectedDesign, { position: pos });
                      }}
                      style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                  </div>
                </div>

                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                  Rotation (Z-axis): {Math.round((getSelectedDesignObject().rotation?.[2] || 0) * (180 / Math.PI))}°
                </label>
                <input
                  type="range"
                  min="0"
                  max={Math.PI * 2}
                  step="0.1"
                  value={getSelectedDesignObject().rotation?.[2] || 0}
                  onChange={(e) => {
                    const rot = getSelectedDesignObject().rotation || [0, 0, 0];
                    handleDesignUpdate(selectedDesign, { rotation: [rot[0], rot[1], parseFloat(e.target.value)] });
                  }}
                  style={{ width: '100%', marginBottom: 12 }}
                />

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleRemoveDesign(selectedDesign)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={() => setSelectedDesign(null)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    ✓ Done
                  </button>
                </div>
              </div>
            )}
            
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 'bold' }}>
                🎨 T-Shirt Color
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 12 }}>
                {colorOptions.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setTshirtColor(c.value)}
                    title={c.name}
                    style={{
                      height: 44,
                      borderRadius: 8,
                      border: tshirtColor === c.value ? '3px solid #111827' : '2px solid #e5e7eb',
                      background: c.value,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: tshirtColor === c.value ? '0 4px 6px rgba(0,0,0,0.2)' : 'none'
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="color"
                  value={tshirtColor}
                  onChange={(e) => setTshirtColor(e.target.value)}
                  style={{ flex: 1, height: 40, borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={tshirtColor}
                  onChange={(e) => setTshirtColor(e.target.value)}
                  placeholder="#000000"
                  style={{ width: 110, padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}
                />
              </div>
            </div>

            <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 'bold' }}>
                📏 Size & Fabric
              </h3>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Size
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, cursor: 'pointer' }}
              >
                <option value="XS">Extra Small (XS)</option>
                <option value="S">Small (S)</option>
                <option value="M">Medium (M)</option>
                <option value="L">Large (L)</option>
                <option value="XL">Extra Large (XL)</option>
                <option value="XXL">Double XL (XXL)</option>
              </select>

              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Fabric Type
              </label>
              <select
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, cursor: 'pointer' }}
              >
                {Object.entries(fabricInfo).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name} {info.priceAdj > 0 ? `(+₹${info.priceAdj})` : ''}
                  </option>
                ))}
              </select>
              <p style={{ color: '#6b7280', fontSize: 13, margin: '8px 0 0 0' }}>
                {fabricInfo[fabric].description}
              </p>
            </div>

            <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 'bold' }}>
                🛒 Order Details
              </h3>
              
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || '1')))}
                style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}
              />

              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Print Side
              </label>
              <select
                value={printSide}
                onChange={(e) => setPrintSide(e.target.value)}
                style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, cursor: 'pointer' }}
              >
                <option value="front">Front Only</option>
                <option value="back">Back Only</option>
                <option value="both">Both Sides (+₹100)</option>
              </select>

              <div style={{ 
                background: 'linear-gradient(to r, #dbeafe, #fae8ff)', 
                padding: 16, 
                borderRadius: 8,
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span>Base Price:</span>
                  <span>₹{basePrice}</span>
                </div>
                {fabricInfo[fabric].priceAdj > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                    <span>Fabric:</span>
                    <span>+₹{fabricInfo[fabric].priceAdj}</span>
                  </div>
                )}
                {printSide === 'both' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                    <span>Both Sides:</span>
                    <span>+₹{sidePrice}</span>
                  </div>
                )}
                {quantity > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                    <span>Quantity:</span>
                    <span>×{quantity}</span>
                  </div>
                )}
                <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 'bold' }}>
                  <span>Total:</span>
                  <span style={{ color: '#b30000' }}>₹{totalPrice}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={designs.length === 0}
                style={{
                  width: '100%',
                  padding: 14,
                  background: designs.length === 0 ? '#9ca3af' : '#b30000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 'bold',
                  cursor: designs.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s',
                  opacity: designs.length === 0 ? 0.6 : 1
                }}
                onMouseOver={(e) => {
                  if (designs.length > 0) e.target.style.background = '#8b0000';
                }}
                onMouseOut={(e) => {
                  if (designs.length > 0) e.target.style.background = '#b30000';
                }}
              >
                🛍 {designs.length === 0 ? 'Add Design First' : 'Place Order'}
              </button>
              {designs.length === 0 && (
                <p style={{ 
                  textAlign: 'center', 
                  fontSize: 12, 
                  color: '#6b7280', 
                  marginTop: 8,
                  marginBottom: 0 
                }}>
                  Add images or text to get started
                </p>
              )}
            </div>

            <div style={{ background: '#fef3c7', padding: 16, borderRadius: 12, border: '1px solid #fde68a' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 'bold', color: '#92400e' }}>
                💡 Quick Tips
              </h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
                <li>Upload images using "Browse Files" or drag & drop from desktop</li>
                <li>Click "Add Text" to create custom text designs</li>
                <li>Click on any design in the 3D view to select and edit it</li>
                <li>Use the controls panel to resize, position & rotate designs</li>
                <li>Rotate the 3D view to see your design from all angles</li>
                <li>Add multiple designs to create unique combinations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDesignPage;
