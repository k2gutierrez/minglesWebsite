import React, { useState, useEffect } from 'react';

// --- Types (for TypeScript) ---
// We define the props for our Modal component
export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

// --- Modal Component ---
// This is the reusable modal component
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // If the modal is not open, return null to render nothing
  if (!isOpen) {
    return null;
  }

  // This function handles the backdrop click
  // It calls onClose, but stops the event from bubbling
  // up to the modal content's wrapper.
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // We check if the click is on the backdrop itself, not on the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Main modal overlay
    // 'fixed': Positions relative to the viewport
    // 'inset-0': Covers the entire screen (top/right/bottom/left = 0)
    // 'z-50': Sits on top of other content
    // 'flex items-center justify-center': Centers the modal content
    // 'bg-black/60': Semi-transparent black background
    // 'backdrop-blur-sm': Adds a blur effect to the content behind
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Modal Content Container */}
      {/* 'relative': For positioning the close button
        'bg-white': White background
        'rounded-lg': Rounded corners
        'shadow-2xl': Strong drop shadow
        'p-6': Padding inside the modal
        
        Responsiveness:
        'w-11/12': Mobile-first (91% width)
        'md:w-3/4': Medium screens (75% width)
        'lg:w-1/2': Large screens (50% width)
        'max-w-2xl': Sets a maximum width for very large screens
      */}
      <div
        className="relative w-11/12 max-w-2xl rounded-lg bg-white p-6 shadow-2xl md:w-3/4 lg:w-1/2"
        // This stops a click inside the modal from bubbling up
        // to the backdrop and closing the modal.
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-800"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Title (optional) */}
        {title && (
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">{title}</h2>
        )}

        {/* Modal Body (children) */}
        <div className="text-gray-700">{children}</div>

        {/* Modal Footer (example) */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onClose} // You would likely have a different action here
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};