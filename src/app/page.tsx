'use client'
import { motion, animate } from "framer-motion"
import { LazyMotion, domAnimation, m } from "framer-motion"
import { useState } from "react";


export default function Home() {

  const [box, setBox] = useState(true)

  return (
    <>
      <div className="min-w-full min-h-[100vh] flex justify-center items-center flex-col">

        <motion.div
          initial={{ opacity: 0, x: -1000, scale: 1.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -1000, scale: 1.9 }}
          transition={{ delay: 0.25 }}

          className="w-[950px] bg-[#2C3036] min-h-[50px] border border-[#3d444d] rounded-md mb-3 flex items-center px-2">


          <motion.button
            whileTap={{
              scale: 0.8,
              rotate: -1,
              borderRadius: "5%"
            }}
            className="px-7 py-1.5 bg-slate-500 rounded-md"
            onClick={() => setBox((prev) => !prev)}>click</motion.button>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -100, scale: 1.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ delay: 0.25 }}
          className="w-[950px] bg-[#2C3036] min-h-[430px] border border-[#3d444d] rounded-md">

          <LazyMotion features={domAnimation}         >
            {box ? <>
              <div className="p-3">
                <m.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.25
                  }}

                  className='w-[200px] h-[200px] bg-[#222125]' />
              </div>
            </> : ""}
          </LazyMotion>

        </motion.div>

      </div>
    </>
  );
}
