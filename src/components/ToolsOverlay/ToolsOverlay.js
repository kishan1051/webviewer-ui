import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ToolButton from 'components/ToolButton';
import Button from 'components/Button';

import core from 'core';
import getClassName from 'helpers/getClassName';
import getOverlayPositionBasedOn from 'helpers/getOverlayPositionBasedOn';
import defaultTool from 'constants/defaultTool';
import actions from 'actions';
import selectors from 'selectors';

import './ToolsOverlay.scss';

class ToolsOverlay extends React.PureComponent {
  static propTypes = {
    isDisabled: PropTypes.bool,
    isOpen: PropTypes.bool,
    toolButtonObjects: PropTypes.object,
    activeHeaderItems: PropTypes.arrayOf(PropTypes.object),
    activeToolGroup: PropTypes.string,
    closeElements: PropTypes.func.isRequired,
    setActiveToolGroup: PropTypes.func.isRequired
  }

  constructor() {
    super();
    this.overlay = React.createRef();
    this.state = {
      left: 0,
      right: 'auto',
      hasFocusedFirstButton: false,
    };
  }

  isOpening = false;

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
  }


  // https://github.com/reactjs/rfcs/blob/master/text/0006-static-lifecycle-methods.md#state-derived-from-propsstate
  static getDerivedStateFromProps(nextProps, prevState){
    const hasIsOpenChanged = !prevState.mirroredIsOpen && nextProps.isOpen;
    const hasActiveToolGroupChanged = prevState.mirroredIsOpen  && (prevState.mirroredActiveToolGroup !== nextProps.activeToolGroup);
    if (hasIsOpenChanged || hasActiveToolGroupChanged){
      return { isOpening: true, mirroredIsOpen: nextProps.isOpen, mirroredActiveToolGroup: nextProps.activeToolGroup };
    }
    return { isOpening: false, mirroredIsOpen: nextProps.isOpen, mirroredActiveToolGroup: nextProps.activeToolGroup };
  }

  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   this.isOpening = !this.props.isOpen && nextProps.isOpen || (this.props.isOpen && (this.props.activeToolGroup !== nextProps.activeToolGroup));
  // }

  componentDidUpdate(prevProps) {
    const clickedOnAnotherToolGroupButton = prevProps.activeToolGroup !== this.props.activeToolGroup;

    if (!prevProps.isOpen && this.props.isOpen) {
      this.props.closeElements(['viewControlsOverlay', 'searchOverlay', 'menuOverlay', 'toolStylePopup', 'signatureOverlay', 'zoomOverlay', 'redactionOverlay']);
      this.setOverlayPosition();
    }

    if (clickedOnAnotherToolGroupButton) {
      this.setOverlayPosition();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize = () => {
    this.setOverlayPosition();
  }

  setOverlayPosition = () => {
    const { activeToolGroup, activeHeaderItems } = this.props;
    const element = activeHeaderItems.find(item => item.toolGroup === activeToolGroup);

    if (element) {
      this.setState(getOverlayPositionBasedOn(element.dataElement, this.overlay));
    }
  }

  handleCloseClick = () => {
    const { setActiveToolGroup, closeElements } = this.props;

    core.setToolMode(defaultTool);
    setActiveToolGroup('');
    closeElements(['toolStylePopup', 'toolsOverlay']);
  }

  render() {
    const { left, right, isOpening } = this.state;
    const { isDisabled, isOpen, toolButtonObjects, activeToolGroup } = this.props;

    if (isDisabled || !activeToolGroup) {
      return null;
    }

    const toolNames = Object.keys(toolButtonObjects).filter(toolName => toolButtonObjects[toolName].group === activeToolGroup);
    const className = getClassName('Overlay ToolsOverlay', { isOpen });

    return (
      <div className={className} ref={this.overlay} style={{ left, right }} data-element="toolsOverlay" onMouseDown={e => e.stopPropagation()}>
        {toolNames.map(
          (toolName, i) =>
              <ToolButton
                key={`${toolName}-${i}`}
                toolName={toolName}
                shouldFocus={isOpening && i === 0}
              />
        )}
        <div className="spacer hide-in-desktop"></div>
        <Button className="close hide-in-desktop" dataElement="toolsOverlayCloseButton" img="ic_check_black_24px" onClick={this.handleCloseClick} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'toolsOverlay'),
  isOpen: selectors.isElementOpen(state, 'toolsOverlay'),
  toolButtonObjects: selectors.getToolButtonObjects(state),
  activeHeaderItems: selectors.getActiveHeaderItems(state),
  activeToolGroup: selectors.getActiveToolGroup(state)
});

const mapDispatchToProps = {
  closeElements: actions.closeElements,
  setActiveToolGroup: actions.setActiveToolGroup
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolsOverlay);
