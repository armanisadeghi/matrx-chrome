import ReactDOM from 'react-dom/client';
import '../../assets/main.css';
import { SidePanel } from './SidePanel';
import { ToastProvider } from '../../components/ui/Toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ToastProvider>
    <SidePanel />
  </ToastProvider>,
);
