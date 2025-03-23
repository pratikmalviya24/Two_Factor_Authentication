declare module 'qrcode.react' {
  import { FC } from 'react';

  interface QRCodeProps {
    value: string;
    size?: number;
    level?: string;
    includeMargin?: boolean;
    renderAs?: 'canvas' | 'svg';
  }

  const QRCode: FC<QRCodeProps>;
  export default QRCode;
}

declare module 'react-router-dom' {
  import { NavigateFunction, Location, To } from '@remix-run/router';
  import { ReactNode } from 'react';

  export interface NavigateOptions {
    replace?: boolean;
    state?: any;
  }

  export function useNavigate(): NavigateFunction;
  export function useLocation(): Location;
  export function Navigate(props: { to: To; replace?: boolean; state?: any }): null;
  export function BrowserRouter({ children }: { children: ReactNode }): JSX.Element;
  export function Routes({ children }: { children: ReactNode }): JSX.Element;
  export function Route(props: {
    path: string;
    element: ReactNode;
  }): JSX.Element;
}
