import { IconButton, InputAdornment, styled, TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClearIcon from '@mui/icons-material/Clear';
import React from 'react';

const AutocompleteClearIndicator = styled(IconButton, {
  name: 'MuiAutocomplete',
  slot: 'ClearIndicator',
})({
  marginRight: -2,
  padding: 4,
});

interface OwnerState {
  popupOpen: boolean;
}

const AutocompletePopupIndicator = styled(IconButton, {
  name: 'MuiAutocomplete',
  slot: 'PopupIndicator',
  overridesResolver: (
    props: { ownerState: OwnerState } & React.ComponentProps<typeof IconButton>,
    styles,
  ) => {
    const { ownerState } = props;

    return [
      styles.popupIndicator,
      ownerState.popupOpen && styles.popupIndicatorOpen,
    ];
  },
})(({ ownerState }: { ownerState: OwnerState }) => ({
  padding: 2,
  marginRight: -2,
  transition: 'transform 0.2s ease',
  ...(ownerState.popupOpen && {
    transform: 'rotate(180deg)',
  }),
}));

type AutocompleteInputProxyProps = TextFieldProps & {
  popupOpen: boolean;
  clearValue: () => void;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  value: string;
};

export function AutocompleteInputProxy({
  inputRef,
  label,
  value,
  onClick,
  onFocus,
  onKeyDown,
  slotProps,
  fullWidth,
  popupOpen,
  clearValue,
  onChange,
}: AutocompleteInputProxyProps) {
  const modifiedSlotProps: TextFieldProps['slotProps'] = {
    ...slotProps,
    input: {
      endAdornment: (
        <InputAdornment position="end">
          {!!value && (
            <AutocompleteClearIndicator
              onClick={(event) => {
                event.stopPropagation();
                clearValue();
              }}
              tabIndex={-1}
              aria-label={'Clear'}
              title={'Clear'}
            >
              <ClearIcon fontSize="small" />
            </AutocompleteClearIndicator>
          )}
          <AutocompletePopupIndicator
            ownerState={{ popupOpen }}
            edge="end"
            tabIndex={-1}
            aria-label={'Open'}
            title={'Open'}
          >
            <ArrowDropDownIcon />
          </AutocompletePopupIndicator>
        </InputAdornment>
      ),
    },
  };

  return (
    <TextField
      inputRef={inputRef}
      label={label}
      value={value}
      onFocus={onFocus}
      onClick={onClick}
      onChange={onChange}
      onKeyDown={onKeyDown}
      slotProps={modifiedSlotProps}
      fullWidth={fullWidth}
    />
  );
}
