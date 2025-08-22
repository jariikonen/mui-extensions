/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Autocomplete,
  Box,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type {
  AutocompleteFreeSoloValueMapping,
  AutocompleteProps,
  AutocompleteRenderInputParams,
  ChipTypeMap,
} from '@mui/material';
import { DefaultStyledListbox } from './DefaultStyledListbox';
import OnScreenKeyboardResponsiveDialog from './OnScreenKeyboardResponsiveDialog';
import { AutocompleteInputProxy } from './AutocompleteInputProxy';

/**
 * Props for the `ModalAutocomplete` component.
 *
 * Accepts everything in MUI Material-UI's {@link AutocompleteProps} except
 * `renderInput`.
 */
export type ModalAutocompleteProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = 'div',
> = Omit<
  AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  'renderInput'
>;

/**
 * Default function for getting the label from an option.
 *
 * If `option` is an object with a `label` property, value of the `label` is
 * returned. Otherwise the value is cast to a string or in case of an object
 * stringified with `JSON.stringify()`.
 * @param option Option to check.
 * @returns A string value to use as a label for the option.
 */
function defaultGetOptionLabel<Value, FreeSolo extends boolean | undefined>(
  option: Value | AutocompleteFreeSoloValueMapping<FreeSolo>,
): string {
  if (typeof option === 'string') {
    return option;
  }

  if (typeof option === 'number') {
    return String(option);
  }

  if (typeof option === 'object' && option !== null) {
    return (
      (option as unknown as { label: string }).label ?? JSON.stringify(option)
    );
  }

  return String(option);
}

/**
 * A mobile friendly autocomplete component extending MUI Material-UI's
 * {@link https://mui.com/material-ui/react-autocomplete/ |Autocomplete}.
 *
 * Functions like a regular MUI Material Autocomplete, except opens a separate
 * user interface in a responsive modal component centered on the screen, when
 * the size of the screen is below the `sm`
 * {@link https://mui.com/material-ui/customization/breakpoints/ |breakpoint}.
 * Makes using the component easier on a mobile device.
 *
 * See {@link ModalAutocompleteProps} for the props.
 */
export default function ModalAutocomplete<
  Value,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
  ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
>({
  options,
  getOptionLabel,
  ...rest
}: ModalAutocompleteProps<
  Value,
  Multiple,
  DisableClearable,
  FreeSolo,
  ChipComponent
>) {
  const localGetOptionLabel =
    getOptionLabel ?? defaultGetOptionLabel<Value, FreeSolo>;
  const label = rest['aria-label'];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);
  const closeRef = useRef(false);
  const [selectedValue, setSelectedValue] = useState<Value | null | undefined>(
    null,
  );
  const [inputValue, setInputValue] = useState('');

  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const proxyInputRef = useRef<HTMLInputElement>(null);

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => (
      <TextField
        {...params}
        inputRef={(el: HTMLInputElement) => {
          const MUIsRef = params.inputProps.ref;
          // forward the ref
          if (typeof MUIsRef === 'function') {
            MUIsRef(el);
          } else if (MUIsRef) {
            (MUIsRef as React.RefObject<HTMLInputElement>).current = el;
          }
          // set local inputRef
          autocompleteInputRef.current = el;
        }}
        label={label}
      />
    ),
    [label],
  );

  useEffect(() => {
    if (open) {
      // small timeout to wait for dialog to fully open
      setTimeout(() => {
        if (autocompleteInputRef.current) {
          autocompleteInputRef.current.focus();
        }
      }, 100);
    } else if (closeRef.current) {
      setTimeout(() => {
        if (proxyInputRef.current) {
          proxyInputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!selectedValue) {
      return options.filter((option) =>
        localGetOptionLabel(option)
          .toLowerCase()
          .includes(inputValue.toLowerCase()),
      );
    }
    return options;
  }, [inputValue, options, selectedValue]);

  const simulateKey = useCallback((key: string) => {
    const event = new KeyboardEvent('keydown', {
      key,
      keyCode: key === 'ArrowDown' || key === 'PageDown' ? 40 : 38,
      bubbles: true,
    });
    autocompleteInputRef.current?.dispatchEvent(event);
  }, []);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isMobile ? (
        <>
          <AutocompleteInputProxy
            inputRef={proxyInputRef}
            label={label}
            value={selectedValue ? localGetOptionLabel(selectedValue) : ''}
            clearValue={() => {
              setInputValue('');
              setSelectedValue(null);
              if (proxyInputRef.current) {
                closeRef.current = true;
                proxyInputRef.current.focus();
              }
            }}
            onFocus={() => {
              if (!closeRef.current) {
                setOpen(true);
              } else {
                closeRef.current = false;
              }
            }}
            onClick={() => {
              setOpen(true);
              closeRef.current = false;
            }}
            onChange={(event) => {
              if (event?.target.value) {
                setInputValue(event?.target.value);
                setOpen(true);
                closeRef.current = false;
              } else {
                setInputValue('');
                setSelectedValue(null);
              }
            }}
            onKeyDown={(event: React.KeyboardEvent) => {
              if (
                event.key === 'ArrowDown' ||
                event.key === 'ArrowUp' ||
                event.key === 'PageDown' ||
                event.key === 'PageUp'
              ) {
                event.preventDefault();
                setOpen(true);
                closeRef.current = false;

                if (!selectedValue) {
                  setTimeout(() => {
                    simulateKey(event.key); // triggers MUI to highlight first/last
                  }, 200); // wait for dialog and autocomplete to mount
                }
              }
            }}
            slotProps={{
              input: {
                value: inputValue,
              },
            }}
            popupOpen={open}
            fullWidth
          />

          <OnScreenKeyboardResponsiveDialog
            open={open}
            onClose={() => {
              setOpen(false);
              closeRef.current = true;
            }}
            slotProps={{
              paper: {
                sx: {
                  width: '80vw',
                  height: '40vh',
                  margin: 0,
                },
              },
            }}
          >
            <Box sx={{ p: 1 }}>
              <Autocomplete
                open
                disableCloseOnSelect
                handleHomeEndKeys={false}
                options={filteredOptions}
                value={selectedValue}
                inputValue={inputValue}
                onChange={(_event, newValue, reason) => {
                  setSelectedValue(newValue);
                  if (reason !== 'selectOption') {
                    return;
                  }
                  setOpen(false);
                  closeRef.current = true;
                }}
                onInputChange={(_event, newValue, reason) => {
                  if (
                    reason === 'input' ||
                    reason === 'selectOption' ||
                    reason === 'clear'
                  ) {
                    setInputValue(newValue);
                  }
                }}
                onClose={() => {
                  setOpen(false);
                  closeRef.current = true;
                }}
                renderInput={renderInput}
                disablePortal
                fullWidth
                slots={{
                  listbox: DefaultStyledListbox,
                }}
                slotProps={{
                  paper: {
                    elevation: 0,
                  },
                }}
              />
            </Box>
          </OnScreenKeyboardResponsiveDialog>
        </>
      ) : (
        <Autocomplete
          options={options}
          value={selectedValue}
          onChange={(_event, newValue) => setSelectedValue(newValue)}
          renderInput={(params) => <TextField {...params} label={label} />}
          fullWidth
        />
      )}
    </>
  );
}
