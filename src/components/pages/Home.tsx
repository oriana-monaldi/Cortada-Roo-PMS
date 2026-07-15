import Apartments from "../home/Apartments";
import Gallery from "../home/Gallery";
import HeroSection from "../home/HeroSection";
import Services from "../home/Services";

const Home = () => {
  return (
    <>
      <HeroSection />
      <Apartments />
      <Services />
      <Gallery />
    </>
  );
};

export default Home;
