"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";


gsap.registerPlugin(useGSAP);

export default function LandingCarousel() {


  const container = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    let xPos = 0;
    gsap.timeline()
      .set('.img',  { // apply transform rotations to each image
        rotateY: (i)=> i*-36,
        transformOrigin: '50% 50% 500px',
        z: -500,
        backgroundImage:(i)=> {
          console.log({i})
          return 'url(/images/landing-'+(i + 1)+'.png)'
        },
        backgroundSize:'cover',
        repeat:-1,
        backfaceVisibility:'hidden'
      })
      .from('.img', {
        duration:1.5,
        y: 200,
        opacity:0,
        stagger:0.1,
        ease:'expo'
      })
      .add(()=>{
        gsap.to('.img', { opacity: 0.5, ease:'power3'})
        // if (image.current) {
        //   image.current.addEventListener('mouseenter', (e)=>{
        //     let current = e.currentTarget;
        //     //gsap.to('.img', {opacity:(i,t)=>(t==current)? 1:0.5, ease:'power3'})
        //   })
        //   image.current.addEventListener('mouseleave', (e)=>{
        //     gsap.to('.img', {opacity:1, ease:'power2.inOut'})
        //   })
        // }
      }, '-=0.5')    
    // })

    if (container.current) {

      container.current.addEventListener('mousedown touchstart', dragStart);
      container.current.addEventListener('mouseup touchend', dragEnd);

      function dragStart(e) { 
        alert('dragStart')
        if (e.touches) e.clientX = e.touches[0].clientX; 

        xPos = Math.round(e.clientX);
        gsap.set('.ring', {cursor:'grabbing'})

        container.current?.addEventListener('mousemove touchmove', drag);
      }


      function drag(e){
        if (e.touches) e.clientX = e.touches[0].clientX;    

        gsap.to('.ring', {
          rotationY: '-=' +( (Math.round(e.clientX)-xPos)%360 ),
          //onUpdate:()=>{ gsap.set('.img', { backgroundPosition:(i)=>getBgPos(i) }) }
        });
        
        xPos = Math.round(e.clientX);
      }

      function dragEnd(e){
        container.current?.removeEventListener('mousemove touchmove', drag);
        gsap.set('.ring', {cursor:'grab'});
      }


    }

    
  }); 


  return (
    <div className="home-carousel overflow-clip overflow-x-hidden">
      <div ref={container} className="stage scale-125 md:scale-150 lg:scale-[1.75] 2xl:scale-[2.5] overflow-hidden">
        <div className="container">
          <div className="ring">
            <div ref={image} className="img"></div>
            <div ref={image} className="img"></div>
            <div ref={image} className="img"></div>
            <div ref={image} className="img"></div>
            <div ref={image} className="img"></div>
            <div ref={image} className="img"></div>
            <div ref={image} className="img"></div>
            <div ref={image} className="img"></div>
            <div ref={image} className="img"></div>
            <div ref={image} className="img"></div> 
          </div>
        </div>
      </div>
    </div>
  )
  
}
