/* eslint-disable no-useless-concat */
/* eslint-disable no-unused-vars */

//react
import React, { Component } from 'react';
//api
import Clarifai from 'clarifai'
//background
import ParticlesBg from 'particles-bg'
//components
import Navigation from './components/navigation/Navigation';
import Logo from './components/logo/Logo';
import Rank from './components/rank/Rank';
import ImageLinkForm from './components/imagelinkform/ImageLinkForm';
import FaceRecognition from './components/facerecognition/FaceRecognition'
import SignIn from './components/signin/SignIn';
import Register from './components/register/Register';
//css
import './App.css';


const app = new Clarifai.App ( 
  {
  apiKey: '06391705944944e1a2a891d15bbdf86a'
  }
);




///////////////////////////////////////////////////////////////////////////////////////////////////
    // In this section, we set the user authentication, user and app ID, model details, and the URL
    // of the image we want as an input. Change these strings to run your own example.
    //////////////////////////////////////////////////////////////////////////////////////////////////
    function returnClarifaiRequestOptions(imageUrl) {
      // Your PAT (Personal Access Token) can be found in the portal under Authentification
      const PAT = '726c51c2e48a47958a5fa17bbb1cb9d3';
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
      const USER_ID = 'g3njac';       
      const APP_ID = 'test';
    // Change these to whatever model and image URL you want to use
      const MODEL_ID = 'face-detection';
      const MODEL_VERSION_ID = 'aa7f35c01e0642fda5cf400f543e7c40';    
      const IMAGE_URL = imageUrl;

      const raw = JSON.stringify({
        "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
      },

      "inputs": [
          {
              "data": {
                  "image": {
                      "url": IMAGE_URL
                  }
              }
          }
      ]
  });

  return  {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
    },
    body: raw
};

    }


class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'home',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user : {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState (
      {
      box: box
      }
    );
  }

  onInputChange = (event) => {
    this.setState (
      {
        input: event.target.value
      }
    );
  }

  onButtonSubmit = () => {
    const { input } = this.state;
    this.setState({imageUrl: input})
    fetch(`https://api.clarifai.com/v2/models/face-detection/outputs`, returnClarifaiRequestOptions(input))
        .then(response => response.json())
        .then(response => {
          if (response){
            fetch('http://localhost:3000/image', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                id: this.state.user.id
              })
            })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, {entries: count}))
            })
            .catch(console.log)
          }
          this.displayFaceBox(this.calculateFaceLocation(response))
        }).catch(err => console.log('api error', err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({
        input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }})

    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }

    this.setState({route: route})
  }

  render() {
    //DESTRUCTURING
    const { isSignedIn, route, box, imageUrl } = this.state;
    const { onRouteChange, onInputChange, onButtonSubmit, loadUser } = this;
    const { name, entries } = this.state.user;

  return (
    <div className="App">
      <ParticlesBg className="particles" type="square" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange}/>
      {route === 'home' ?
        <div>  
         <Logo />
         <Rank name={name} entries={entries} />
         <ImageLinkForm onInputChange={onInputChange} onButtonSubmit={onButtonSubmit}/>
         <FaceRecognition box={box} imageUrl={imageUrl}/>
        </div>
      : 
        (
          route === 'signin' ?
          <SignIn loadUser={loadUser} onRouteChange={onRouteChange}/> :
          <Register loadUser={loadUser} onRouteChange={onRouteChange}/>
        )
      } 
    </div>
  );
 }
}

export default App;
