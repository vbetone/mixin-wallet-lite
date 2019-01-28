import React from 'react';
import { connect } from 'react-redux';
import RequestIdentity from './RequestIdentity';
import RequestTransfer from './RequestTransfer';
import RequestUnlock from './RequestUnlock';

import * as PromptTypes from '../../models/prompts/promptTypes';

const Routing = ({ type }) => {
  switch (type) {
    case PromptTypes.REQUEST_IDENTITY:
      return <RequestIdentity />;
    case PromptTypes.REQUEST_TRANSFER:
      return <RequestTransfer />;
    case PromptTypes.REQUEST_UNLOCK:
      return <RequestUnlock />;
    default:
      return null;
  }
};

const mapStateToProps = state => ({
  type: state.prompt.type
});

export default connect(
  mapStateToProps,
  null
)(Routing);
