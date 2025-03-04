"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Image from "next/image";
import AuthBtn from "./authBtn";
import { AppleIcon, GoogleIcon } from "./icons";

gsap.registerPlugin(useGSAP);

export default function LandingCarousel() {
  const container = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    let xPos = 0;
    gsap.timeline()
      .set(".img", {
        // apply transform rotations to each image
        rotateY: (i) => i * -36,
        transformOrigin: "50% 50% 500px",
        z: -500,
        //backgroundImage:(i)=> 'url(/images/landing-'+(i + 1)+'.png)',
        backgroundSize:'cover',
        repeat:-1,
        backfaceVisibility:'hidden'
      })
      .from(".img", {
        duration: 2,
        y: 200,
        opacity: 0,
        stagger: 0.1,
        ease: "expo",
      })
      .add(()=>{
        //gsap.to('.img', { opacity: 0.5, ease:'power3'})
        // if (image.current) {
        //   image.current.addEventListener('mouseenter', (e)=>{
        //     let current = e.currentTarget;
        //     //gsap.to('.img', {opacity:(i,t)=>(t==current)? 1:0.5, ease:'power3'})
        //   })
        //   image.current.addEventListener('mouseleave', (e)=>{
        //     gsap.to('.img', {opacity:1, ease:'power2.inOut'})
        //   })
        // }
      }, "-=0.5");
    // })

    if (container.current) {

      // container.current.addEventListener('mousedown', dragStart);
      // container.current.addEventListener('touchstart', dragStart);
      // container.current.addEventListener('mouseup', dragEnd);
      // container.current.addEventListener('touchend', dragEnd);

      // function dragStart(e: MouseEvent | TouchEvent): void { 
      //   console.log("dragStart")
      //   if (e instanceof TouchEvent) {
      //     const touch = e.touches[0];
      //     e = { ...e, clientX: touch.clientX };
      //   }
      //   xPos = Math.round((e as MouseEvent).clientX);
      //   gsap.set('.ring', {cursor:'grabbing'})
      //   container.current?.addEventListener('mousemove', drag);
      //   container.current?.addEventListener('touchmove', drag);
      // }

      // function drag(e: MouseEvent | TouchEvent){
      //   if (e instanceof TouchEvent) {
      //     const touch = e.touches[0];
      //     e = { ...e, clientX: touch.clientX };
      //   }
      //   gsap.to('.ring', {
      //     rotationY: '-=' +( (Math.round((e as MouseEvent).clientX)-xPos)%360 ),
      //     onUpdate:()=>{ gsap.set('.img', { backgroundPosition:(i: number)=>getBgPos(i) }) }
      //   });
      //   xPos = Math.round((e as MouseEvent).clientX);
      //   console.log({xPos})
      // }

      // function dragEnd(e: MouseEvent | TouchEvent): void {
      //   container.current?.removeEventListener('mousemove', drag);
      //   container.current?.removeEventListener('touchmove', drag);
      //   gsap.set('.ring', {cursor:'grab'});
      // }

      // interface DragEvent extends MouseEvent {
      //   touches?: TouchList;
      //   clientX: number;
      // }

      interface GetBgPos {
        (i: number): string;
      }

      const getBgPos: GetBgPos = (i) => { //returns the background-position string to create parallax movement in each image
        return (100 - gsap.utils.wrap(0, 360, gsap.getProperty('.ring', 'rotationY') as number - 180 - i * 36) / 360 * 500) + 'px 0px';
      };

      const move = (distance: number) => {
        gsap.to('.ring', {
          rotationY: '-=' +((Math.round(distance)-xPos)%360 ),
          onUpdate:()=>{ gsap.set('.img', { backgroundPosition:(i: number)=>getBgPos(i) }) }
        });

      }

      const interval = setInterval(() => move(40), 3000)

      return () => clearInterval(interval)


    }
    
  }); 

  return (
    <div className="home-carousel overflow-clip overflow-x-hidden">
      <div ref={container} className="stage overflow-hidden  md:scale-150 lg:scale-150 2xl:scale-[2] ">
        <div className="container bg-black">
          <div className="absolute top-0 z-10 flex justify-center w-full mb-10 scale-50">
            <Image src={"/logo.png"} alt="logo" width={140} height={36} />
          </div>

          <div className="ring -z-20">
            <Image className="img" src="/images/landing-1.png" width={300} height={400} alt="" />
            <Image className="img" src="/images/landing-2.png" width={300} height={400} alt="" />
            <Image className="img" src="/images/landing-3.png" width={300} height={400} alt="" />
            <Image className="img" src="/images/landing-4.png" width={300} height={400} alt="" />
            <Image className="img" src="/images/landing-5.png" width={300} height={400} alt="" />
            <Image className="img" src="/images/landing-6.png" width={300} height={400} alt="" />
            <Image className="img" src="/images/landing-7.png" width={300} height={400} alt=""/>
            <Image className="img" src="/images/landing-8.png" width={300} height={400} alt=""/>
            <Image className="img" src="/images/landing-9.png" width={300} height={400} alt=""/> 
            <Image className="img" src="/images/landing-10.png" width={300} height={400}  alt=""/>
          </div>

          <div className={`absolute flex justify-center w-full bottom-20 scale-50 z-10`}>
            <div style={{zIndex: 1000}} className="absolute flex z-50 flex-col justify-center items-center border-primary-10 border-x-[1px] border-b-[1px] w-[350px] rounded-xl gap-4 py-12">
              <AuthBtn icon={<GoogleIcon color="#C1C1C1" width={21} height={20} />} provider="google">
                Continue with Google
              </AuthBtn>

              <AuthBtn icon={<AppleIcon color="#C1C1C1" width={21} height={20} />} provider="apple">
                Continue with Apple
              </AuthBtn>
            </div> 
          </div>
        </div>
      </div>
    </div>
  );
}
