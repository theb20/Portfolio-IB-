import Container from '../ui/Container.jsx'
import FeaturedProjectsSection from '../sections/home/FeaturedProjectsSection.jsx'
import HeroSection from '../sections/home/HeroSection.jsx'
import MarqueeSection from '../sections/home/MarqueeSection.jsx'
import HighlightsSection from '../sections/home/HighlightsSection.jsx'
import ShowcaseSection from '../sections/home/ShowcaseSection.jsx'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <HighlightsSection />
      <ShowcaseSection />
    </>
  )
}
