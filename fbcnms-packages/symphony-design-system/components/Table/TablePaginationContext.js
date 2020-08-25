/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {TablePaginationProps} from './Table';

import * as React from 'react';
import emptyFunction from '@fbcnms/util/emptyFunction';
import {useCallback, useContext, useMemo, useState} from 'react';
import {useTable} from './TableContext';

export type TablePaginationContextValue = $ReadOnly<{|
  totalRowsCount: number,
  pageNumber: number,
  setPageNumber: (pageNumber: number) => void,
  numPages: number,
  minResultsBound: number,
  maxResultsBound: number,
  onLoadNextClicked: () => void,
  onLoadPreviousClicked: () => void,
|}>;

const TablePaginationContext = React.createContext<TablePaginationContextValue>(
  {
    totalRowsCount: 0,
    numPages: 0,
    pageNumber: 0,
    setPageNumber: emptyFunction,
    minResultsBound: 0,
    maxResultsBound: 0,
    onLoadNextClicked: emptyFunction,
    onLoadPreviousClicked: emptyFunction,
  },
);

type Props = {
  loadedDataCount: number,
  children: React.Node,
  ...TablePaginationProps,
};

export const TablePaginationContextProvider = (props: Props) => {
  const {children, pageSize, totalRowsCount, loadNext, loadedDataCount} = props;
  const {setIsLoading} = useTable();

  const [pageNumber, setPageNumber] = useState(1);
  const numPages = useMemo(() => Math.ceil(totalRowsCount / pageSize), [
    totalRowsCount,
    pageSize,
  ]);
  const minResultsBound = useMemo(() => (pageNumber - 1) * pageSize + 1, [
    pageNumber,
    pageSize,
  ]);
  const maxResultsBound = useMemo(
    () => Math.min(pageNumber * pageSize, totalRowsCount),
    [pageNumber, pageSize, totalRowsCount],
  );
  const onLoadNextClicked = useCallback(() => {
    const incrementPage = () =>
      setPageNumber(Math.min(pageNumber + 1, numPages));
    if (
      Math.min((pageNumber + 1) * pageSize, totalRowsCount) > loadedDataCount
    ) {
      setIsLoading(true);
      loadNext?.(() => {
        incrementPage();
        setIsLoading(false);
      });
    } else {
      incrementPage();
    }
  }, [
    pageNumber,
    pageSize,
    totalRowsCount,
    loadedDataCount,
    numPages,
    loadNext,
    setIsLoading,
  ]);
  const onLoadPreviousClicked = useCallback(() => {
    setPageNumber(oldPage => Math.max(1, oldPage - 1));
  }, []);
  return (
    <TablePaginationContext.Provider
      value={{
        totalRowsCount,
        pageNumber,
        setPageNumber,
        numPages,
        minResultsBound,
        maxResultsBound,
        onLoadNextClicked,
        onLoadPreviousClicked,
      }}>
      {children}
    </TablePaginationContext.Provider>
  );
};

export function usePagination() {
  return useContext(TablePaginationContext);
}

export default TablePaginationContext;
