import { act } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import ModalAutocomplete from '../index';

const mobileMatchMediaMock = vi.fn((query: string) => ({
  matches: query === '(max-width:599.95px)', // small screen version of the component is used
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

const desktopMatchMediaMock = vi.fn((query: string) => ({
  matches: query !== '(max-width:599.95px)', // large screen version of the component is used
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

const testLabel = 'ModalAutocompleteTestLabel';
const testOptions = [
  { label: 'kissa' },
  { label: 'koira' },
  { label: 'kana' },
  { label: 'kukko' },
  { label: 'norsu' },
  { label: 'murmeli' },
];

describe('ModalAutocomplete', () => {
  describe('on mobile screen', () => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', mobileMatchMediaMock);
      render(
        <ModalAutocomplete aria-label={testLabel} options={testOptions} />,
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('renders a proxy input', () => {
      const inputProxyInput = screen.getByLabelText(testLabel);
      const inputProxyRoot = inputProxyInput.parentElement?.parentElement;

      expect(inputProxyInput).toBeInTheDocument();
      expect(inputProxyInput).toBeVisible();
      expect(inputProxyRoot).toHaveClass('MuiTextField-root');
    });

    it('renders the autocomplete dialog when the proxy input gains focus', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // check the autocomplete component exists
      const allByLabel = await screen.findAllByLabelText(testLabel);
      const autocompleteInput = allByLabel[1];
      const autocompleteRoot =
        autocompleteInput.parentElement?.parentElement?.parentElement;

      expect(autocompleteInput).toBeInTheDocument();
      expect(autocompleteInput).toBeVisible();
      expect(autocompleteRoot).toHaveClass('MuiAutocomplete-root');
    });

    it('does not keep focus in proxy input when the dialog opens', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // check that the proxy input loses the focus
      await waitFor(() => expect(proxyInput).not.toHaveFocus());
    });

    it('sets focus on the autocomplete input when the dialog is opened', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // check that the autocomplete component gets the focus
      const allByLabel = await screen.findAllByLabelText(testLabel);
      const autocompleteInput = allByLabel[1];

      await waitFor(() => expect(autocompleteInput).toHaveFocus());
    });

    it('renders a list of options when the dialog is opened', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // check that the option list exists and has correct amount of items
      const listbox = await screen.findByRole('listbox');
      const numberOfListItems = listbox.children.length;
      const norsuItem = within(listbox).getByText('norsu');

      expect(listbox).toBeInTheDocument();
      expect(listbox).toBeVisible();
      expect(numberOfListItems).toEqual(6);
      expect(norsuItem).toBeInTheDocument();
    });

    it('renders correctly filtered list of options when letters are typed into the autocomplete input', async () => {
      // focus to proxy input which should opent the dialog and input letters 'ko'
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
        fireEvent.change(proxyInput, { target: { value: 'ko' } });
      });

      // check that the options are filtered correctly
      const listbox = await screen.findByRole('listbox');
      const numberOfListItems = listbox.children.length;
      const koiraItem = within(listbox).getByText('koira');
      const kukkoItem = within(listbox).getByText('kukko');
      const norsuItem = within(listbox).queryByText('norsu');

      expect(numberOfListItems).toEqual(2);
      expect(koiraItem).toBeInTheDocument();
      expect(koiraItem).toBeVisible();
      expect(kukkoItem).toBeInTheDocument();
      expect(kukkoItem).toBeVisible();
      expect(norsuItem).not.toBeInTheDocument();
    });

    it('sets input value and closes the dialog when an option is selected by navigating to it with down arrow and pressing enter', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // find the autocomplete component
      const allByLabel = await screen.findAllByLabelText(testLabel);
      const autocompleteInput = allByLabel[1];

      expect(autocompleteInput).toBeInTheDocument();
      expect(autocompleteInput).toBeVisible();
      await waitFor(() => expect(autocompleteInput).toHaveFocus());

      // select an option
      act(() => {
        fireEvent.keyDown(document.activeElement ?? document.body, {
          key: 'ArrowDown',
          code: 'ArrowDown',
        });
        fireEvent.keyDown(document.activeElement ?? document.body, {
          key: 'ArrowDown',
          code: 'ArrowDown',
        });
        fireEvent.keyDown(document.activeElement ?? document.body, {
          key: 'Enter',
          code: 'Enter',
        });
      });

      // check that the values are correctly set
      await waitFor(() => expect(autocompleteInput).toHaveValue('koira'));
      await waitForElementToBeRemoved(autocompleteInput);
      await waitFor(() => expect(proxyInput).toHaveValue('koira'));
    });

    it('sets input value and closes the dialog when an option is selected by clicking it', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // find the autocomplete component
      const allByLabel = await screen.findAllByLabelText(testLabel);
      const autocompleteInput = allByLabel[1];

      await waitFor(() => expect(autocompleteInput).toHaveFocus());

      // select a specific item
      const listbox = await screen.findByRole('listbox');
      const koiraItem = within(listbox).getByText('koira');

      act(() => {
        fireEvent.click(koiraItem);
      });

      // check that the values are correctly set
      await waitFor(() => expect(autocompleteInput).toHaveValue('koira'));
      await waitForElementToBeRemoved(autocompleteInput);
      await waitFor(() => expect(proxyInput).toHaveValue('koira'));
    });

    it('sets the focus on proxy input after closing the dialog when an option is selected', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // find the autocomplete component
      const allByLabel = await screen.findAllByLabelText(testLabel);
      const autocompleteInput = allByLabel[1];

      await waitFor(() => expect(autocompleteInput).toHaveFocus());

      // select a specific item
      const listbox = await screen.findByRole('listbox');
      const koiraItem = within(listbox).getByText('koira');

      act(() => {
        fireEvent.click(koiraItem);
      });

      // check that proxy input gets the focus
      await waitFor(() => expect(proxyInput).toHaveFocus());
    });

    it('clears the value when clear button is clicked in the proxy input', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // select a specific item
      const allByLabel = await screen.findAllByLabelText(testLabel);
      const autocompleteInput = allByLabel[1];
      const listbox = await screen.findByRole('listbox');
      const koiraItem = within(listbox).getByText('koira');

      act(() => {
        fireEvent.click(koiraItem);
      });

      await waitFor(() => expect(proxyInput).toHaveFocus());
      await waitForElementToBeRemoved(autocompleteInput);

      // click the clear button
      const clearButton = screen.getByRole('button', { name: 'Clear' });

      act(() => {
        fireEvent.click(clearButton);
      });

      // check that the value is cleared
      await waitFor(() => expect(proxyInput).toHaveValue(''));
    });

    it('keeps focus in the proxy input when clear button is clicked in it', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // select a specific item
      const allByLabel = await screen.findAllByLabelText(testLabel);
      const autocompleteInput = allByLabel[1];
      const listbox = await screen.findByRole('listbox');
      const koiraItem = within(listbox).getByText('koira');

      act(() => {
        fireEvent.click(koiraItem);
      });

      await waitFor(() => expect(proxyInput).toHaveFocus());
      await waitForElementToBeRemoved(autocompleteInput);

      // click the clear button
      const clearButton = screen.getByRole('button', { name: 'Clear' });

      act(() => {
        fireEvent.click(clearButton);
      });

      // check that the proxy input retains the focus
      await waitFor(() => expect(proxyInput).toHaveValue(''));
      expect(proxyInput).toHaveFocus();
    });

    it('opens the dialog when the popup indicator button is clicked in the proxy input', async () => {
      // click the open button
      const openButton = screen.getByRole('button', { name: 'Open' });

      act(() => {
        fireEvent.click(openButton);
      });

      // check that the autocomplete dialog is opened
      const allByLabel = await screen.findAllByLabelText(testLabel);
      const autocompleteInput = allByLabel[1];
      const autocompleteRoot =
        autocompleteInput.parentElement?.parentElement?.parentElement;

      expect(autocompleteRoot).toHaveClass('MuiAutocomplete-root');
      await waitFor(() => expect(autocompleteInput).toHaveFocus());
    });

    it('closes the dialog when the popup indicator button is clicked in the autocomplete input', async () => {
      // click the open button
      const openButton = screen.getByRole('button', { name: 'Open' });

      act(() => {
        fireEvent.click(openButton);
      });

      const allByLabel = await screen.findAllByLabelText(testLabel);
      const proxyInput = allByLabel[0];
      const autocompleteInput = allByLabel[1];

      await waitFor(() => expect(autocompleteInput).toHaveFocus());

      // click the close button
      const closeButton = screen.getByRole('button', { name: 'Close' });

      act(() => {
        fireEvent.click(closeButton);
      });

      // check that the autocomplete dialg is closed
      await waitForElementToBeRemoved(autocompleteInput);
      await waitFor(() => expect(proxyInput).toHaveFocus());
    });

    it('clears the value when the clear button is clicked in the dialog', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // select a specific item
      let allByLabel = await screen.findAllByLabelText(testLabel);
      let autocompleteInput = allByLabel[1];
      const listbox = await screen.findByRole('listbox');
      const koiraItem = within(listbox).getByText('koira');

      act(() => {
        fireEvent.click(koiraItem);
      });

      await waitFor(() => expect(proxyInput).toHaveFocus());
      await waitForElementToBeRemoved(autocompleteInput);

      // click the open button
      const openButton = screen.getByRole('button', { name: 'Open' });

      act(() => {
        fireEvent.click(openButton);
      });

      allByLabel = await screen.findAllByLabelText(testLabel);
      autocompleteInput = allByLabel[1];

      await waitFor(() => expect(autocompleteInput).toHaveFocus());

      // click the autocomplete clear button
      const autocompleteRoot =
        autocompleteInput.parentElement?.parentElement?.parentElement;
      const clearButton = within(autocompleteRoot!).getByLabelText('Clear'); // cannot be found with getByRole('button')

      act(() => {
        fireEvent.click(clearButton);
      });

      // check that the value is cleared
      await waitFor(() => {
        expect(autocompleteInput).toHaveValue('');
        expect(proxyInput).toHaveValue('');
      });
    });

    it('keeps the focus in the autocomplete input when the clear button is clicked in the dialog', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // select a specific item
      let allByLabel = await screen.findAllByLabelText(testLabel);
      let autocompleteInput = allByLabel[1];
      const listbox = await screen.findByRole('listbox');
      const koiraItem = within(listbox).getByText('koira');

      act(() => {
        fireEvent.click(koiraItem);
      });

      await waitFor(() => expect(proxyInput).toHaveFocus());
      await waitForElementToBeRemoved(autocompleteInput);

      // click the open button
      const openButton = screen.getByRole('button', { name: 'Open' });

      act(() => {
        fireEvent.click(openButton);
      });

      allByLabel = await screen.findAllByLabelText(testLabel);
      autocompleteInput = allByLabel[1];

      await waitFor(() => expect(autocompleteInput).toHaveFocus());

      // click the autocomplete clear button
      const autocompleteRoot =
        autocompleteInput.parentElement?.parentElement?.parentElement;
      const clearButton = within(autocompleteRoot!).getByLabelText('Clear'); // cannot be found with getByRole('button')

      act(() => {
        fireEvent.click(clearButton);
      });

      // check that the focus is retained after the value has been cleared
      await waitFor(() => {
        expect(autocompleteInput).toHaveValue('');
        expect(proxyInput).toHaveValue('');
      });
      expect(autocompleteInput).toHaveFocus();
      expect(proxyInput).not.toHaveFocus();
    });

    it('opens the dialog and highlights the first option when down arrow key is pressed in the proxy input', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // click the close button
      let allByLabel = await screen.findAllByLabelText(testLabel);
      let autocompleteInput = allByLabel[1];

      await waitFor(() => expect(autocompleteInput).toHaveFocus());
      const closeButton = screen.getByRole('button', { name: 'Close' });

      act(() => {
        fireEvent.click(closeButton);
      });

      await waitForElementToBeRemoved(autocompleteInput);
      await waitFor(() => expect(proxyInput).toHaveFocus());

      // press down arrow key
      act(() => {
        fireEvent.keyDown(document.activeElement ?? document.body, {
          key: 'ArrowDown',
          code: 'ArrowDown',
        });
      });

      // check that correct option is highlighted
      allByLabel = await screen.findAllByLabelText(testLabel);
      autocompleteInput = allByLabel[1];

      expect(autocompleteInput).toBeInTheDocument();
      const firstOptionIndex = 0;

      await waitFor(
        () => {
          const activedescendant = autocompleteInput.getAttribute(
            'aria-activedescendant',
          );
          expect(activedescendant).toMatch(`-option-${firstOptionIndex}`);
        },
        { timeout: 300 },
      );
    });

    it('opens the dialog and highlights the last option when up arrow key is pressed in the proxy input', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // click the close button
      let allByLabel = await screen.findAllByLabelText(testLabel);
      let autocompleteInput = allByLabel[1];

      await waitFor(() => expect(autocompleteInput).toHaveFocus());
      const closeButton = screen.getByRole('button', { name: 'Close' });

      act(() => {
        fireEvent.click(closeButton);
      });

      await waitForElementToBeRemoved(autocompleteInput);
      await waitFor(() => expect(proxyInput).toHaveFocus());

      // press up arrow key
      act(() => {
        fireEvent.keyDown(document.activeElement ?? document.body, {
          key: 'ArrowUp',
          code: 'ArrowUp',
        });
      });

      // check that correct option is highlighted
      allByLabel = await screen.findAllByLabelText(testLabel);
      autocompleteInput = allByLabel[1];

      expect(autocompleteInput).toBeInTheDocument();
      const lastOptionIndex = testOptions.length - 1;

      await waitFor(
        () => {
          const activedescendant = autocompleteInput.getAttribute(
            'aria-activedescendant',
          );
          expect(activedescendant).toMatch(`-option-${lastOptionIndex}`);
        },
        { timeout: 300 },
      );
    });

    it('opens the dialog and highlights the correct option when PgDn key is pressed in the proxy input', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // click the close button
      let allByLabel = await screen.findAllByLabelText(testLabel);
      let autocompleteInput = allByLabel[1];

      await waitFor(() => expect(autocompleteInput).toHaveFocus());
      const closeButton = screen.getByRole('button', { name: 'Close' });

      act(() => {
        fireEvent.click(closeButton);
      });

      await waitForElementToBeRemoved(autocompleteInput);
      await waitFor(() => expect(proxyInput).toHaveFocus());

      // press PgDn key
      act(() => {
        fireEvent.keyDown(document.activeElement ?? document.body, {
          key: 'PageDown',
          code: 'PageDown',
        });
      });

      // check that correct option is highlighted
      allByLabel = await screen.findAllByLabelText(testLabel);
      autocompleteInput = allByLabel[1];

      expect(autocompleteInput).toBeInTheDocument();
      const pgDnOptionIndex = 4;

      await waitFor(
        () => {
          const activedescendant = autocompleteInput.getAttribute(
            'aria-activedescendant',
          );
          expect(activedescendant).toMatch(`-option-${pgDnOptionIndex}`);
        },
        { timeout: 300 },
      );
    });

    it('opens the dialog and highlights the first option when PgUp key is pressed in the proxy input', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // click the close button
      let allByLabel = await screen.findAllByLabelText(testLabel);
      let autocompleteInput = allByLabel[1];

      await waitFor(() => expect(autocompleteInput).toHaveFocus());
      const closeButton = screen.getByRole('button', { name: 'Close' });

      act(() => {
        fireEvent.click(closeButton);
      });

      await waitForElementToBeRemoved(autocompleteInput);
      await waitFor(() => expect(proxyInput).toHaveFocus());

      // press up arrow key
      act(() => {
        fireEvent.keyDown(document.activeElement ?? document.body, {
          key: 'PageUp',
          code: 'PageUp',
        });
      });

      // check that correct option is highlighted
      allByLabel = await screen.findAllByLabelText(testLabel);
      autocompleteInput = allByLabel[1];

      expect(autocompleteInput).toBeInTheDocument();
      const firstOptionIndex = 0;

      await waitFor(
        () => {
          const activedescendant = autocompleteInput.getAttribute(
            'aria-activedescendant',
          );
          expect(activedescendant).toMatch(`-option-${firstOptionIndex}`);
        },
        { timeout: 300 },
      );
    });

    it('closes the dialog when esc key is pressed in the autocomplete input', async () => {
      // focus to proxy input which should opent the dialog
      const proxyInput = screen.getByLabelText(testLabel);

      act(() => {
        proxyInput.focus();
      });

      // press the esc key
      const allByLabel = await screen.findAllByLabelText(testLabel);
      const autocompleteInput = allByLabel[1];

      await waitFor(() => expect(autocompleteInput).toHaveFocus());

      act(() => {
        fireEvent.keyDown(document.activeElement ?? document.body, {
          key: 'Esc',
          code: 'Esc',
        });
      });

      // check that autocomplete dialog is closed
      await waitForElementToBeRemoved(autocompleteInput);
      await waitFor(() => expect(proxyInput).toHaveFocus());
    });
  });

  describe('on desktop screen', () => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', desktopMatchMediaMock);
      render(
        <ModalAutocomplete aria-label={testLabel} options={testOptions} />,
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('renders full autocomplete', () => {
      // check that an autocomplete component is rendered instead of a proxy input
      const autocompleteInput = screen.getByLabelText(testLabel);
      const autocompleteRoot =
        autocompleteInput.parentElement?.parentElement?.parentElement;

      expect(autocompleteInput).toBeInTheDocument();
      expect(autocompleteInput).toBeVisible();
      expect(autocompleteRoot).not.toHaveClass('MuiTextField-root');
      expect(autocompleteRoot).toHaveClass('MuiAutocomplete-root');
    });
  });
});
