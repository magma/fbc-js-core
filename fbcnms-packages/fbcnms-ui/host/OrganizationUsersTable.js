/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import ActionTable from '../components/ActionTable';
import React from 'react';
import Text from '@fbcnms/ui/components/design-system/Text';
import axios from 'axios';
import withAlert from '@fbcnms/ui/components/Alert/withAlert';
import type {EditUser} from './OrganizationEdit';
import type {WithAlert} from '@fbcnms/ui/components/Alert/withAlert';

import {UserRoles} from '@fbcnms/auth/types';
import {useEffect, useState} from 'react';
import {useEnqueueSnackbar} from '@fbcnms/ui/hooks/useSnackbar';
import {useRouter} from '@fbcnms/ui/hooks';

type OrganizationUsersTableProps = WithAlert & {
  refresh: Date,
  setRefresh: number => void,
  editUser: (user: ?EditUser) => void,
};

/**
 * Table of users that belong to a specific organization
 */
function OrganizationUsersTable(props: OrganizationUsersTableProps) {
  const tableRef = React.createRef();
  const enqueueSnackbar = useEnqueueSnackbar();
  const [users, setUsers] = React.useState<Array<EditUser>>([]);

  // refresh data on subscriber add
  useEffect(() => {
    tableRef.current?.onQueryChange();
  }, [props.refresh]);
  const onDelete = user => {
    props
      .confirm({
        message: (
          <span>
            {'Are you sure you want to delete the user '}
            <strong>{user.email}</strong>?
          </span>
        ),
        confirmLabel: 'Delete',
      })
      .then(confirmed => {
        if (confirmed) {
          axios
            .delete('/user/async/' + user.id)
            .then(() => {
              props.setRefresh(Date.now());
            })
            .catch(error => {
              const message = error.response?.data?.error || error;
              enqueueSnackbar(`Unable to save organization: ${message}`, {
                variant: 'error',
              });
            });
        }
      });
  };

  const menuItems = [
    {
      name: 'Edit',
      handleFunc: () => {
        const user: ?EditUser = users.find(user => user.id === currRow.id);
        props.editUser?.(user);
      },
    },
    {
      name: 'Remove',
      handleFunc: () => {
        onDelete(currRow);
      },
    },
  ];
  const columnStruct = [
    {
      title: '',
      field: '',
      width: '40px',
      render: rowData => (
        <Text variant="subtitle3">{rowData.tableData?.id + 1}</Text>
      ),
    },
    {
      title: 'Email',
      field: 'email',
    },
    {
      title: 'Role',
      field: 'role',
      render: rowData => {
        const userRole = Object.keys(UserRoles).find(
          role => UserRoles[role] === rowData.role,
        );
        return <>{userRole}</>;
      },
    },
  ];
  const [currRow, setCurrRow] = useState<EditUser>({});
  const {match} = useRouter();

  return (
    <>
      <ActionTable
        tableRef={tableRef}
        data={() =>
          new Promise((resolve, _reject) => {
            axios
              .get(`/master/organization/async/${match.params.name}/users`)
              .then(result => {
                const users: Array<EditUser> = result.data.map(user => {
                  return {
                    email: user.email,
                    role: user.role,
                    id: user.id,
                    networkIDs: user.networkIDs,
                    organization: user.organization,
                  };
                });
                setUsers(users);
                resolve({
                  data: users,
                });
              });
          })
        }
        columns={columnStruct}
        handleCurrRow={(row: EditUser) => {
          setCurrRow(row);
        }}
        menuItems={menuItems}
        localization={{
          // hide 'Actions' in table header
          header: {actions: ''},
        }}
        options={{
          actionsColumnIndex: -1,
          sorting: true,
          // hide table title and toolbar
          toolbar: false,
          paging: false,
          pageSizeOptions: [100, 200],
        }}
      />
    </>
  );
}

export default withAlert(OrganizationUsersTable);
