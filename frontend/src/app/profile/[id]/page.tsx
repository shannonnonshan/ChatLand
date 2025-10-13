'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

type Post = {
  id: number
  date: string
  description: string
  imageUrl?: string
}

type User = {
  id: number
  name: string
  email: string
  avatar?: string
  posts: Post[]
}

export default function ProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${id}`)
        const data = await res.json()
        setUser(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchUser()
  }, [id])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    )

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        User not found
      </div>
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-16 flex flex-col items-center"
    >
      <div className="max-w-4xl w-full">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-blue-500 text-sm hover:underline mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center mb-6"
        >
          <div className="relative">
            <Image
              src={
                user.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'
              }
              alt={user.name}
              width={100}
              height={100}
              className="rounded-full shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
          </div>

          <h1 className="text-xl font-semibold text-gray-900 mt-3">
            {user.name}
          </h1>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex flex-col items-center">
              <span className="font-semibold text-gray-900 text-lg">
                {user.posts.length}
              </span>
              <span className="text-gray-500 text-xs">Posts</span>
            </div>
            <div
              onClick={() => router.push(`/listfriend/${user.id}`)}
              className="flex flex-col items-center cursor-pointer hover:text-blue-500 transition"
            >
              <span className="font-semibold text-gray-900 text-lg">842</span>
              <span className="text-gray-500 text-xs">Friends</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-gray-900 text-lg">305</span>
              <span className="text-gray-500 text-xs">Following</span>
            </div>
          </div>

          <button className="mt-3 bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-600 transition shadow-sm">
            Add Friend
          </button>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-6"></div>

        {/* Posts */}
        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {user.posts.map((post) => (
            <motion.div
              key={post.id}
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="rounded-lg border border-gray-100 flex flex-col gap-3"
            >
              <div className="flex justify-between items-center text-xs text-gray-500">
                <time>{post.date}</time>
              </div>
              <p className="text-gray-700 text-sm">{post.description}</p>
              {post.imageUrl && (
                <div className="mt-2 w-full h-64 relative rounded overflow-hidden">
                  <Image
                    src={post.imageUrl}
                    alt="Post image"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
