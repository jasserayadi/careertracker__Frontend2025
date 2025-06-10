// components
import {Footer } from "@/app/Components";
import Hero from "../hero/page";
import OnlineCourse from "../online-course/page";
import WhyChooseUs from "../why-choose-us/page";
import CarouselFeatures from "../carousel-features/page";
import Pricing from "../pricing/page";
import OtherCourses from "../other-courses/page";
import EmployeeNavbar from "@/app/Components/employeeNavbar";



// sections
export default function CampaignE() {
  return (
    <>
      <EmployeeNavbar />
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