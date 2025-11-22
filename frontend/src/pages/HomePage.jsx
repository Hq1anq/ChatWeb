import Sidebar from '../components/Sidebar'
import MessageContainer from '../components/MessageContainer'

const HomePage = () => {
  return (
    <div className="flex h-full w-full bg-base-100">
      <Sidebar />

      <div className="divider divider-horizontal hidden sm:flex m-0 p-0"></div>

      <MessageContainer />
    </div>
  )
}

export default HomePage
