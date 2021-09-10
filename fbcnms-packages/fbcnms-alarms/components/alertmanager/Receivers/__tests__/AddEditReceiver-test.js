/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import * as React from 'react';
import AddEditReceiver from '../AddEditReceiver';
import {act, fireEvent, render} from '@testing-library/react';
import {alarmTestUtil} from '../../../../test/testHelpers';
import {screen} from '@testing-library/dom';

const {apiUtil, AlarmsWrapper} = alarmTestUtil();

const commonProps = {
  isNew: true,
  onExit: jest.fn(),
};

test('renders', () => {
  const {getByText} = render(
    <AlarmsWrapper>
      <AddEditReceiver {...commonProps} receiver={{name: ''}} />
    </AlarmsWrapper>,
  );
  expect(getByText(/Details/i)).toBeInTheDocument();
  expect(getByText(/Slack Channel/i)).toBeInTheDocument();
  expect(getByText(/Email/i)).toBeInTheDocument();
  expect(getByText(/Webhook/i)).toBeInTheDocument();
  expect(getByText(/PagerDuty/i)).toBeInTheDocument();
  expect(getByText(/Pushover/i)).toBeInTheDocument();
});

test('clicking the add button adds a new config entry', async () => {
  const {getByTestId, queryByTestId} = render(
    <AlarmsWrapper>
      <AddEditReceiver {...commonProps} receiver={{name: ''}} />
    </AlarmsWrapper>,
  );
  expect(queryByTestId('slack-config-editor')).not.toBeInTheDocument();
  act(() => {
    fireEvent.click(getByTestId('add-SlackChannel'));
  });
  screen.debug();
  expect(getByTestId('slack-config-editor')).toBeInTheDocument();
});

test('editing a config entry then submitting submits the form state', () => {
  const {getByLabelText, getByTestId} = render(
    <AlarmsWrapper>
      <AddEditReceiver {...commonProps} receiver={{name: ''}} />
    </AlarmsWrapper>,
  );
  act(() => {
    fireEvent.change(getByLabelText(/Name/i), {
      target: {value: 'test receiver'},
    });
  });
  act(() => {
    fireEvent.click(getByTestId('add-SlackChannel'));
  });
  act(() => {
    fireEvent.change(getByLabelText(/Webhook url/i), {
      target: {value: 'https://slack.com/hook'},
    });
  });
  act(() => {
    fireEvent.click(getByTestId('editor-submit-button'));
  });
  expect(apiUtil.createReceiver).toHaveBeenCalledWith({
    receiver: {
      name: 'test receiver',
      slack_configs: [{api_url: 'https://slack.com/hook'}],
    },
    networkId: undefined,
  });
});
