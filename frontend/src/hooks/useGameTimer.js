
import { useCallback, useEffect, useRef, useState } from "react";

export default function useGameTimer(initialRunning = false) {
  const [elapsed, setElapsed] = useState(0); 
  const [isRunning, setIsRunning] = useState(initialRunning); 

  const offsetRef = useRef(0); 
  const startRef = useRef(null); 
  const frameRef = useRef(null); 
  const lastSecondRef = useRef(0); 

  /** tick：renew*/
  const tick = useCallback(() => {
    if (!startRef.current) return;

    const now = Date.now();
    const nextElapsed = offsetRef.current + (now - startRef.current);
    const nextSecond = Math.floor(nextElapsed / 1000);

    // renewal only on second change
    if (nextSecond !== lastSecondRef.current) {
      lastSecondRef.current = nextSecond;
      setElapsed(nextElapsed);
    }

    frameRef.current = requestAnimationFrame(tick);
  }, []);

  /** Listen for isRunning state changes*/
  useEffect(() => {
    if (isRunning) {
      // if no start time, set it
      if (!startRef.current) {
        startRef.current = Date.now();
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isRunning, tick]);

  /** start new time */
  const start = useCallback(() => {
    offsetRef.current = 0;
    startRef.current = Date.now();
    lastSecondRef.current = 0;
    setElapsed(0);
    setIsRunning(true);
  }, []);

  /** resume time */
  const resume = useCallback(() => {
    // recover from pause，reset start time
    startRef.current = Date.now();
    setIsRunning(true);
  }, []);

  /** pause*/
  const pause = useCallback(() => {
    if (startRef.current) {
      offsetRef.current += Date.now() - startRef.current; // add to offset
      startRef.current = null;
    }
    setIsRunning(false);
  }, []);

  /** stop（end game） */
  const stop = useCallback(() => {
    if (startRef.current) {
      offsetRef.current += Date.now() - startRef.current;
      startRef.current = null;
    }
    setIsRunning(false);
  }, []);

  /** reset to start */
  const reset = useCallback(() => {
    offsetRef.current = 0;
    startRef.current = null;
    lastSecondRef.current = 0;
    setElapsed(0);
    setIsRunning(false);
  }, []);

  /** restart（new game） */
  const restart = useCallback(() => {
    reset();
    setTimeout(() => start(), 40);
  }, [reset, start]);

  return { elapsed, isRunning, start, resume, pause, stop, reset, restart };
}
