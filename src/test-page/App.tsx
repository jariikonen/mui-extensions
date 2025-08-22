import { ModalAutocomplete } from '../components';

function App() {
  const options = [
    { label: 'kissa' },
    { label: 'koira' },
    { label: 'kana' },
    { label: 'kukko' },
    { label: 'norsu' },
    { label: 'murmeli' },
    { label: 'hiiri' },
    { label: 'pantteri' },
    { label: 'gepardi' },
    { label: 'leopardi' },
    { label: 'kala' },
    { label: 'sisilisko' },
    { label: 'käärme' },
    { label: 'lintu' },
    { label: 'strutsi' },
    { label: 'ampiainen' },
    { label: 'sudenkorento' },
    { label: 'kettu' },
    { label: 'peura' },
    { label: 'pupu' },
  ];

  return <ModalAutocomplete options={options} />;
}

export default App;
