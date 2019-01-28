import React, { Component } from 'react';
import { connect } from 'react-redux';

import Dashboard from './Dashboard';
import WalletBackup from './WalletBackup';
import Assets from './Assets';
import SendReceiveButtons from './SendReceiveButtons';
import Transactions from './Transactions';

class Wallet extends Component {
  render() {
    return (
      <div>
        <Dashboard />
        <SendReceiveButtons />
        <Assets />
        <Transactions />
        <WalletBackup />
      </div>
    );
  }
}

export default connect()(Wallet);
