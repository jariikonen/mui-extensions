/* eslint-disable react/jsx-props-no-spreading */
import { useEffect, useState } from 'react';
import { Dialog } from '@mui/material';
import type { DialogProps } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

interface OnScreenKeyboardResponsiveDialogSlotProps {
  paper?: {
    sx?: SxProps<Theme>;
  };
}

const OnScreenKeyboardResponsiveDialog = ({
  open,
  onClose,
  children = undefined,
  slotProps,
  ...other
}: DialogProps) => {
  const [viewportHeight] = useState(window.innerHeight);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const modifiedSlotProps: OnScreenKeyboardResponsiveDialogSlotProps = {
    ...slotProps,
    paper: {
      sx: {
        position: 'absolute',
        bottom: keyboardOffset ? `${keyboardOffset + 20}px` : '50%',
        transform: keyboardOffset ? 'translateY(0)' : 'translateY(50%)',
        transition: 'bottom 0.3s ease, transform 0.3s ease',
        margin: 0,
        ...(slotProps as OnScreenKeyboardResponsiveDialogSlotProps)?.paper?.sx,
      },
    },
  };

  useEffect(() => {
    const handleViewportChange = () => {
      if (!window.visualViewport) {
        return;
      }

      const newHeight = window.visualViewport.height;
      const offset = viewportHeight - newHeight;

      // if height reduces significantly, assume keyboard is open
      if (offset > 100) {
        setKeyboardOffset(offset);
      } else {
        setKeyboardOffset(0);
      }
    };

    window.visualViewport?.addEventListener('resize', handleViewportChange);
    return () => {
      window.visualViewport?.removeEventListener(
        'resize',
        handleViewportChange,
      );
    };
  }, [viewportHeight]);

  return (
    <Dialog
      {...other}
      open={open}
      onClose={onClose}
      slotProps={modifiedSlotProps}
      closeAfterTransition={false}
    >
      {children}
    </Dialog>
  );
};

export default OnScreenKeyboardResponsiveDialog;
