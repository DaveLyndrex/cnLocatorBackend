const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

//GOOGLE AUTH
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '618440151857-g5akj437sqqc1dke9jm66af2jjrc6fe9.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);


const PORT = process.env.PORT || 5000;

// Middleware

app.set('view engine', 'ejs'); //ejs is a template engine
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res)=>{
    res.render('index');
})

app.get('/login', (req, res)=>{
    res.render('login');
})

app.post('/login', (req,res)=>{
    let token = req.body.token;
    console.log(token);
    //asynchronous javascript function to verify the google tokens
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        console.log(payload)
      }
      verify()
      .then(()=>{
        res.cookie('session-token', token);
        res.send('success');
      }).
      catch(console.error);
})
    
app.get('/dashboard', checkAuthenticated, (req, res)=> {
    let user = req.user;
    res.render('dashboard', {user});
})

app.get('/protectedroute', checkAuthenticated, (req, res)=> {
    res.render('protectedroute');
})

app.get('/logout', (req, res)=> {
    res.clearCookie('session-token');
    res.redirect('/login');
})



  
function checkAuthenticated (req,res, next){

    let token = req.cookies['session-token'];

    let user= {};
    //asynchronous javascript function to verify the google tokens
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
      }
      verify()
      .then(()=>{
        req.user = user;
        next();
      })
      .catch(err=>{
          res.redirect('/login')
      })
}

app.listen(PORT, ()=> {
    console.log('Server running on port $(PORT)');
})