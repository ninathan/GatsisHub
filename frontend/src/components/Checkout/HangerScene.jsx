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
        console.log('✅ Model loaded:', hangerType);
        if (clonedScene) {
            const box = new THREE.Box3().setFromObject(clonedScene);
            const size = box.getSize(new THREE.Vector3());
            console.log('Model size:', size);
        }
    }, [clonedScene, hangerType]);

    // Update color when it changes
    useEffect(() => {
        if (clonedScene) {
            // First pass: Calculate the total geometry size to identify main vs detail parts
            const geometrySizes = new Map();
            let totalSize = 0;
            
            clonedScene.traverse((child) => {
                if (child.isMesh && child.geometry) {
                    child.geometry.computeBoundingBox();
                    const bbox = child.geometry.boundingBox;
                    const size = bbox.max.distanceTo(bbox.min);
                    geometrySizes.set(child, size);
                    totalSize += size;
                }
            });
            
            const averageSize = totalSize / geometrySizes.size;
            
            // Second pass: Only color large parts (main body), preserve small parts (details)
            clonedScene.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (!child.material.cloned) {
                        child.material = child.material.clone();
                        child.material.cloned = true;
                        child.material.originalColor = child.material.color.clone();
                    }
                    
                    const meshSize = geometrySizes.get(child) || 0;
                    
                    // Only color if this mesh is larger than 50% of average size
                    // Small details (< 50% average) keep their original color completely
                    if (meshSize > averageSize * 0.5) {
                        // Main body parts - apply selected color
                        child.material.color.set(color);
                    } else {
                        // Small details - keep 100% original color
                        child.material.color.copy(child.material.originalColor);
                    }
                }
            });
        }
    }, [color, clonedScene]);

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
            camera={{ position: [0, 0, 8], fov: 20}}
            style={{ width: '100%', height: '100%', background: '#ffffff' }}
            gl={{ preserveDrawingBuffer: true }}
        >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            
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
useGLTF.preload('/models/MB7.glb');
useGLTF.preload('/models/CQ-03.glb');
useGLTF.preload('/models/97-11.glb');
