import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';

function Model({ url, color }) {
  const { scene } = useGLTF(url);
  scene.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set(color);
    }
  });
  return <primitive object={scene} />;
}

// 1. Add 'lightRotation' to the props here
const FurnitureViewer = ({ modelPath, customColor, intensity, environment, lightRotation }) => {
  
  // Convert degrees to Radians for the math to work
  const angleInRadians = (lightRotation * Math.PI) / 180;

  return (
    <div style={{ width: '100%', height: '550px', background: '#F5F2F0', borderRadius: '32px', overflow: 'hidden' }}>
      <Canvas dpr={[1, 2]} camera={{ fov: 45 }} shadows>
        <Suspense fallback={null}>
          
          {/* 2. Add the Rotating Light here */}
          {/* We calculate X and Z so it moves in a circle around the furniture */}
          <directionalLight 
            position={[
              10 * Math.sin(angleInRadians), 
              5, 
              10 * Math.cos(angleInRadians)
            ]} 
            intensity={intensity * 2} 
            castShadow 
          />

          <Stage environment={environment} intensity={intensity} contactShadow={true} shadows="contact">
            <Model url={modelPath} color={customColor} />
          </Stage>
        </Suspense>
        <OrbitControls makeDefault enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
};

export default FurnitureViewer;