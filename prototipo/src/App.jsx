import { useAppContext } from './context';
import { LoginView } from './components/login/LoginView.jsx';
import { ListView } from './components/list/ListView.jsx';
import { DetailView } from './components/detail/DetailView.jsx';

export default function App() {
  const { vista } = useAppContext();
  if (vista === 'login') return <LoginView />;
  return vista === 'lista' ? <ListView /> : <DetailView />;
}
