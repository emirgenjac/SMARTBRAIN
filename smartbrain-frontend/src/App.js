import React, { Component } from 'react';
import ParticlesBg from 'particles-bg';
import Navigation from './components/navigation/Navigation';
import Logo from './components/logo/Logo';
import Rank from './components/rank/Rank';
import ImageLinkForm from './components/imagelinkform/ImageLinkForm';
import FaceRecognition from './components/facerecognition/FaceRecognition';
import SignIn from './components/signin/SignIn';
import Register from './components/register/Register';
import { apiFetch } from './api';
import { detectFaces, loadFaceModels } from './face';
import './App.css';

const emptyUser = {
  id: '',
  name: '',
  email: '',
  entries: 0,
  joined: ''
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      boxes: [],
      route: 'signin',
      isSignedIn: false,
      detectMessage: '',
      user: emptyUser
    };
    this.detectRequest = 0;
  }

  componentDidMount() {
    loadFaceModels().catch((err) => console.log('model load error', err));
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: Number(data.entries) || 0,
        joined: data.joined
      }
    });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  incrementEntries = () => {
    apiFetch('/image', { method: 'put' })
      .then((response) => response.json())
      .then((count) => {
        if (!Number.isFinite(count)) return;
        this.setState((prev) => ({
          user: { ...prev.user, entries: count }
        }));
      })
      .catch((err) => console.log('entry update error', err));
  }

  onSample = () => {
    this.onButtonSubmit('https://raw.githubusercontent.com/ageitgey/face_recognition/master/examples/obama.jpg');
  }

  onButtonSubmit = (url) => {
    const input = (typeof url === 'string' ? url : this.state.input).trim();
    if (!input) {
      this.setState({ detectMessage: 'Paste an image URL first.' });
      return;
    }

    this.detectRequest += 1;
    const requestId = this.detectRequest;
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = '';
    }
    this.setState({ imageUrl: '', boxes: [], detectMessage: 'Detecting...' });

    apiFetch(`/image-proxy?url=${encodeURIComponent(input)}`)
      .then(async (response) => {
        if (requestId !== this.detectRequest) return null;
        if (response.status === 401) {
          this.setState({ detectMessage: 'Sign in again to detect faces.' });
          return null;
        }
        if (!response.ok) {
          this.setState({ detectMessage: 'Could not load that image. Use a direct link to a photo on the public web.' });
          return null;
        }
        return response.blob();
      })
      .then((blob) => {
        if (!blob || requestId !== this.detectRequest) return;
        this.objectUrl = URL.createObjectURL(blob);
        this.setState({ imageUrl: this.objectUrl });
      })
      .catch(() => {
        if (requestId !== this.detectRequest) return;
        this.setState({ detectMessage: 'Could not load that image. Use a direct link to a photo on the public web.' });
      });
  }

  onImageLoad = async (event) => {
    const requestId = this.detectRequest;
    const image = event.target;
    if (!image.naturalWidth || !image.naturalHeight) {
      this.setState({ detectMessage: 'Could not read that image.' });
      return;
    }

    try {
      const boxes = await detectFaces(image);
      if (requestId !== this.detectRequest) return;
      if (!boxes.length) {
        this.setState({ boxes: [], detectMessage: 'No face found in that image. Use a direct link to a photo.' });
        return;
      }
      this.setState({ boxes, detectMessage: '' });
      this.incrementEntries();
    } catch (err) {
      if (requestId !== this.detectRequest) return;
      console.log('detect error', err);
      const modelFailed = /json|model|fetch|Unexpected token/i.test(err && err.message);
      this.setState({
        detectMessage: modelFailed
          ? 'The face model failed to load. Refresh the page and try again.'
          : 'Could not detect a face in that image.'
      });
    }
  }

  onImageError = () => {
    this.setState({
      boxes: [],
      detectMessage: 'Could not load that image. Use a direct link to a jpg or png.'
    });
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.detectRequest += 1;
      if (this.objectUrl) {
        URL.revokeObjectURL(this.objectUrl);
        this.objectUrl = '';
      }
      apiFetch('/signout', { method: 'post' }).catch(() => {});
      this.setState({
        input: '',
        imageUrl: '',
        boxes: [],
        route: 'signin',
        isSignedIn: false,
        detectMessage: '',
        user: emptyUser
      });
      return;
    }

    if (route === 'home') {
      this.setState({ isSignedIn: true, route: 'home' });
      return;
    }

    this.setState({ route });
  }

  render() {
    const { isSignedIn, route, boxes, imageUrl, detectMessage } = this.state;
    const { name, entries } = this.state.user;

    return (
      <div className="App">
        <ParticlesBg className="particles" type="square" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {route === 'home' ? (
          <div>
            <Logo />
            <Rank name={name} entries={entries} />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
              onSample={this.onSample}
            />
            {detectMessage ? <p className="f4">{detectMessage}</p> : null}
            <FaceRecognition
              boxes={boxes}
              imageUrl={imageUrl}
              onImageLoad={this.onImageLoad}
              onImageError={this.onImageError}
            />
          </div>
        ) : (
          route === 'signin' ? (
            <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          ) : (
            <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
        )}
      </div>
    );
  }
}

export default App;
