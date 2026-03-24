import Container from '../ui/Container.jsx'
import FeaturedProjectsSection from '../sections/home/FeaturedProjectsSection.jsx'
import HeroSection from '../sections/home/HeroSection.jsx'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Container>
        <FeaturedProjectsSection />
      </Container>
    </>
  )
}
