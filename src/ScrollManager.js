import StateStorage from 'farce/lib/StateStorage';
import { routerShape } from 'found/lib/PropTypes';
import React from 'react';
import ScrollBehavior from 'scroll-behavior';

const STORAGE_NAMESPACE = '@@scroll';

const propTypes = {
  shouldUpdateScroll: React.PropTypes.func,
  renderArgs: React.PropTypes.shape({
    location: React.PropTypes.object.isRequired,
    router: routerShape.isRequired,
  }).isRequired,
  children: React.PropTypes.element,
};

class ScrollManager extends React.Component {
  constructor(props, context) {
    super(props, context);

    const { renderArgs } = props;
    const { router } = renderArgs;

    this.scrollBehavior = new ScrollBehavior({
      addTransitionHook: router.addTransitionHook,
      stateStorage: new StateStorage(router, STORAGE_NAMESPACE),
      getCurrentLocation: () => this.props.renderArgs.location,
      shouldUpdateScroll: this.shouldUpdateScroll,
    });

    this.scrollBehavior.updateScroll(null, renderArgs);
  }

  componentDidUpdate(prevProps) {
    const { renderArgs } = this.props;
    const prevRenderArgs = prevProps.renderArgs;

    if (renderArgs.location === prevRenderArgs.location) {
      return;
    }

    this.scrollBehavior.updateScroll(prevRenderArgs, renderArgs);
  }

  componentWillUnmount() {
    this.scrollBehavior.stop();
  }

  shouldUpdateScroll = (prevRenderArgs, renderArgs) => {
    const { shouldUpdateScroll } = this.props;
    if (!shouldUpdateScroll) {
      return true;
    }

    // Hack to allow access to ScrollBehavior internals (e.g. stateStorage).
    return shouldUpdateScroll.call(
      this.scrollBehavior, prevRenderArgs, renderArgs,
    );
  };

  render() {
    return this.props.children;
  }
}

ScrollManager.propTypes = propTypes;

export default ScrollManager;
