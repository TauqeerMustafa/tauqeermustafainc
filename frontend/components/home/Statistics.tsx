"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";

const statistics = [
  {
    value: 42,
    suffix: "+",
    label: "Enterprise initiatives delivered",
  },
  {
    value: 98,
    suffix: "%",
    label: "Client satisfaction benchmark",
  },
  {
    value: 15,
    suffix: "+",
    label: "Industries supported",
  },
  {
    value: 24,
    suffix: "/7",
    label: "Operational mindset",
  },
];

function AnimatedNumber({
  value,
  suffix,
  start,
}: {
  value: number;
  suffix: string;
  start: boolean;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`);

  useEffect(() => {
    if (!start) {
      return;
    }

    const controls = animate(count, value, {
      duration: 1.6,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [count, start, value]);

  return <motion.span>{rounded}</motion.span>;
}

export default function Statistics() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  return (
    <section
      ref={ref}
      className="bg-slate-900 px-6 py-20"
      aria-labelledby="statistics-title"
    >
      <div className="mx-auto max-w-7xl">
        <h2 id="statistics-title" className="sr-only">
          Company statistics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((statistic) => (
            <div
              key={statistic.label}
              className="rounded-lg border border-slate-800 bg-slate-950 p-7"
            >
              <p className="text-4xl font-extrabold text-teal-300 md:text-5xl">
                <AnimatedNumber
                  value={statistic.value}
                  suffix={statistic.suffix}
                  start={inView}
                />
              </p>
              <p className="mt-4 text-sm font-medium leading-6 text-slate-300">
                {statistic.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
