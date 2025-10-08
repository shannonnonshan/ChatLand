'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { UserIcon } from '@heroicons/react/24/outline'

// === Giả lập dữ liệu người dùng và bạn bè ===
const users = [
  {
    id: 1,
    name: 'Michael Foster',
    avatar:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&w=256&h=256&q=80',
    isFriend: true,
    online: true,
    posts: [
      {
        id: 1,
        description: 'Lovely day for a coffee ☕',
        imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',
        date: 'Sep 10, 2025',
      },
      {
        id: 2,
        description: 'Morning run with the team 🏃‍♂️',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
        date: 'Oct 2, 2025',
      },
    ],
  },
  {
    id: 2,
    name: 'Lindsay Walton',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&w=256&h=256&q=80',
    isFriend: true,
    online: false,
    posts: [
      {
        id: 1,
        description: 'Chilling at the beach 🌊',
        imageUrl: 'https://images.unsplash.com/photo-1526481280690-7ead59e4b2bb?auto=format&fit=crop&w=800&q=80',
        date: 'Oct 5, 2025',
      },
    ],
  },
  {
    id: 3,
    name: 'Tom Cook',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&w=256&h=256&q=80',
    isFriend: false, // không phải bạn
    online: false,
    posts: [
      {
        id: 1,
        description: 'Work hard, chill harder 💼🎉',
        imageUrl: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?auto=format&fit=crop&w=800&q=80',
        date: 'Oct 1, 2025',
      },
    ],
  },
]

export default function FriendsFeedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = Number(searchParams.get('userId')) || 1 // id user đang đăng nhập

  // Lọc ra bạn bè
  const friendPosts = users
    .filter((u) => u.isFriend)
    .flatMap((friend) =>
      friend.posts.map((post) => ({
        ...post,
        author: { id: friend.id, name: friend.name, avatar: friend.avatar, online: friend.online },
      }))
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-16"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Friends Feed</h1>
          <p className="text-gray-500 text-sm">See what your friends are up to 👋</p>
        </div>

        {/* List bài đăng của bạn bè */}
        <div className="flex flex-col gap-6">
          {friendPosts.length > 0 ? (
            friendPosts.map((post) => (
              <motion.div
                key={post.author.id + '-' + post.id}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3"
              >
                {/* Header user */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        post.author.online ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    ></span>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-900 text-sm">{post.author.name}</p>
                    <time className="text-xs text-gray-500">{post.date}</time>
                  </div>
                  <button
                    onClick={() => router.push(`/profile/${post.author.id}`)}
                    className="ml-auto text-xs flex items-center gap-1 text-blue-500 hover:underline"
                  >
                    <UserIcon className="w-4 h-4" /> View Profile
                  </button>
                </div>

                {/* Nội dung */}
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
