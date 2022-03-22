/**
 * Copyright 2020 The Magma Authors.
 *
 * @format
 * @flow
 */

import '@testing-library/jest-dom';
import {cleanup} from '@testing-library/react';
beforeEach(() => {
  jest.clearAllMocks();
});
afterEach(() => {
  cleanup();
});
