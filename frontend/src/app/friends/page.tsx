'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { UserIcon } from '@heroicons/react/24/outline'

// Kiểu dữ liệu Post từ backend
interface Post {
  id: number
  description: string
  imageUrl?: string
  createdAt: string
  user: {
    id: number
    name: string
    avatar: string
    online: boolean
  }
}

export default function FriendsFeedPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetchPosts = async () => {
    setLoading(true)
    try {
      // Lấy userId từ localStorage/session
      const storedUserId = localStorage.getItem('userId')
      if (!storedUserId) {
        console.warn('No userId found in localStorage')
        setPosts([])
        return
      }

      const userId = Number(storedUserId)
      if (isNaN(userId)) {
        console.error('Invalid userId in localStorage:', storedUserId)
        setPosts([])
        return
      }

      // Gọi API backend lấy posts của bạn bè
      const res = await fetch(`/api/posts/friends?userId=${userId}`)
      if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`)

      const data: Post[] = await res.json()
      setPosts(data)
    } catch (err) {
      console.error('Error fetching friend posts:', err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  fetchPosts()
}, [])

  if (loading) return <div className="text-center py-20">Loading...</div>

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-16"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Friends Feed</h1>
          <p className="text-gray-500 text-sm">See what your friends are up to 👋</p>
        </div>

        <div className="flex flex-col gap-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <motion.div
                key={post.id}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={post.user.avatar}
                      alt={post.user.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        post.user.online ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    ></span>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-900 text-sm">{post.user.name}</p>
                    <time className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</time>
                  </div>
                  <button
                    onClick={() => router.push(`/profile/${post.user.id}`)}
                    className="ml-auto text-xs flex items-center gap-1 text-blue-500 hover:underline"
                  >
                    <UserIcon className="w-4 h-4" /> View Profile
                  </button>
                </div>

                <p className="text-gray-700 text-sm">{post.description}</p>
                {post.imageUrl && (
                  <div className="w-full h-60 relative rounded-lg overflow-hidden">
                    <Image src={post.imageUrl} alt="Post image" fill className="object-cover" />
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-500 text-sm py-10">
              You don’t have any friends’ posts yet 😅
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
