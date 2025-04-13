import { useRef, useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.preload('/models/t-shirt.glb')

export default function TShirtModel({ color = '#ffffff', texture = null }) {
  const { scene } = useGLTF('/models/t-shirt.glb')
  const cloned = useMemo(() => scene.clone(true), [scene])
  const ready = useRef(false)

  useEffect(() => {
    cloned.traverse(child => {
      if (!child.isMesh) return
      if (!ready.current) {
        child.material = child.material ? child.material.clone() : new THREE.MeshStandardMaterial()
        child.castShadow = true
        child.receiveShadow = true
      }
      child.material.color = new THREE.Color(color)
    })
    ready.current = true
  }, [color, cloned])

  useEffect(() => {
    if (!texture) {
      cloned.traverse(child => {
        if (!child.isMesh) return
        child.material.map = null
        child.material.needsUpdate = true
      })
      return
    }
    const loader = new THREE.TextureLoader()
    loader.load(texture, tex => {
      tex.flipY = false
      cloned.traverse(child => {
        if (!child.isMesh) return
        child.material.map = tex
        child.material.needsUpdate = true
      })
    })
    return () => {
      cloned.traverse(child => {
        if (child.isMesh && child.material.map) {
          child.material.map.dispose()
          child.material.map = null
          child.material.needsUpdate = true
        }
      })
    }
  }, [texture, cloned])

  return <primitive object={cloned} scale={1} position={[0, -0.5, 0]} />
}