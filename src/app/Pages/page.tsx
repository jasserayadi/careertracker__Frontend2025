// components
import { Navbar, Footer } from "@/app/Components";

// sections
import Hero from "./hero/page";
import OnlineCourse from "./online-course/page";
import WhyChooseUs from "./why-choose-us/page";
import CarouselFeatures from "./carousel-features/page";
import Pricing from "./pricing/page";
import OtherCourses from "./other-courses/page";

export default function Campaign() {
  return (
    <>
      <Navbar />
      <Hero />
      <OnlineCourse />
      <WhyChooseUs />
      <CarouselFeatures />
      <Pricing />
      <OtherCourses />
      <Footer />
    </>
  );
}
