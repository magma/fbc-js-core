/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {EnqueueSnackbarOptions} from 'notistack';
import type {OrganizationPlainAttributes} from '@fbcnms/sequelize-models/models/organization';
import type {UserType} from '@fbcnms/sequelize-models/models/user.js';
import type {WithAlert} from '@fbcnms/ui/components/Alert/withAlert';

import ActionTable from '../components/ActionTable';
import BusinessIcon from '@material-ui/icons/Business';
import Button from '@fbcnms/ui/components/design-system/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import LoadingFiller from '@fbcnms/ui/components/LoadingFiller';
import OrganizationDialog from './OrganizationDialog';
import PersonAdd from '@material-ui/icons/PersonAdd';
import PersonIcon from '@material-ui/icons/Person';
import React from 'react';
import Text from '../components/design-system/Text';
import axios from 'axios';
import withAlert from '@fbcnms/ui/components/Alert/withAlert';

import {comet, concrete, gullGray} from '../theme/colors';
import {makeStyles} from '@material-ui/styles';
import {useAxios, useRouter} from '@fbcnms/ui/hooks';
import {useCallback, useEffect, useState} from 'react';
import {useEnqueueSnackbar} from '@fbcnms/ui/hooks/useSnackbar';
import {useRelativeUrl} from '@fbcnms/ui/hooks/useRouter';

export type Organization = OrganizationPlainAttributes;

const ORGANIZATION_DESCRIPTION =
  'Multiple organizations can be independently managed, each with access to their own networks. ' +
  'As a host user, you can create and manage organizations here. You can also create users for these organizations.';

const useStyles = makeStyles(_ => ({
  addButton: {
    minWidth: '150px',
  },
  description: {
    margin: '20px 0',
  },
  header: {
    margin: '10px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  paper: {
    margin: '40px 32px',
  },
  onBoardingDialog: {
    padding: '24px 0',
  },
  onBoardingDialogTitle: {
    padding: '0 24px',
    fontSize: '24px',
    color: comet,
    backgroundColor: concrete,
  },
  onBoardingDialogContent: {
    minHeight: '200px',
    padding: '16px 24px',
  },
  onBoardingDialogActions: {
    padding: '0 24px',
    backgroundColor: concrete,
    boxShadow: 'none',
  },
  onBoardingDialogButton: {
    minWidth: '120px',
  },
  subtitle: {
    margin: '16px 0',
  },
  index: {
    color: gullGray,
  },
}));

type Props = {...WithAlert, hideAdvancedFields: boolean};

function OnboardingDialog() {
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      classes={{paper: classes.onBoardingDialog}}
      maxWidth={'sm'}
      fullWidth={true}
      open={open}
      keepMounted
      onClose={() => setOpen(false)}
      aria-describedby="alert-dialog-slide-description">
      <DialogTitle classes={{root: classes.onBoardingDialogTitle}}>
        {'Welcome to Magma Host Portal'}
      </DialogTitle>
      <DialogContent classes={{root: classes.onBoardingDialogContent}}>
        <DialogContentText id="alert-dialog-slide-description">
          <Text variant="subtitle1">
            In this portal, you can add and edit organizations and its user.
            Follow these steps to get started:
          </Text>
          <List dense={true}>
            <ListItem disableGutters>
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <Text variant="subtitle1">Add an organization</Text>
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <Text variant="subtitle1">Add a user for the organization</Text>
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <Text variant="subtitle1">
                Log in to the organization portal with the user account you
                created
              </Text>
            </ListItem>
          </List>
        </DialogContentText>
      </DialogContent>
      <DialogActions classes={{root: classes.onBoardingDialogActions}}>
        <Button
          className={classes.onBoardingDialogButton}
          skin="comet"
          onClick={() => setOpen(false)}>
          Get Started
        </Button>
      </DialogActions>
    </Dialog>
  );
}

async function getUsers(
  organizations: Organization[],
  setUsers: (Array<?UserType>) => void,
  enqueueSnackbar: (
    msg: string,
    cfg: EnqueueSnackbarOptions,
  ) => ?(string | number),
) {
  const requests = organizations.map(async organization => {
    try {
      const response = await axios.get(
        `/host/organization/async/${organization.name}/users`,
      );
      return response.data;
    } catch (error) {
      enqueueSnackbar('Organization added successfully', {
        variant: 'success',
      });
    }
  });
  const organizationUsers = await Promise.all(requests);
  if (organizationUsers) {
    setUsers([...organizationUsers.flat()]);
  }
}

function Organizations(props: Props) {
  const classes = useStyles();
  const relativeUrl = useRelativeUrl();
  const {history} = useRouter();
  const [organizations, setOrganizations] = useState<?(Organization[])>(null);
  const [addingUserFor, setAddingUserFor] = useState<?Organization>(null);
  const [currRow, setCurrRow] = useState<OrganizationRowType>({});
  const [users, setUsers] = useState<Array<?UserType>>([]);
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);
  const [showOrganizationDialog, setShowOrganizationDialog] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const enqueueSnackbar = useEnqueueSnackbar();
  const {error, isLoading} = useAxios({
    url: '/host/organization/async',
    onResponse: useCallback(res => {
      setOrganizations(res.data.organizations);
      if (res.data.organizations.length < 3) {
        setShowOnboardingDialog(true);
      }
    }, []),
  });
  useEffect(() => {
    if (organizations?.length) {
      getUsers(organizations, setUsers, enqueueSnackbar);
    }
  }, [organizations, addingUserFor]);

  if (error || isLoading || !organizations) {
    return <LoadingFiller />;
  }

  const onDelete = org => {
    props
      .confirm('Are you sure you want to delete this organization?')
      .then(async confirm => {
        if (!confirm) return;
        await axios.delete(`/host/organization/async/${org.id}`);
        const newOrganizations = organizations.filter(
          organization => organization.id !== org.id,
        );
        setOrganizations([...newOrganizations]);
      });
  };

  type OrganizationRowType = {
    name: string,
    networks: Array<string>,
    portalLink: string,
    userNumber: number,
    id: number,
  };

  const organizationRows: Array<OrganizationRowType> = organizations.map(
    row => {
      return {
        name: row.name,
        networks: row.networkIDs,
        portalLink: `${row.name}`,
        userNumber: users?.filter(user => user?.organization === row.name)
          .length,
        id: row.id,
      };
    },
  );
  return (
    <div className={classes.paper}>
      <Grid container>
        <Grid container justify="space-between">
          <Text variant="h3">Organizations</Text>
          <Button
            skin="comet"
            className={classes.addButton}
            variant="contained"
            onClick={() => setShowOrganizationDialog(true)}>
            Add Organization
          </Button>
        </Grid>
        <Grid xs={12} className={classes.description}>
          <Text variant="body2">{ORGANIZATION_DESCRIPTION}</Text>
        </Grid>
        <>{showOnboardingDialog && <OnboardingDialog />}</>
        <Grid xs={12}>
          <ActionTable
            data={organizationRows}
            columns={[
              {
                title: '',
                field: '',
                width: '40px',
                editable: 'never',
                render: rowData => (
                  <Text className={classes.index} variant="caption">
                    {rowData.tableData?.index + 1 || ''}
                  </Text>
                ),
              },
              {title: 'Name', field: 'name'},
              {
                title: 'Accessible Networks',
                field: 'networks',
                render: rowData => {
                  // only diplay 3 networks if more
                  if (rowData.networks.length > 2) {
                    return `${rowData.networks.slice(0, 3).join(', ')} + ${
                      rowData.networks.length - 3
                    } more`;
                  }
                  return rowData.networks.join(', ');
                },
              },
              {title: 'Link to Organization Portal', field: 'portalLink'},
              {title: 'Number of Users', field: 'userNumber'},
            ]}
            handleCurrRow={(row: OrganizationRowType) => {
              setCurrRow(row);
            }}
            actions={[
              {
                icon: () => <PersonAdd />,
                tooltip: 'Add User',
                onClick: (event, row) => {
                  setAddingUserFor(row);
                  setAddUser(true);
                  setShowOrganizationDialog(true);
                },
              },
            ]}
            menuItems={[
              {
                name: 'View',
                handleFunc: () => {
                  history.push(relativeUrl(`/detail/${currRow.name}`));
                },
              },
              {
                name: 'Delete',
                handleFunc: () => {
                  onDelete(currRow);
                },
              },
            ]}
            options={{
              actionsColumnIndex: -1,
              pageSizeOptions: [5, 10],
              toolbar: false,
            }}
          />
        </Grid>
        <OrganizationDialog
          edit={false}
          hideAdvancedFields={props.hideAdvancedFields}
          organization={null}
          user={null}
          open={showOrganizationDialog}
          addUser={addUser}
          setAddUser={() => setAddUser(true)}
          onClose={() => {
            setShowOrganizationDialog(false);
            setAddUser(false);
          }}
          onCreateOrg={org => {
            let newOrg = null;
            axios
              .post('/host/organization/async', org)
              .then(() => {
                enqueueSnackbar('Organization added successfully', {
                  variant: 'success',
                });
                axios
                  .get(`/host/organization/async/${org?.name ?? ''}`)
                  .then(resp => {
                    newOrg = resp.data.organization;
                    if (newOrg) {
                      setOrganizations([...organizations, newOrg]);
                      setAddingUserFor(newOrg);
                    }
                  });
              })
              .catch(error => {
                enqueueSnackbar(error?.response?.data?.error || error, {
                  variant: 'error',
                });
              });
          }}
          onCreateUser={user => {
            axios
              .post(
                `/host/organization/async/${
                  addingUserFor?.name || ''
                }/add_user`,
                user,
              )
              .then(() => {
                enqueueSnackbar('User added successfully', {
                  variant: 'success',
                });
                setAddingUserFor(null);
                setShowOrganizationDialog(false);
              })
              .catch(error => {
                enqueueSnackbar(error?.response?.data?.error || error, {
                  variant: 'error',
                });
              });
          }}
        />
      </Grid>
    </div>
  );
}

export default withAlert(Organizations);
