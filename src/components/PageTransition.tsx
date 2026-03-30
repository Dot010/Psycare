"use client";

import { motion, AnimatePresence } from "framer-motion";


const PageTransition = ({children }: { children: React.ReactNode }) => {
    return (
      <AnimatePresence mode="wait">
            <motion.div
          key={"pathname"}   
          initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{
              duration: 0.8, ease: "easeInOut"}}>
            {children}
            </motion.div>
        </AnimatePresence>
  )
}

export default PageTransition