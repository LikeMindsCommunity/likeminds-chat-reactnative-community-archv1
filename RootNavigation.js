import {
  StackActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

// to navigate from one screen to another
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

// to push one screen in the stack over another
export function push(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.current?.dispatch(StackActions.push(name, params));
  }
}

// to pop one screen in the stack
export function pop() {
  if (navigationRef.isReady()) {
    navigationRef.current?.dispatch(StackActions.pop());
  }
}

// to get recent routes in the navigation stack
export function getRecentRoutes() {
  if (navigationRef.isReady()) {
    return navigationRef.getRootState();
  }
}
