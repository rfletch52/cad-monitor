import React, { useEffect } from 'react';
import { useSwipeGestures } from '../hooks/useSwipeGestures';

interface SwipeableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  children: React.ReactNode;
  showNavigation?: boolean;
}

export const SwipeableModal: React.FC<SwipeableModalProps> = ({
  isOpen,
  onClose,
  onNext,
  onPrevious,
  children,
  showNavigation = false
}) => {
  const modalContentRef = React.useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = React.useState(false);

  const { swipeHandlers } = useSwipeGestures({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    onSwipeDown: () => {
      // Only close on swipe down if not scrolling content
      if (!isScrolling) {
        onClose();
      }
    },
    threshold: 80,
    preventScroll: true
  });

  // Track scrolling state to prevent accidental closes
  const handleScroll = () => {
    setIsScrolling(true);
    // Clear scrolling state after a short delay
    setTimeout(() => setIsScrolling(false), 150);
  };

  // Handle backdrop clicks but ignore clicks inside the modal content
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Prevent modal content clicks from closing
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Navigation hints */}
        {showNavigation && (
          <>
            {onPrevious && (
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 text-sm hidden sm:block">
                ← Previous
              </div>
            )}
            {onNext && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 text-sm hidden sm:block">
                Next →
              </div>
            )}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-opacity-50 text-sm">
              ↓ Swipe down to close
            </div>
          </>
        )}

        {/* Modal content */}
        <div 
          ref={modalContentRef}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={handleModalContentClick}
          onScroll={handleScroll}
          {...swipeHandlers}
        >
          {children}
        </div>

        {/* Mobile swipe indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 text-white text-opacity-50 text-xs sm:hidden">
          {onPrevious && <span>← Prev</span>}
          <span>↓ Close</span>
          {onNext && <span>Next →</span>}
        </div>
      </div>
    </div>
  );
};