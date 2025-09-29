// PageTransition.jsx
import { motion } from 'framer-motion';

const PageTransition = ({ children, direction = 'left' }) => {
    const variants = {
        left: {
            initial: { opacity: 0, x: -100 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -100 }
        },
        right: {
            initial: { opacity: 0, x: 100 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 100 }
        }
    };

    return (
        <motion.div
            initial={variants[direction].initial}
            animate={variants[direction].animate}
            exit={variants[direction].exit}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;