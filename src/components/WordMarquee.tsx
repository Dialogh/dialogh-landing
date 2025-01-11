import { cn } from "../lib/utils";
import Marquee from "./ui/marquee";

const reviews = [
  {
    name: "Developer",
  },
  {
    name: "Designer",
  },
  {
    name: "AI Enthusiast",
  },
  {
    name: "Tech Leader",
  },
  {
    name: "Tech Lover",
  },
  {
    name: "Product Manager",
  },
  {
    name: "Data Scientist",
  },
  {
    name: "DevOps Engineer",
  },
  {
    name: "Cybersecurity Expert",
  },
  {
    name: "Content Creator",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);

const Words = ({ name }: { name: string }) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <div className="flex flex-col">
          <figcaption className="sm:text-4xl text-2xl font-pp font-medium text-white/50">
            {name}
          </figcaption>
        </div>
      </div>
    </figure>
  );
};

export default function MarqueeDemo() {
  return (
    <div className="relative flex py-12 w-full flex-col items-center justify-center overflow-hidden rounded-lg  ">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <Words key={review.username} {...review} />
        ))}
      </Marquee>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black dark:from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black dark:from-background"></div>
    </div>
  );
}
