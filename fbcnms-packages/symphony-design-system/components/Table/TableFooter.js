/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import IconButton from '../IconButton';
import React from 'react';
import Text from '../Text';
import symphony from '../../theme/symphony';
import {ArrowLeftIcon, ArrowRightIcon} from '../../icons';
import {makeStyles} from '@material-ui/styles';
import {usePagination} from './TablePaginationContext';
import {useTable} from './TableContext';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: symphony.palette.background,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${symphony.palette.D50}`,
  },
  pageText: {
    marginRight: '16px',
  },
  pageButtons: {
    display: 'flex',
    backgroundColor: symphony.palette.white,
    border: `1px solid ${symphony.palette.D100}`,
    borderRadius: '4px',
  },
  pageButton: {
    backgroundColor: symphony.palette.white,
    borderRadius: '4px',
  },
  separator: {
    height: '24px',
    width: '1px',
    backgroundColor: symphony.palette.D100,
  },
}));

const TableFooter = () => {
  const {isLoading} = useTable();
  const {
    totalRowsCount,
    numPages,
    pageNumber,
    minResultsBound,
    maxResultsBound,
    onLoadNextClicked,
    onLoadPreviousClicked,
  } = usePagination();
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Text className={classes.pageText} variant="body2">
        {minResultsBound}-{maxResultsBound} of {totalRowsCount}
      </Text>
      <div className={classes.pageButtons}>
        <IconButton
          className={classes.pageButton}
          disabled={isLoading || pageNumber === 1}
          icon={ArrowLeftIcon}
          skin="secondaryGray"
          onClick={() => {
            onLoadPreviousClicked();
          }}
        />
        <div className={classes.separator} />
        <IconButton
          className={classes.pageButton}
          disabled={isLoading || pageNumber >= numPages}
          icon={ArrowRightIcon}
          skin="secondaryGray"
          onClick={() => {
            onLoadNextClicked();
          }}
        />
      </div>
    </div>
  );
};

export default TableFooter;
