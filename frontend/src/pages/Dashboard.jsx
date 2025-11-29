import HeroSection from '../components/dashboard/HeroSection'
import Filter from '../components/dashboard/Filter'
import EventGrid from '../components/dashboard/EventGrid'
import Navbar from '../components/Navbar'

const Dashboard = () => {
  return (
    <div>
      <HeroSection />
      <Filter />
      <EventGrid />
    </div>
  )
}

export default Dashboard
