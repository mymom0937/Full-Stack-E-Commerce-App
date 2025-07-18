'use client';

import React, { useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimationWrapper, { 
  fadeIn, 
  slideUp, 
  slideInLeft, 
  slideInRight, 
  scaleIn, 
  popIn 
} from '@/components/animations/AnimationWrapper';
import PageTransition from '@/components/animations/PageTransition';
import StaggeredList from '@/components/animations/StaggeredList';
import AnimatedButton from '@/components/animations/AnimatedButton';
import AnimatedIcon from '@/components/animations/AnimatedIcon';
import AnimatedText from '@/components/animations/AnimatedText';
import { assets } from '@/assets/assets';
import { motion, useInView } from 'framer-motion';
import { useAnimationInView, useStaggeredAnimation } from '@/hooks/useAnimation';

const ExampleSection = ({ title, children }) => (
  <div className="mb-16">
    <h2 className="text-2xl font-medium text-text-primary mb-6">{title}</h2>
    <div className="bg-card-bg p-6 rounded-lg border border-border-color">
      {children}
    </div>
  </div>
);

const AnimationExamples = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  // Example items for StaggeredList
  const items = [
    { id: 1, title: 'Item 1' },
    { id: 2, title: 'Item 2' },
    { id: 3, title: 'Item 3' },
    { id: 4, title: 'Item 4' },
    { id: 5, title: 'Item 5' },
  ];

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="px-6 md:px-16 lg:px-32 py-14">
          <AnimationWrapper>
            <h1 className="text-3xl font-medium text-text-primary mb-2">Animation Examples</h1>
            <p className="text-text-secondary mb-10">
              This page showcases all the animation components available in the EzCart application.
            </p>
          </AnimationWrapper>

          <ExampleSection title="AnimationWrapper Variants">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimationWrapper variants={fadeIn}>
                <div className="p-6 bg-background rounded-lg border border-border-color">
                  <h3 className="font-medium mb-2">fadeIn</h3>
                  <p className="text-sm text-text-secondary">
                    Simple fade-in animation for subtle element appearance.
                  </p>
                </div>
              </AnimationWrapper>
              
              <AnimationWrapper variants={slideUp} delay={0.1}>
                <div className="p-6 bg-background rounded-lg border border-border-color">
                  <h3 className="font-medium mb-2">slideUp</h3>
                  <p className="text-sm text-text-secondary">
                    Slide up animation with spring physics.
                  </p>
                </div>
              </AnimationWrapper>
              
              <AnimationWrapper variants={slideInLeft} delay={0.2}>
                <div className="p-6 bg-background rounded-lg border border-border-color">
                  <h3 className="font-medium mb-2">slideInLeft</h3>
                  <p className="text-sm text-text-secondary">
                    Slide in from left animation.
                  </p>
                </div>
              </AnimationWrapper>
              
              <AnimationWrapper variants={slideInRight} delay={0.3}>
                <div className="p-6 bg-background rounded-lg border border-border-color">
                  <h3 className="font-medium mb-2">slideInRight</h3>
                  <p className="text-sm text-text-secondary">
                    Slide in from right animation.
                  </p>
                </div>
              </AnimationWrapper>
              
              <AnimationWrapper variants={scaleIn} delay={0.4}>
                <div className="p-6 bg-background rounded-lg border border-border-color">
                  <h3 className="font-medium mb-2">scaleIn</h3>
                  <p className="text-sm text-text-secondary">
                    Scale in animation with spring physics.
                  </p>
                </div>
              </AnimationWrapper>
              
              <AnimationWrapper variants={popIn} delay={0.5}>
                <div className="p-6 bg-background rounded-lg border border-border-color">
                  <h3 className="font-medium mb-2">popIn</h3>
                  <p className="text-sm text-text-secondary">
                    Pop in animation with spring physics.
                  </p>
                </div>
              </AnimationWrapper>
            </div>
          </ExampleSection>

          <ExampleSection title="StaggeredList">
            <StaggeredList className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {items.map(item => (
                <div key={item.id} className="p-4 bg-background rounded-lg border border-border-color">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-text-secondary">Staggered item</p>
                </div>
              ))}
            </StaggeredList>
          </ExampleSection>

          <ExampleSection title="AnimatedButton Variants">
            <div className="flex flex-wrap gap-4">
              <AnimatedButton variant="primary">
                Primary Button
              </AnimatedButton>
              
              <AnimatedButton variant="secondary">
                Secondary Button
              </AnimatedButton>
              
              <AnimatedButton variant="outline">
                Outline Button
              </AnimatedButton>
              
              <AnimatedButton variant="text">
                Text Button
              </AnimatedButton>
              
              <AnimatedButton variant="primary" size="sm">
                Small Button
              </AnimatedButton>
              
              <AnimatedButton variant="primary" size="lg">
                Large Button
              </AnimatedButton>
              
              <AnimatedButton variant="primary" disabled>
                Disabled Button
              </AnimatedButton>
              
              <AnimatedButton 
                variant="primary"
                animationProps={{
                  whileHover: { scale: 1.1, rotate: 5 },
                  whileTap: { scale: 0.9 }
                }}
              >
                Custom Animation
              </AnimatedButton>
            </div>
          </ExampleSection>

          <ExampleSection title="AnimatedIcon">
            <div className="flex flex-wrap gap-8">
              <AnimatedIcon 
                src={assets.cart_icon} 
                alt="Cart Icon" 
                size={32} 
              />
              
              <AnimatedIcon 
                src={assets.heart_icon} 
                alt="Heart Icon" 
                size={32} 
                animationProps={{
                  whileHover: { scale: 1.2, rotate: 15 }
                }}
              />
              
              <AnimatedIcon 
                src={assets.search_icon} 
                alt="Search Icon" 
                size={32} 
                animationProps={{
                  whileHover: { scale: 1.2 },
                  whileTap: { scale: 0.8, rotate: -10 }
                }}
              />
              
              <AnimatedIcon 
                src={assets.user_icon} 
                alt="User Icon" 
                size={32} 
              />
            </div>
          </ExampleSection>

          <ExampleSection title="AnimatedText">
            <div className="space-y-8">
              <div>
                <h3 className="font-medium mb-2">Reveal Animation</h3>
                <AnimatedText 
                  text="This text animates with a reveal effect" 
                  type="reveal"
                  className="text-lg"
                />
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Typing Animation</h3>
                <AnimatedText 
                  text="This text animates like typing" 
                  type="typing"
                  className="text-lg"
                  animationProps={{ duration: 2 }}
                />
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Highlight Animation</h3>
                <AnimatedText 
                  text="This text gets highlighted" 
                  type="highlight"
                  className="text-lg"
                />
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Wave Animation</h3>
                <AnimatedText 
                  text="This text animates letter by letter" 
                  type="wave"
                  className="text-lg"
                  animationProps={{ staggerDelay: 0.05 }}
                />
              </div>
            </div>
          </ExampleSection>

          <ExampleSection title="Scroll-Triggered Animations">
            <div ref={ref} className="min-h-[200px] flex items-center justify-center">
              <motion.div
                className="p-8 bg-background rounded-lg border border-border-color text-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="font-medium mb-2">Scroll-Triggered Animation</h3>
                <p className="text-text-secondary">
                  This element animates when it enters the viewport.
                </p>
              </motion.div>
            </div>
          </ExampleSection>
        </div>
      </PageTransition>
      <Footer />
    </>
  );
};

export default AnimationExamples; 