import React, { useRef, useCallback } from 'react';

type ListboxProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>; // accept MUI’s internal ref
};

export const Listbox = ({
  ref: externalRef = null,
  ...props
}: ListboxProps) => {
  const listboxRef = useRef<HTMLUListElement>(null);
  const lastYRef = useRef(0);
  const velocityYRef = useRef(0);
  const lastTimeRef = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const y = e.touches[0].clientY;
    lastYRef.current = y;
    velocityYRef.current = 0;
    lastTimeRef.current = performance.now();
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const y = e.touches[0].clientY;
    const now = performance.now();
    const deltaY = y - lastYRef.current;
    const deltaTime = now - lastTimeRef.current;

    velocityYRef.current = deltaY / deltaTime;
    if (listboxRef.current) {
      listboxRef.current.scrollTop -= deltaY;
    }

    lastYRef.current = y;
    lastTimeRef.current = now;
  }, []);

  const handleTouchEnd = useCallback(() => {
    let scrollVelocity = velocityYRef.current * 1000; // convert to px/sec
    const friction = 0.95;

    const animate = () => {
      if (Math.abs(scrollVelocity) < 0.5) {
        return;
      }

      if (listboxRef.current) {
        listboxRef.current.scrollTop -= scrollVelocity * 0.016; // assuming 60fps
      }

      scrollVelocity *= friction;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const attachListeners = (node: HTMLUListElement | null) => {
    if (!node) return;

    node.addEventListener('touchstart', handleTouchStart, { passive: false });
    node.addEventListener('touchmove', handleTouchMove, { passive: false });
    node.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchmove', handleTouchMove);
      node.removeEventListener('touchend', handleTouchEnd);
    };
  };

  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  const setRef = (el: HTMLUListElement) => {
    // clean up previous
    if (cleanupRef.current) cleanupRef.current();

    if (el) {
      listboxRef.current = el;
      cleanupRef.current = attachListeners(el);
    }

    // forward the ref
    if (typeof externalRef === 'function') {
      externalRef(el);
    } else if (externalRef) {
      externalRef.current = el;
    }
  };

  return (
    <ul
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      ref={setRef}
      style={{
        touchAction: 'none',
        overflow: 'auto',
        maxHeight: '28.5vh',
        padding: 0,
      }}
    />
  );
};
