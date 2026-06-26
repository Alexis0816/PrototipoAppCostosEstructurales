import { useAppContext } from './context';
import { ListView } from './components/list/ListView.jsx';
import { DetailView } from './components/detail/DetailView.jsx';

export default function App() {
  const { vista } = useAppContext();
  return vista === 'lista' ? <ListView /> : <DetailView />;
}
