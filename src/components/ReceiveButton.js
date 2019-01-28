import React from 'react';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import AttachMoney from '@material-ui/icons/AttachMoney';

import { showReceiveToken } from '../actions/wallet';

const ReceiveButton = ({ showReceiveToken }) => (
  <Button
    size="small"
    variant="contained"
    color="secondary"
    onClick={showReceiveToken}
  >
    Receive <AttachMoney className="receive-button-icon" />
  </Button>
);

const mapDispatchToProps = {
  showReceiveToken,
};

export default connect(
  null,
  mapDispatchToProps
)(ReceiveButton);
