/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {Organization} from './Organizations';
import type {Tab} from '@fbcnms/types/tabs';
import type {WithAlert} from '@fbcnms/ui/components/Alert/withAlert';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Button from '@fbcnms/ui/components/design-system/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import LoadingFiller from '@fbcnms/ui/components/LoadingFiller';
import OrganizationDialog from './OrganizationDialog';
import OrganizationSummary from './OrganizationSummary';
import OrganizationUsersTable from './OrganizationUsersTable';
import React from 'react';
import Text from '@fbcnms/ui/components/design-system/Text';
import axios from 'axios';
import withAlert from '@fbcnms/ui/components/Alert/withAlert';

import {makeStyles} from '@material-ui/styles';
import {useAxios, useRouter} from '@fbcnms/ui/hooks';
import {useCallback, useState} from 'react';
import {useEnqueueSnackbar} from '@fbcnms/ui/hooks/useSnackbar';

const useStyles = makeStyles(_ => ({
  arrowBack: {
    paddingRight: '0px',
    color: 'black',
  },
  container: {
    margin: '40px 32px',
  },
  header: {
    margin: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    textTransform: 'capitalize',
  },
  titleRow: {
    margin: '16px 0',
  },
}));

export type EditUser = {
  id: string | number,
  email: string,
  role: string,
  networkIDs?: string[],
  organization?: string,
  tabs?: Array<string>,
  password?: string,
  passwordConfirmation?: string,
};
type TitleRowProps = {
  title: string,
  buttonTitle: string,
  onClick: () => void,
};
type Props = {
  getProjectTabs?: () => Array<{id: Tab, name: string}>,
  hideAdvancedFields?: boolean,
};

function TitleRow(props: TitleRowProps) {
  const classes = useStyles();
  return (
    <Grid container justify="space-between" className={classes.titleRow}>
      <Text variant="h6">{props.title}</Text>
      <Button variant="text" onClick={() => props.onClick()}>
        <Text variant="body2" color="gray" weight="bold">
          {props.buttonTitle}
        </Text>
      </Button>
    </Grid>
  );
}

/**
 * Organization detail view and Organization edit dialog
 * This component displays an Organization basic information (OrganizationSummary)
 * and its users (OrganizationUsersTable)
 */
function OrganizationEdit(props: WithAlert & Props) {
  const {match, history} = useRouter();
  const [addUser, setAddUser] = useState(false);
  const classes = useStyles();
  const enqueueSnackbar = useEnqueueSnackbar();
  const [name, setName] = useState<string>('');
  const [networkIds, setNetworkIds] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState(false);
  const [createError, setCreateError] = useState('');
  const [refresh, setRefresh] = useState(Date.now());
  const [user, setUser] = useState<?EditUser>(null);
  const [editUser, setEditUser] = useState(false);
  const orgRequest = useAxios<null, {organization: Organization}>({
    method: 'get',
    url: '/master/organization/async/' + match.params.name,
    onResponse: useCallback(
      res => {
        const {organization} = res.data;
        setName(organization.name);
        setNetworkIds(new Set(organization.networkIDs));
      },
      [refresh],
    ),
  });

  const networksRequest = useAxios({
    method: 'get',
    url: '/host/networks/async',
  });

  if (
    orgRequest.isLoading ||
    networksRequest.isLoading ||
    !orgRequest.response
  ) {
    return <LoadingFiller />;
  }

  const organization = orgRequest.response.data.organization;

  const onSave = org => {
    axios
      .put('/master/organization/async/' + match.params.name, org)
      .then(_res => {
        enqueueSnackbar('Updated organization successfully', {
          variant: 'success',
        });
      })
      .catch(error => {
        const message = error.response?.data?.error || error;
        enqueueSnackbar(`Unable to save organization: ${message}`, {
          variant: 'error',
        });
      });
  };

  return (
    <>
      <div className={classes.container}>
        <OrganizationDialog
          user={user}
          hideAdvancedFields={props.hideAdvancedFields ?? false}
          edit={true}
          organization={organization}
          open={dialog}
          addUser={addUser}
          createError={createError}
          setAddUser={() => setAddUser(true)}
          onClose={() => {
            setAddUser(false);
            setDialog(false);
            setEditUser(false);
          }}
          onCreateOrg={org => {
            onSave(org);
            setRefresh(Date.now());
            setDialog(false);
          }}
          onCreateUser={newUser => {
            if (!editUser) {
              axios
                .post(
                  `/master/organization/async/${
                    match.params.name || ''
                  }/add_user`,
                  newUser,
                )
                .then(() => {
                  enqueueSnackbar('User added successfully', {
                    variant: 'success',
                  });
                  setDialog(false);
                })
                .catch(error => {
                  setCreateError(error);
                  enqueueSnackbar(error?.response?.data?.error || error, {
                    variant: 'error',
                  });
                });
            } else {
              if (user?.id) {
                axios
                  .put(`/user/async/${user.id}`, newUser)
                  .then(() => {
                    enqueueSnackbar('User updated successfully', {
                      variant: 'success',
                    });
                    setDialog(false);
                  })
                  .catch(error => {
                    setCreateError(error);
                    enqueueSnackbar(error?.response?.data?.error || newUser, {
                      variant: 'error',
                    });
                  });
              }
            }
          }}
        />
        <Grid container spacing={4}>
          <Grid container justify="space-between">
            <Grid item>
              <Grid container alignItems="center">
                <Grid>
                  <IconButton
                    onClick={() => history.goBack()}
                    className={classes.arrowBack}
                    color="primary">
                    <ArrowBackIcon />
                  </IconButton>
                </Grid>
                <Grid>
                  <Text className={classes.header} variant="h4">
                    {organization.name}
                  </Text>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Button
                skin="comet"
                onClick={() => {
                  props
                    .confirm(
                      'Are you sure you want to delete this organization?',
                    )
                    .then(async confirm => {
                      if (!confirm) return;
                      await axios.delete(
                        `/master/organization/async/${organization.id}`,
                      );
                      history.push('/master/organizations');
                    });
                }}>
                Remove Organization
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6} alignItems="center">
                <TitleRow
                  title={'Organizations'}
                  buttonTitle={'Edit'}
                  onClick={() => {
                    setAddUser(false);
                    setDialog(true);
                  }}
                />
                <OrganizationSummary name={name} networkIds={networkIds} />
              </Grid>

              <Grid item xs={12} md={6} alignItems="center">
                <TitleRow
                  title={'Users'}
                  buttonTitle={'Add User'}
                  onClick={() => {
                    setUser(null);
                    setAddUser(true);
                    setDialog(true);
                  }}
                />
                <OrganizationUsersTable
                  editUser={(newUser: ?EditUser) => {
                    setUser(newUser);
                    setAddUser(true);
                    setDialog(true);
                    setEditUser(true);
                  }}
                  refresh={new Date(refresh)}
                  setRefresh={() => setRefresh(Date.now())}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </>
  );
}

export default withAlert(OrganizationEdit);
