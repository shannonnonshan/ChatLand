'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'

type Post = {
  id: number
  createdAt: string
  description: string
  imageUrl?: string
}

type User = {
  id: number
  name: string
  email: string
  avatar?: string
  posts: Post[]
  friends: User[]
  requestSent?: boolean
}

export default function ProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [friendStatus, setFriendStatus] = useState<'friend' | 'request' | 'none'>('none')
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editText, setEditText] = useState('')
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`)
        const data: User = await res.json()
        setUser(data)

        if (currentUser) {
          if (data.friends.some(f => f.id === currentUser.id)) {
            setFriendStatus('friend')
          } else if (data.requestSent) {
            setFriendStatus('request')
          } else {
            setFriendStatus('none')
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchUser()
  }, [id, currentUser])

  const handleFriendAction = async () => {
    if (!currentUser || !user) return alert("Bạn chưa đăng nhập!")

    let endpoint = ''
    if (friendStatus === 'friend' || friendStatus === 'request') {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/users/friend-request/cancel`
    } else {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/users/friend-request/send`
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser.id, receiverId: user.id }),
      })

      if (!res.ok) throw new Error(await res.text())

      if (friendStatus === 'friend' || friendStatus === 'request') {
        setFriendStatus('none')
        setUser(prev => prev ? { ...prev, friends: prev.friends.filter(f => f.id !== currentUser.id) } : prev)
      } else {
        setFriendStatus('request')
      }
    } catch (err) {
      console.error(err)
      alert(friendStatus === 'none' ? 'Failed to send friend request!' : 'Failed to cancel request!')
    }
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setEditText(post.description)
    setEditImageUrl(post.imageUrl || null)
    setShowEditModal(true)
  }

  const handleDeletePost = async (postId: number) => {
    if (!currentUser) return alert("Bạn chưa đăng nhập!")
    if (!confirm('Bạn có chắc muốn xóa bài này?')) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/${currentUser.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(await res.text())

      setUser(prev => prev ? { ...prev, posts: prev.posts.filter(p => p.id !== postId) } : prev)
    } catch (err) {
      console.error(err)
      alert('Xóa bài thất bại!')
    }
  }

  const handleUpdatePost = async () => {
    if (!editingPost || !currentUser) return
    try {
      const formData = new FormData()
      formData.append('description', editText)
      // Nếu có edit image từ local, append file
      // formData.append('image', someFile)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${editingPost.id}/edit`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error(await res.text())
      const updatedPost: Post = await res.json()

      setUser(prev => prev ? { ...prev, posts: prev.posts.map(p => p.id === updatedPost.id ? updatedPost : p) } : prev)
      setShowEditModal(false)
      setEditingPost(null)
    } catch (err) {
      console.error(err)
      alert('Cập nhật thất bại!')
    }
  }

  if (loading)
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>

  if (!user)
    return <div className="min-h-screen flex items-center justify-center text-gray-500">User not found</div>

  const isOwnProfile = currentUser?.id === user.id

  return (
    <motion.div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-16 flex flex-col items-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
      {/* Edit Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-lg w-full flex flex-col gap-3">
            <textarea value={editText} onChange={e => setEditText(e.target.value)} className="w-full p-2 border rounded resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEditModal(false)} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleUpdatePost} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-500 text-sm hover:underline mb-4">
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative">
            <Image src={user.avatar || 'https://www.pngitem.com/pimgs/m/150-1503945_transparent-user-png-default-user-image-png-png.png'} alt={user.name} width={100} height={100} className="rounded-full shadow-sm"/>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mt-3">{user.name}</h1>

          {/* Stats & Friend Button */}
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex flex-col items-center">
              <span className="font-semibold text-gray-900 text-lg">{user.posts.length}</span>
              <span className="text-gray-500 text-xs">Posts</span>
            </div>
            <div onClick={() => router.push(`/listfriend/${user.id}`)} className="flex flex-col items-center cursor-pointer hover:text-blue-500 transition">
              <span className="font-semibold text-gray-900 text-lg">{user.friends.length}</span>
              <span className="text-gray-500 text-xs">Friends</span>
            </div>
            {!isOwnProfile && (
              <div className='flex flex-col items-center'>
                {friendStatus === 'friend' ? (
                  <button onClick={handleFriendAction} className="mt-3 bg-gray-300 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-400 transition">Your Friend</button>
                ) : friendStatus === 'request' ? (
                  <button onClick={handleFriendAction} className="mt-3 bg-yellow-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-yellow-600 transition shadow-sm">Cancel Request</button>
                ) : (
                  <button onClick={handleFriendAction} className="mt-3 bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-600 transition shadow-sm">Add Friend</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-6"></div>

        {/* Posts */}
        <div className="flex flex-col gap-6">
          {user.posts.map((post) => (
            <div key={post.id} className="rounded-lg border border-gray-100 flex flex-col gap-3 p-4">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <time>
                    {new Date(post.createdAt).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                  {isOwnProfile && (
                    <div className="flex gap-2">
                      <button onClick={() => handleEditPost(post)} className="p-1 hover:bg-gray-200 rounded">
                        <PencilSquareIcon className="h-5 w-5 text-gray-600"/>
                      </button>
                      <button onClick={() => handleDeletePost(post.id)} className="p-1 hover:bg-gray-200 rounded">
                        <TrashIcon className="h-5 w-5 text-red-500"/>
                      </button>
                    </div>
                  )}
              </div>
              <p className="text-gray-700 text-sm">{post.description}</p>
              {post.imageUrl && (
                <div className="mt-2 w-full h-64 relative rounded overflow-hidden">
                  <Image src={`${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`} alt="Post image" fill className="object-cover rounded" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
