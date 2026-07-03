"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "motion/react";
import { cn } from "@/src/lib/utils";

export const ContainerScroll = ({
    titleComponent,
    children,
}: {
    titleComponent: string | React.ReactNode;
    children: React.ReactNode;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
    });
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    const scaleDimensions = () => {
        return isMobile ? [0.7, 0.9] : [1.05, 1];
    };

    const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
    // Fix WebKit mobile video black screen bug by disabling 3D rotation on mobile
    const rotateMobileSafe = isMobile ? 0 : rotate;
    const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
    const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);


    return (
        <div
            className={cn(
                "h-[45rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20",
                "container-scroll" // just an example to use cn
            )}
            ref={containerRef}
        >
            <div
                className="py-10 md:py-40 w-full relative"
                style={{
                    perspective: "1000px",
                    transformStyle: "preserve-3d",
                }}
            >
                <Header translate={translate} titleComponent={titleComponent} />
                <Card rotate={rotate} translate={translate} scale={scale} isMobile={isMobile}>
                    {children}
                </Card>
            </div>
        </div>
    );
};

export const Header = ({ translate, titleComponent }: { translate: MotionValue<number>; titleComponent: string | React.ReactNode }) => {
    return (
        <motion.div
            style={{
                translateY: translate,
            }}
            className={cn("max-w-5xl mx-auto text-center relative", "div")}
        >
            {titleComponent}
        </motion.div>
    );
};

export const Card = ({
    rotate,
    scale,
    translate,
    isMobile,
    children,
}: {
    rotate: MotionValue<number> | number;
    scale: MotionValue<number>;
    translate: MotionValue<number>;
    isMobile?: boolean;
    children: React.ReactNode;
}) => {
    return (
        <motion.div
            style={{
                ...(isMobile ? {} : { rotateX: rotate, willChange: "transform" }),
                scale,
                translateY: translate,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
            className={cn(
                "max-w-5xl -mt-12 mx-auto h-[18rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl relative gpu-accelerated",
                isMobile ? "transform-none" : ""
            )}
        >
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black md:rounded-2xl md:p-4 ">
                {children}
            </div>
        </motion.div>
    );
};