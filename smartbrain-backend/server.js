const express = require('express')
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register')
const signin = require('./controllers/signin')
const profile = require('./controllers/profile')
const image = require('./controllers/image')

const db = knex({
    client: 'pg',
    connection: {
        host: 'dpg-cko3l161101c73djm1g0-a',
        user: 'g3njac',
        password: 'EAMccDWiGeFRhUDpDlISiAqHiHKWQiaH',
        database: 'smartbrain_mm96'
    }
});






const app = express();



app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('success')
})





app.post('/signin', (req, res) => {signin.handleSignin(req, res, db, bcrypt)})


app.post('/register', (req, res) => {register.handleRegister(req, res, db, bcrypt)})


app.get('/profile/:id', (req, res) => {profile.handleProfileGet(req, res, db)})


app.put('/image', (req, res) => {image.handleImage(req, res, db)})








app.listen(3000, ()=> {
    console.log('app is running on port 3000');
})

 

/*
HOW EVERYTHING WILL WORK

/ --> res = this is working
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user

*/