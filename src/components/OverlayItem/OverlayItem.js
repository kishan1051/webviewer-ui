import React from 'react';
import PropTypes from 'prop-types';

import './OverlayItem.scss';

class OverlayItem extends React.PureComponent {
  static propTypes = {
    onClick: PropTypes.func,
    buttonName: PropTypes.string,
    shouldFocus: PropTypes.bool
  }

  componentDidMount() {
    if (this.props.shouldFocus) {
      this.focus();
    }
  }

  componentDidUpdate() {
    if (this.props.shouldFocus) {
      this.focus();
    }
  }

  focus() {
    if (this.ref) {
      this.ref.focus();
    }
  }

  setRef = ref => {
    this.ref = ref;
  }

  onKeyPress = e => {
    if (e.nativeEvent.key === 'Enter' || e.nativeEvent.keyCode === 13) {
      this.props.onClick(e);
    }
  }

  render() {
    const { buttonName } = this.props;
    return (
      <div
        tabIndex={0}
        role="button"
        className="OverlayItem"
        onClick={this.props.onClick}
        onKeyPress={this.onKeyPress}
        ref={this.setRef}
      >
        <div className="ButtonText">
          { buttonName }
        </div>
      </div>
    );
  }
}

export default OverlayItem;
