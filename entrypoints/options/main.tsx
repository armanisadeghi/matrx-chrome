import ReactDOM from 'react-dom/client';
import '../../assets/main.css';
import { OptionsPage } from './OptionsPage';
import { ToastProvider } from '../../components/ui/Toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ToastProvider>
    <OptionsPage />
  </ToastProvider>,
);
