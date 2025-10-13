'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { CameraIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/solid'

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const pathname = usePathname()

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) videoRef.current.srcObject = stream
        streamRef.current = stream
      } catch (err) {
        console.error('Cannot access camera', err)
        alert('Cannot access camera')
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Start camera on mount
  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  // 🔥 Stop camera whenever route changes
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [pathname])

  const takePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      setPhoto(canvas.toDataURL('image/png'))
      stopCamera()
    }
  }

  const deletePhoto = () => {
    setPhoto(null)
    startCamera()
  }

  const uploadPhoto = () => {
    if (photo) {
      console.log('Upload photo:', photo)
      alert('Uploaded! (demo)')
      setPhoto(null)
      startCamera()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 p-4">
      <div className="relative w-[70%] h-[500px] rounded overflow-hidden shadow-lg bg-black">
        {!photo ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <button
              onClick={takePhoto}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center shadow-lg hover:bg-yellow-300 transition transform hover:scale-110"
            >
              <CameraIcon className="h-8 w-8 text-white" />
            </button>
          </>
        ) : (
          <>
            <div className="w-full h-full relative">
              <Image
                src={photo}
                alt="Preview"
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-5">
              <button
                onClick={uploadPhoto}
                className="w-14 h-14 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center shadow-md hover:bg-yellow-300 transition transform hover:scale-110"
              >
                <ArrowUpTrayIcon className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={deletePhoto}
                className="w-12 h-12 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow-md hover:bg-red-600 transition transform hover:scale-110"
              >
                <XMarkIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
