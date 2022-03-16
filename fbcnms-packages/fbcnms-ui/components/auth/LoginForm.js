/* eslint-disable header/header */
/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {ElementRef} from 'react';

import Button from '../design-system/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import React from 'react';
import Text from '../design-system/Text';
import TextField from '@material-ui/core/TextField';

import {AltFormField} from '../design-system/FormField/FormField';
import {withStyles} from '@material-ui/core/styles';

const ENTER_KEY = 13;
const styles = {
  capitalize: {
    textTransform: 'capitalize',
  },
  card: {
    maxWidth: '400px',
    margin: '24px auto 0',
    padding: '20px 0',
  },
  cardContent: {
    padding: '0 24px',
  },
  input: {
    display: 'inline-flex',
    width: '100%',
    margin: '5px 0',
  },
  footer: {
    padding: '0 24px',
  },
  login: {
    marginTop: '10%',
  },
  title: {
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    margin: '12px auto 0',
    flexDirection: 'column',
    maxWidth: '400px',
    alignItems: 'start',
  },
  formTitle: {
    marginBottom: '16px',
    textAlign: 'left',
    display: 'block',
    fontSize: '20px',
  },
  submitButtom: {
    width: '100%',
  },
};

type Props = {
  title: string,
  csrfToken: string,
  error?: string,
  classes: {[string]: string},
  action: string,
  ssoEnabled?: boolean,
  ssoAction?: string,
};

type State = {};

const HOST_PORTAL_TITLE = 'Magma Host Portal';
const ORGANIZATION_PORTAL_TITLE = 'Magma Organization Portal';

class LoginForm extends React.Component<Props, State> {
  form: ElementRef<any>;

  render() {
    const {classes, csrfToken, ssoEnabled, ssoAction} = this.props;
    const error = this.props.error ? (
      <FormLabel error>{this.props.error}</FormLabel>
    ) : null;
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    const hostname = window.location.hostname;
    const organization: string = hostname.slice(0, hostname.indexOf('.'));
    const hostPortal: boolean = organization === 'host';
    if (ssoEnabled) {
      return (
        <Grid className={classes.login}>
          <Grid container>
            <Grid className={classes.title} item xs={12}>
              {!hostPortal && (
                <Text className={classes.capitalize} variant="h5">
                  {organization}
                </Text>
              )}
              <Text
                color={hostPortal ? 'regular' : 'gray'}
                variant={hostPortal ? 'h5' : 'subtitle1'}>
                {hostPortal ? HOST_PORTAL_TITLE : ORGANIZATION_PORTAL_TITLE}
              </Text>
            </Grid>
            <Grid item xs={12}>
              <Card raised={true} className={classes.card}>
                <CardContent>
                  <Text className={classes.title} variant="h6">
                    {`Log in to ${
                      hostPortal ? 'host' : organization
                    } user account`}
                  </Text>
                  {error}
                </CardContent>
                <CardActions className={classes.footer}>
                  <Button
                    skin="comet"
                    className={classes.submitButtom}
                    onClick={() => {
                      window.location =
                        (ssoAction || '') + window.location.search;
                    }}>
                    Login
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid className={classes.login}>
        <Grid container>
          <Grid className={classes.title} item xs={12}>
            {!hostPortal && (
              <Text className={classes.capitalize} variant="h5">
                {organization}
              </Text>
            )}
            <Text
              color={hostPortal ? 'regular' : 'gray'}
              variant={hostPortal ? 'h5' : 'subtitle1'}>
              {hostPortal ? HOST_PORTAL_TITLE : ORGANIZATION_PORTAL_TITLE}
            </Text>
          </Grid>
          <Grid item xs={12}>
            <Card raised={true} className={classes.card}>
              <form
                ref={ref => (this.form = ref)}
                method="post"
                action={this.props.action}>
                <input type="hidden" name="_csrf" value={csrfToken} />
                <input type="hidden" name="to" value={to} />
                <CardContent className={classes.cardContent}>
                  <Text className={classes.formTitle} variant="h5">
                    {`Log in to ${
                      hostPortal ? 'host' : organization
                    } user account`}
                  </Text>
                  {error}
                  <AltFormField disableGutters label={'Email'}>
                    <TextField
                      variant="outlined"
                      name="email"
                      placeholder="Email"
                      className={classes.input}
                      onKeyUp={key =>
                        key.keyCode === ENTER_KEY && this.form.submit()
                      }
                    />
                  </AltFormField>
                  <AltFormField disableGutters label={'Password'}>
                    <TextField
                      variant="outlined"
                      name="password"
                      placeholder="Password"
                      type="password"
                      className={classes.input}
                      onKeyUp={key =>
                        key.keyCode === ENTER_KEY && this.form.submit()
                      }
                    />
                  </AltFormField>
                </CardContent>
                <CardActions className={classes.footer}>
                  <Button
                    skin="comet"
                    className={classes.submitButtom}
                    onClick={() => this.form.submit()}>
                    Login
                  </Button>
                </CardActions>
              </form>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(LoginForm);
