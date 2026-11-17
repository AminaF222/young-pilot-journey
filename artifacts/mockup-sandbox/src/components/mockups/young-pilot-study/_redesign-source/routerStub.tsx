import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
  type AnchorHTMLAttributes,
  type ComponentType,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";

type LocationContextValue = [string, (path: string) => void];
const LocationContext = createContext<LocationContextValue | null>(null);

export function Router({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState("/");
  return (
    <LocationContext.Provider value={[location, setLocation]}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const context = useContext(LocationContext);
  if (!context) throw new Error("Preview routes must be wrapped in Router.");
  return context;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
};

export function Link({ href, onClick, children, ...props }: LinkProps) {
  const [, setLocation] = useLocation();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && event.button === 0 && !event.metaKey) {
      event.preventDefault();
      setLocation(href);
    }
  };
  return (
    <a {...props} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}

type RouteProps = {
  path?: string;
  component: ComponentType;
};

export function Route({ component: Page }: RouteProps) {
  return <Page />;
}

export function Switch({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const routes = Children.toArray(children).filter(
    (child): child is ReactElement<RouteProps> =>
      isValidElement<RouteProps>(child),
  );
  const selected =
    routes.find((route) => route.props.path === location) ??
    routes.find((route) => route.props.path === undefined);
  return selected ? cloneElement(selected) : null;
}
