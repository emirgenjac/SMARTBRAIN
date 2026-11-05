import React, { Component } from 'react';
import { apiFetch } from '../../api';

class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signInEmail: '',
      signInPassword: '',
      error: ''
    };
  }

  onEmailChange = (event) => {
    this.setState({ signInEmail: event.target.value });
  }

  onPasswordChange = (event) => {
    this.setState({ signInPassword: event.target.value });
  }

  onSubmitSignIn = () => {
    const { signInEmail, signInPassword } = this.state;
    const { loadUser, onRouteChange } = this.props;
    this.setState({ error: '' });

    apiFetch('/signin', {
      method: 'post',
      body: JSON.stringify({
        email: signInEmail,
        password: signInPassword
      })
    })
      .then((response) => response.json().then((user) => ({ ok: response.ok, user })))
      .then(({ ok, user }) => {
        if (ok && user.id) {
          loadUser(user);
          onRouteChange('home');
        } else {
          this.setState({ error: 'Wrong email or password.' });
        }
      })
      .catch(() => this.setState({ error: 'Could not reach the server.' }));
  }

  render() {
    const { onRouteChange } = this.props;
    const { onEmailChange, onPasswordChange, onSubmitSignIn } = this;
    return (
      <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
        <main className="pa4 black-80">
          <div className="measure">
            <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
              <legend className="f1 fw6 ph0 mh0">Sign In</legend>
              <div className="mt3">
                <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                <input onChange={onEmailChange} className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="email" name="email-address" id="email-address" />
              </div>
              <div className="mv3">
                <label className="db fw6 lh-copy f6" htmlFor="password">Password</label>
                <input onChange={onPasswordChange} className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="password" name="password" id="password" />
              </div>
            </fieldset>
            <div>
              <input onClick={onSubmitSignIn} className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib" type="submit" value="Sign in" />
            </div>
            {this.state.error ? <p className="f6 dark-red mt3 mb0">{this.state.error}</p> : null}
            <div className="lh-copy mt3">
              <p onClick={() => onRouteChange('register')} className="f6 pointer link dim black db">Register</p>
            </div>
          </div>
        </main>
      </article>
    );
  }
}

export default SignIn;
