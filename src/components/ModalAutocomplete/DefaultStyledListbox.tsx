/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { autocompleteClasses, styled } from '@mui/material';
import { alpha, unstable_memoTheme } from '@mui/system';
import { Listbox } from './Listbox';

const memoTheme = unstable_memoTheme;

export const DefaultStyledListbox = styled(Listbox, {
  name: 'MuiAutocomplete',
  slot: 'Listbox',
})(
  memoTheme(({ theme }) => ({
    listStyle: 'none',
    margin: 0,
    padding: '8px 0',
    maxHeight: '40vh',
    overflow: 'auto',
    position: 'relative',
    [`& .${autocompleteClasses.option}`]: {
      minHeight: 48,
      display: 'flex',
      overflow: 'hidden',
      justifyContent: 'flex-start',
      alignItems: 'center',
      cursor: 'pointer',
      paddingTop: 6,
      boxSizing: 'border-box',
      outline: '0',
      WebkitTapHighlightColor: 'transparent',
      paddingBottom: 6,
      paddingLeft: 16,
      paddingRight: 16,
      [theme.breakpoints.up('sm')]: {
        minHeight: 'auto',
      },
      [`&.${autocompleteClasses.focused}`]: {
        backgroundColor: (theme.vars || theme).palette.action.hover,
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: 'transparent',
        },
      },
      '&[aria-disabled="true"]': {
        opacity: (theme.vars || theme).palette.action.disabledOpacity,
        pointerEvents: 'none',
      },
      [`&.${autocompleteClasses.focusVisible}`]: {
        backgroundColor: (theme.vars || theme).palette.action.focus,
      },
      '&[aria-selected="true"]': {
        backgroundColor: theme.vars
          ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.selectedOpacity})`
          : alpha(
              theme.palette.primary.main,
              theme.palette.action.selectedOpacity
            ),
        [`&.${autocompleteClasses.focused}`]: {
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + ${theme.vars.palette.action.hoverOpacity}))`
            : alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity +
                  theme.palette.action.hoverOpacity
              ),
          // Reset on touch devices, it doesn't add specificity
          '@media (hover: none)': {
            backgroundColor: (theme.vars || theme).palette.action.selected,
          },
        },
        [`&.${autocompleteClasses.focusVisible}`]: {
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + ${theme.vars.palette.action.focusOpacity}))`
            : alpha(
                theme.palette.primary.main,
                theme.palette.action.selectedOpacity +
                  theme.palette.action.focusOpacity
              ),
        },
      },
    },
  }))
);
