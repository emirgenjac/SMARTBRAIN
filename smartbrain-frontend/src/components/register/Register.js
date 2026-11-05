import React, { Component } from 'react';
import { apiFetch } from '../../api';

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      name: '',
      error: ''
    };
  }

  onNameChange = (event) => {
    this.setState({ name: event.target.value });
  }

  onEmailChange = (event) => {
    this.setState({ email: event.target.value });
  }

  onPasswordChange = (event) => {
    this.setState({ password: event.target.value });
  }

  onSubmitRegister = () => {
    const { onRouteChange, loadUser } = this.props;
    const { email, name, password } = this.state;
    this.setState({ error: '' });

    apiFetch('/register', {
      method: 'post',
      body: JSON.stringify({ email, password, name })
    })
      .then((response) => response.json().then((user) => ({ ok: response.ok, user })))
      .then(({ ok, user }) => {
        if (ok && user.id) {
          loadUser(user);
          onRouteChange('home');
        } else if (typeof user === 'string' && user !== 'unable to register') {
          this.setState({ error: user });
        } else {
          this.setState({ error: 'Could not register. Check the fields or use a different email.' });
        }
      })
      .catch(() => this.setState({ error: 'Could not reach the server.' }));
  }

  render() {
    const { onNameChange, onEmailChange, onPasswordChange, onSubmitRegister } = this;
    return (
      <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
        <main className="pa4 black-80">
          <div className="measure">
            <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
              <legend className="f1 fw6 ph0 mh0">Register</legend>
              <div className="mt3">
                <label className="db fw6 lh-copy f6" htmlFor="name">Name</label>
                <input onChange={onNameChange} className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="text" name="name" id="name" />
              </div>
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
              <input onClick={onSubmitRegister} className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib" type="submit" value="Register" />
            </div>
            {this.state.error ? <p className="f6 dark-red mt3 mb0">{this.state.error}</p> : null}
          </div>
        </main>
      </article>
    );
  }
}

export default Register;
