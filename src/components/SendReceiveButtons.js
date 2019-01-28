import React from 'react';

import SendButton from './SendButton';
import ReceiveButton from './ReceiveButton';
import SendToken from './SendToken';
import ReceiveToken from './ReceiveToken';

const SendReceiveButtons = props => (
  <div>
    <div className="buttons-container">
      <SendButton />
      <ReceiveButton />
    </div>
    <SendToken />
    <ReceiveToken />
  </div>
);

export default SendReceiveButtons;
