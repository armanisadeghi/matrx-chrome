import ReactDOM from 'react-dom/client';
import '../../assets/main.css';
import { Popup } from './Popup';
import { ToastProvider } from '../../components/ui/Toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ToastProvider>
    <Popup />
  </ToastProvider>,
);
