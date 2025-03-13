import React from "react";
import { Typography, Button } from "@material-tailwind/react";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/solid";
import Link from "next/link";  // Use Next.js Link

interface NavItemProps {
  children: React.ReactNode;
  to?: string;  // Using `to` instead of `href`
}

function NavItem({ children, to }: NavItemProps) {
  return (
    <li>
      <Link href={to || "#"} passHref>
        {/* Remove the <a> tag and directly pass the children to <Link> */}
        {children}
      </Link>
    </li>
  );
}

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [isScrolling, setIsScrolling] = React.useState(false);

  const handleOpen = () => setOpen((cur) => !cur);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpen(false)
    );
  }, []);

  React.useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 0) {
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full border-0 ${
        isScrolling ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between p-4">
        <Typography variant="h6" color={isScrolling ? "blue-gray" : "white"}>
          Material Tailwind
        </Typography>
        <ul
          className={`ml-10 hidden items-center gap-6 lg:flex ${
            isScrolling ? "text-gray-900" : "text-white"
          }`}
        >
          <NavItem to="/">Home</NavItem>  {/* Use Next.js Link for routing */}
          <NavItem to="/about">About Us</NavItem>
          <NavItem to="/contact">Contact Us</NavItem>
          <NavItem to="https://www.material-tailwind.com/docs/react/installation">
            Docs
          </NavItem>
        </ul>
        <div className="hidden gap-2 lg:flex">
          <button
            className={`p-2 ${isScrolling ? "text-gray-900" : "text-white"} hover:text-gray-700`}
          >
            <i className="fa-brands fa-twitter text-base" />
          </button>
          <button
            className={`p-2 ${isScrolling ? "text-gray-900" : "text-white"} hover:text-gray-700`}
          >
            <i className="fa-brands fa-facebook text-base" />
          </button>
          <button
            className={`p-2 ${isScrolling ? "text-gray-900" : "text-white"} hover:text-gray-700`}
          >
            <i className="fa-brands fa-instagram text-base" />
          </button>
          <a href="https://www.material-tailwind.com/blocks" target="_blank">
            <Button color={isScrolling ? "gray" : "white"} size="sm">
              Blocks
            </Button>
          </a>
        </div>
        <button
          className={`ml-auto inline-block p-2 lg:hidden ${
            isScrolling ? "text-gray-900" : "text-white"
          }`}
          onClick={handleOpen}
        >
          {open ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>
      {open && (
        <div className="container mx-auto mt-4 rounded-lg bg-white px-6 py-5 lg:hidden">
          <ul className="flex flex-col gap-4 text-blue-gray-900">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/about">About Us</NavItem>
            <NavItem to="/contact">Contact Us</NavItem>
            <NavItem to="https://www.material-tailwind.com/docs/react/installation">
              Docs
            </NavItem>
            <NavItem to="https://www.material-tailwind.com/blocks">
              Blocks
            </NavItem>
          </ul>
          <div className="mt-4 flex gap-2">
            <button className="p-2 text-gray-900 hover:text-gray-700">
              <i className="fa-brands fa-twitter text-base" />
            </button>
            <button className="p-2 text-gray-900 hover:text-gray-700">
              <i className="fa-brands fa-facebook text-base" />
            </button>
            <button className="p-2 text-gray-900 hover:text-gray-700">
              <i className="fa-brands fa-instagram text-base" />
            </button>
            <a href="https://www.material-tailwind.com/blocks" target="_blank">
              <Button color="gray" size="sm" className="ml-auto">
                Blocks
              </Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
