'use client';

import { useState, useRef, useEffect } from "react";
import { Typography, Card, CardBody, CardHeader, Button } from "@material-tailwind/react";
import Image from "next/image";

interface CourseCardProps {
  img: string;
  title: string;
  desc: string;
  buttonLabel: string;
}

export function CourseCard({ img, title, desc, buttonLabel }: CourseCardProps) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const descContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (descContainerRef.current) {
      const element = descContainerRef.current;
      const lineHeight = parseInt(getComputedStyle(element).lineHeight);
      const maxHeight = lineHeight * 3; // 3 lines
      setIsClamped(element.scrollHeight > maxHeight);
    }
  }, [desc, showFullDesc]);

  return (
    <Card color="transparent" shadow={false} className="h-full">
      <CardHeader floated={false} className="mx-0 mt-0 mb-6 h-48">
        <Image 
          width={768} 
          height={768} 
          src={img} 
          alt={title} 
          className="h-full w-full object-cover"
          priority
        />
      </CardHeader>
      <CardBody className="p-0 flex flex-col h-full">
        <div>
          <Typography variant="h5" className="mb-2 text-blue-gray-900">
            {title}
          </Typography>
          <div className="relative">
            <div
              ref={descContainerRef}
              className={`mb-2 font-normal text-gray-500 whitespace-pre-line ${
                !showFullDesc ? 'line-clamp-3' : ''
              }`}
              style={{
                lineHeight: '1.5',
                fontFamily: 'inherit'
              }}
              dangerouslySetInnerHTML={{ __html: desc }}
            />
            {isClamped && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowFullDesc(!showFullDesc);
                }}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium mt-1 mb-3"
              >
                {showFullDesc ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>
        <div className="mt-auto w-full">
          <Button 
            color="gray" 
            size="sm" 
            className="w-full uppercase"
          >
            {buttonLabel}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export default CourseCard;