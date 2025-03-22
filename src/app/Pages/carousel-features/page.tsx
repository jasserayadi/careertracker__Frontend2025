"use client";

import Image from "next/image";
import React from "react";
import { Typography } from "@material-tailwind/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export function CarouselFeatures() {
  return (
    <section className="px-8 pt-40 pb-20">
      <div className="flex mb-16 flex-col items-center">
        <Typography variant="h2" className="text-center mb-2" color="blue-gray">
          What Students Say
        </Typography>
        <Typography
          variant="lead"
          className="mb-3 w-full text-center font-normal !text-gray-500 lg:w-10/12"
        >
          Discover what our students have to say about our course!
        </Typography>
      </div>
      <div className="container mx-auto !rounded-lg bg-[url('/image/Background.png')] bg-center py-10 lg:px-16">
        <Swiper
          modules={[Pagination, Navigation]}
          pagination={{ clickable: true }}
          navigation
          loop
          className="mySwiper"
        >
          {new Array(2).fill("").map((_, i) => (
            <SwiperSlide key={i}>
              <div className="!relative flex grid-cols-1 flex-col-reverse gap-6 px-10 py-14 md:grid md:grid-cols-5 md:gap-14 md:py-20">
                <div className="col-span-3 flex flex-col items-start justify-center">
                  <Typography
                    variant="lead"
                    color="white"
                    className="mb-5 text-xl font-normal"
                  >
                    Easy Shopping, Quick Delivery <br />
                    No need to stress about shopping for books. Order online and
                    have your textbooks and supplies delivered straight to your
                    doorstep for free.
                  </Typography>
                  <Typography
                    variant="small"
                    color="white"
                    className="font-medium uppercase"
                  >
                    Louis Miriam,{" "}
                    <span className="font-normal opacity-60">
                      Web Developer @ AMAZON INC.
                    </span>
                  </Typography>
                </div>
                <div className="col-span-2 flex w-full shrink-0 md:!justify-end">
                  <Image
                    width={256}
                    height={256}
                    src="/image/logos/logo-amazon-3.svg"
                    alt="testimonial image"
                    className="h-full w-2/4 object-contain md:!w-2/3"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default CarouselFeatures;