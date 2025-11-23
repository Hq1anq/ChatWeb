import React from 'react'
import Sidebar from '../components/Sidebar'
import MessageContainer from '../components/MessageContainer'
import { useChatStore } from '../store/chatStore'

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useChatStore()

  const handleSelectUser = (user) => {
    setSelectedUser(user)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-base-100">
      {/* Sidebar */}
      <div className="w-full sm:w-1/3 md:w-1/4 lg:w-1/5">
        <Sidebar
          onSelectUser={handleSelectUser}
          selectedUserId={selectedUser?.userid}
        />
      </div>

      <div className="divider divider-horizontal hidden sm:flex m-0 p-0"></div>

      {/* MessageContainer */}
      <div className="grow h-full">
        <MessageContainer />
      </div>
    </div>
  )
}

export default HomePage