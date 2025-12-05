import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';

// Main 3D Hanger Model Component
function HangerModel({ color, hangerType }) {
    const groupRef = useRef();
    const modelPath = `/models/${hangerType}.glb`;
    
    // Load the GLB model
    const { scene } = useGLTF(modelPath);
    const clonedScene = React.useMemo(() => scene.clone(), [scene]);

    // Debug: Log model info
    useEffect(() => {

        if (clonedScene) {
            const box = new THREE.Box3().setFromObject(clonedScene);
            const size = box.getSize(new THREE.Vector3());

        }
    }, [clonedScene, hangerType]);

    // Update color when it changes
    useEffect(() => {
        if (clonedScene) {
            // For 97-12: Calculate bounds to detect top hook area
            let topThreshold = null;
            if (hangerType === '97-12') {
                const boundingBox = new THREE.Box3().setFromObject(clonedScene);
                const modelHeight = boundingBox.max.y - boundingBox.min.y;
                topThreshold = boundingBox.max.y - (modelHeight * 0.25); // Top 25% is hook
            }
            
            clonedScene.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Clone material only once
                    if (!child.material.cloned) {
                        child.material = child.material.clone();
                        child.material.cloned = true;
                        child.material.originalColor = child.material.color.clone();
                    }
                    
                    // 97-11: Single mesh model - color everything
                    if (hangerType === '97-11') {
                        child.material.color.set(color);
                        child.material.metalness = 0.1;
                        child.material.roughness = 0.3;
                        child.material.emissive = new THREE.Color(color);
                        child.material.emissiveIntensity = 0.15;
                    } 
                    // 97-12: Try position-based detection for hook
                    else if (hangerType === '97-12') {
                        const worldPos = new THREE.Vector3();
                        child.getWorldPosition(worldPos);
                        const isTopPart = worldPos.y > topThreshold;
                        
                        if (isTopPart) {
                            // Keep hook silver
                            child.material.color.copy(child.material.originalColor);
                            child.material.metalness = 0.9;
                            child.material.roughness = 0.1;
                            child.material.emissive = new THREE.Color(0x000000);
                            child.material.emissiveIntensity = 0;
                        } else {
                            // Color the body
                            child.material.color.set(color);
                            child.material.metalness = 0.1;
                            child.material.roughness = 0.3;
                            child.material.emissive = new THREE.Color(color);
                            child.material.emissiveIntensity = 0.15;
                        }
                    }
                    // MB3 and CQ-807: Material-based detection
                    else {
                        const originalColor = child.material.originalColor;
                        const r = originalColor.r;
                        const g = originalColor.g;
                        const b = originalColor.b;
                        const avgBrightness = (r + g + b) / 3;
                        
                        // Check material/object name for metal keywords
                        const materialName = (child.material.name || child.name || '').toLowerCase();
                        const hasMetalName = materialName.includes('metal') || 
                                           materialName.includes('chrome') || 
                                           materialName.includes('hook') ||
                                           materialName.includes('steel') ||
                                           materialName.includes('silver');
                        
                        // Detect metal parts: medium gray colors
                        const isGrayish = Math.abs(r - g) < 0.15 && Math.abs(g - b) < 0.15 && Math.abs(r - b) < 0.15;
                        const isMetalRange = avgBrightness > 0.3 && avgBrightness < 0.8;
                        const isMetal = isGrayish && isMetalRange;
                        
                        if (isMetal || hasMetalName) {
                            // Keep metal parts silver (hooks)
                            child.material.color.copy(originalColor);
                            child.material.metalness = 0.9;
                            child.material.roughness = 0.1;
                            child.material.emissive = new THREE.Color(0x000000);
                            child.material.emissiveIntensity = 0;
                        } else {
                            // Apply custom color to plastic parts (body)
                            child.material.color.set(color);
                            child.material.metalness = 0.1;
                            child.material.roughness = 0.3;
                            child.material.emissive = new THREE.Color(color);
                            child.material.emissiveIntensity = 0.15;
                        }
                    }
                    
                    child.material.needsUpdate = true;
                }
            });
        }
    }, [color, clonedScene, hangerType]);

    return (
        <group ref={groupRef}>
            <primitive object={clonedScene} scale={5} />
        </group>
    );
}

// Custom Text Component (uses built-in font, no external file needed)
function CustomText({ text, position, size, color }) {
    if (!text) return null;

    return (
        <Text
            position={[position.x, position.y, position.z - 0.01]} // Default behind the model
            fontSize={size * 0.1} // Much smaller text size
            color={color || 'black'}
            anchorX="center"
            anchorY="middle"
        >
            {text}
        </Text>
    );
}

// Custom Logo Component
function CustomLogo({ logoUrl, position, size }) {
    const [texture, setTexture] = React.useState(null);

    useEffect(() => {
        if (logoUrl) {
            const loader = new THREE.TextureLoader();
            loader.load(logoUrl, (loadedTexture) => {
                setTexture(loadedTexture);
            });
        }
    }, [logoUrl]);

    if (!texture) return null;

    return (
        <mesh position={[position.x, position.y + 0.07, position.z + 0.5 - 0.512]}>
            <planeGeometry args={[size * 0.1, size * 0.1]} />
            <meshBasicMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
        </mesh>
    );
}

// Main Scene Component
export default function HangerScene({ color, hangerType, customText, textColor, textPosition, textSize, logoPreview, logoPosition, logoSize }) {
    return (
        <Canvas
            camera={{ position: [0, 0, 2.5], fov: 25}}
            style={{ width: '100%', height: '100%', background: '#ffffff' }}
            gl={{ preserveDrawingBuffer: true }}
        >
            {/* Enhanced lighting for vibrant colors */}
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <directionalLight position={[-5, -5, -5]} intensity={0.5} />
            <pointLight position={[0, 5, 0]} intensity={0.4} color="#ffffff" />
            
            <React.Suspense fallback={null}>
                <HangerModel color={color} hangerType={hangerType} />
            </React.Suspense>
            
            {/* Custom Text */}
            {customText && textPosition && (
                <React.Suspense fallback={null}>
                    <CustomText 
                        text={customText}
                        position={textPosition}
                        size={textSize || 1}
                        color={textColor}
                    />
                </React.Suspense>
            )}
            
            {/* Custom Logo */}
            {logoPreview && logoPosition && (
                <React.Suspense fallback={null}>
                    <CustomLogo 
                        logoUrl={logoPreview}
                        position={logoPosition}
                        size={logoSize || 1}
                    />
                </React.Suspense>
            )}
            
            <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
            />
        </Canvas>
    );
}

// Preload models
useGLTF.preload('/models/MB3.glb');
useGLTF.preload('/models/97-12.glb');
useGLTF.preload('/models/CQ-807.glb');
useGLTF.preload('/models/97-11.glb');
useGLTF.preload('/models/97-08.glb');
