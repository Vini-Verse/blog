import { GitBranch, Globe } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";

interface Project {
  name: string;
  description: string;
  imageUrl: string;
  githubUrl: string;
  url: string;
  technologies: ReactNode;
}

const projects: Project[] = [
 /* {
    name: "css2wind",
    description:
      "Learn TailwindCSS by playing a minigame: there are eight CSS properties that you must translate to the equivalent TailwindCSS utility. Bet you can't get 8/8.",
    url: "https://css2wind.com",
    imageUrl: "/projects/css2wind.png",
    githubUrl: "https://github.com/LukeberryPi/css2wind",
    technologies: (
      <div className="flex items-center gap-x-3">
        <span className="rounded-full bg-[#007ACC] px-2.5 py-0.5 text-sm text-zinc-100 dark:bg-inherit dark:text-zinc-200 ring-1 dark:ring-zinc-500 ring-zinc-600">
          TypeScript
        </span>
        <span className="rounded-full bg-[#38BDF9] px-2.5 py-0.5 text-sm text-zinc-950 dark:bg-inherit dark:text-zinc-200 ring-1 dark:ring-zinc-500 ring-zinc-600">
          TailwindCSS
        </span>
        <span className="rounded-full bg-black px-2.5 py-0.5 text-sm text-zinc-100 dark:bg-inherit dark:text-zinc-200 ring-1 dark:ring-zinc-500 ring-zinc-600">
          Next.js
        </span>
      </div>
    ),
  },
  {
    name: "King's Cross Cinema Schedule",
    description:
      "A simpler way to visualize the movies in the Everyman in the Canal 2025 in London. I watched Mean Girls and it was amazing.",
    url: "https://kings-cross-cinema-schedule-2025.vercel.app/",
    imageUrl: "/projects/cinema-schedule.png",
    githubUrl: "https://github.com/LukeberryPi/kings-cross-cinema-website",
    technologies: (
      <div className="flex items-center gap-x-3">
        <span className="rounded-full bg-[#FF5D01] px-2.5 py-0.5 text-sm text-zinc-100 dark:bg-inherit dark:text-inherit ring-1 dark:ring-zinc-500 ring-zinc-600">
          Astro
        </span>
        <span className="rounded-full bg-[#38BDF9] px-2.5 py-0.5 text-sm text-zinc-950 dark:bg-inherit dark:text-inherit ring-1 dark:ring-zinc-500 ring-zinc-600">
          Tailwind
        </span>
        <span className="rounded-full bg-black px-2.5 py-0.5 text-sm text-zinc-100 dark:bg-none ring-1 dark:ring-zinc-500 ring-zinc-600">
          Vercel
        </span>
      </div>
    ),
  },
  {
    name: "phived",
    description:
      "Stop procrastinating by dealing with five tasks at a time. If you want to add more tasks you need to resolve a previous one. Surprisingly effective.",
    url: "https://phived.com",
    imageUrl: "/projects/phived.png",
    githubUrl: "https://github.com/LukeberryPi/phived",
    technologies: (
      <div className="flex items-center gap-x-3">
        <span className="rounded-full bg-[#00D8FE] px-2.5 py-0.5 text-sm text-zinc-950 dark:bg-inherit dark:text-inherit ring-1 dark:ring-zinc-500 ring-zinc-600">
          React
        </span>
        <span className="rounded-full bg-[#38BDF9] px-2.5 py-0.5 text-sm text-zinc-950 dark:bg-inherit dark:text-inherit ring-1 dark:ring-zinc-500 ring-zinc-600">
          TailwindCSS
        </span>
        <span className="rounded-full bg-gradient-to-r from-[#926AFE] to-[#49C7FF] px-2.5 py-0.5 text-sm text-zinc-100 dark:bg-none ring-1 dark:ring-zinc-500 ring-zinc-600">
          Vite
        </span>
      </div>
    ),
  },*/
];

function ProjectCard({
  name,
  description,
  imageUrl,
  githubUrl,
  url,
  technologies,
}: Project) {
  return (
    <div className="flex-col divide-y divide-zinc-400 overflow-hidden rounded ring-1 dark:zinc-500 dark:ring-zinc-500 ring-zinc-600">
      <div className="flex items-center justify-between gap-4 p-4 max-sm:flex-col">
        <h2 className="text-xl">{name}</h2>
        {technologies}
      </div>
      <div>
        <p className="p-4">{description}</p>
      </div>
      <Image
        src={imageUrl}
        width={1200}
        height={630}
        alt="Logo for css2wind website"
      />
      <div className="flex w-full justify-between divide-x divide-zinc-400 dark:divide-zinc-500">
        <a
          href={url}
          target="_blank"
          className="flex grow items-center justify-center gap-2 py-4 transition-transform sm:hover:bg-zinc-100 sm:dark:hover:bg-zinc-800"
        >
          <Globe strokeWidth={1.4} className="size-5" /> Visit website
        </a>
        <a
          href={githubUrl}
          target="_blank"
          className="flex grow items-center justify-center gap-2 py-4 transition-transform sm:hover:bg-zinc-100 sm:dark:hover:bg-zinc-800"
        >
          <GitBranch strokeWidth={1.4} className="size-5" /> View code
        </a>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <>
      <h1 className="mb-16 mt-4 text-center text-5xl max-sm:text-4xl">
        Projects
      </h1>
      <div className="space-y-20">
        {projects.map((project) => (
          <ProjectCard key={project.url} {...project} />
        ))}
      </div>
    </>
  );
}
