/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import SymphonyTheme from './symphony';
import {createMuiTheme} from '@material-ui/core/styles';

export default createMuiTheme({
  palette: {
    primary: {
      light: SymphonyTheme.palette.B300,
      main: SymphonyTheme.palette.B600,
      dark: SymphonyTheme.palette.B900,
    },
    secondary: {
      main: SymphonyTheme.palette.D900,
    },
    typography: {
      ...SymphonyTheme.typography,
    },
  },
});
