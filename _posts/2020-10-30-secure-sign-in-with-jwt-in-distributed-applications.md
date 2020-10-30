---
title: Secure sign in with JWT in distributed applications
layout: post
tags: [technical, javascript, electron.js, jwt, node.js]
---

Unless you have been living under a rock, you have probably heard of or used in some way or another JWTs (JSON Web Tokens) for passing encrypted data between client and server. JWT has become the standard for authentication and has been around for a decade now but you can still frequently come across projects where they have been implemented in an insecure way.<!--more--> In this article, I am going to show you the quickest way to securely use JWT in distributed applications, specifically for cases where the client contains the JWT decryption code.

### What exactly is JWT and why should you use it?
I won't go in-depth here on JWT as there are a plethora of other sources of information on the subject that go deeper than I ever could. With that said, JWT is basically an encrypted data structure containing three parts: a header, payload, and signature. Each of those parts is an object containing key-value pairs. Much like HTTP headers, the JWT header contains information about the token such as the cryptographic algorithm used to generate the signature. Data in the payload is referred to as claims. There are <a href="https://en.wikipedia.org/wiki/JSON_Web_Token#Standard_fields" target="_BLANK">specific standardized claims</a> that can be expected within your token, however, you can also define custom claims for your application.

For example, with a payload like this:
<pre><code>
{
  "sub": "1234567890",
  "name": "The Protagonist",
  "iat": 1597190400
}
</code></pre>

Encrypted with HS256 (HMAC with SHA-256) using the secret "We Live In A Twilight World" would result in the following token:
<pre><code>
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTk3MTkwNDAwfQ.8pqy_GVwZ2rY-q8Ks4O0NLdKbAr0FQbGZ-Zs8teu6qE
</code></pre>

Sub (subject) and iat (issued at) are both standardized claims and name is a custom claim for the name of the user. You can confirm the token by going <a href="https://jwt.io" target="_BLANK">jwt.io</a> and pasting the token in the decoding field. Without the secret, you can't decode the token and get the data, but with the secret, you can retrieve the payload to do with whatever you choose. While this example uses a plaintext secret for encrypting our payload, it is still much more secure than using a <a href="https://en.wikipedia.org/wiki/Session_(computer_science)" target="_BLANK">session</a> with a key representing the active user session in the database. By eliminating the need for sessions and adding secret we also allow for validating our tokens in a <a href="https://whatis.techtarget.com/definition/stateless" target="_BLANK">stateless manner</a>, meaning our client application can make sure the token is valid and get the decrypted data without contacting our server.

In a distributed application, however, we run into a major issue: the secret to decrypt the token must be present in the source code, which could potentially be accessed by a user. That is why we won't be using a plaintext secret as you will commonly see in basic web tutorials and legacy code that has been retrofitted with a quick-n-dirty JWT implementation. Instead, we will be using an RSA public/private key pair with the SHA-256 algorithm, which is incredibly easy to setup without compromising security. With a public/private key pair, the private key is kept discreetly on the server-side only and can be used to encrypt tokens, while the public key can be distributed as it only allows you to decrypt tokens.

### How can you use JWT?
Let's get into the code now. For this example, I will be using <a href="https://nodejs.org/en/" target="_BLANK">Node.js</a> and <a href="https://expressjs.com/" target="_BLANK">Express</a> along with the <a href="https://www.npmjs.com/package/jsonwebtoken" target="_BLANK">jsonwebtoken</a> module, but you can utilize JWT in almost any popular language and environment.

#### Generating keys
Before we get started in Node, we will need an RSA key pair. You can generate a set of new keys online <a href="https://travistidwell.com/jsencrypt/demo/" target="_BLANK">here</a>. Your result will end up looking something like this:
<pre><code>
-----BEGIN RSA PRIVATE KEY-----
MIIBOQIBAAJAdXBqsntdSJYbyezpmiZCotnpvXnmkiWdJnWYQGJg88yRKiQDeIXh
XtPiwZSGVNfLA9LdbQAejTi91DAyOexQmwIDAQABAkAMYA4+RJWt4nOHMbnkDogT
FRd2afQMDn6i4N1sW3GP/ycbGIsj9VqEcLqdoiCVMbtQZ2BZMk9E0FMxcWNYwRFh
AiEA15apKQPjl5tgjXmbkzsFEPz9C++pZfddwuL1Oe8DVfkCIQCLc+jwrbPEZWWU
EB5hqpqVxJqgwmlQAi/LWqI3KB+wMwIgQlZjuvEtaQswjJfs3UL97hpKqw+V6oBR
Y5R+rNL1DdECICStfsXWmeJ83MOdnbAIZBIiHJ1NpM9DU/jDRMkHB5abAiEAsAjl
ud/47E3Wun68u8NsdA9CGmdc+WVATlZwcNwT8OU=
-----END RSA PRIVATE KEY-----
</code></pre>

<pre><code>
-----BEGIN PUBLIC KEY-----
MFswDQYJKoZIhvcNAQEBBQADSgAwRwJAdXBqsntdSJYbyezpmiZCotnpvXnmkiWd
JnWYQGJg88yRKiQDeIXhXtPiwZSGVNfLA9LdbQAejTi91DAyOexQmwIDAQAB
-----END PUBLIC KEY-----
</code></pre>

Make sure to keep both of those keys safe somewhere secure on your machine. In your Node project, create a /config directory, if one does not already exist, and add your public/private key files as auth-public.key and auth-private.key (you can name the files whatever you like). In a real-world scenario, you would need to generate different key pairs for your different environments (i.e. development, staging, and production) and would want to keep them out of your project and inject them into the environment with variables, but we will ignore that for now. Just don't upload your private key to a public repository and we can consider you good enough for the sake of this example.

#### Server-side
Now you'll do some setup, first install what we need with npm:
<pre><code>
npm i jsonwebtoken file-system express
</code></pre>

And create an index.js file that looks like this:
<pre><code>
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json({ limit: '5mb', extended: true }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(5468, () => console.log(`Server running on http://localhost:${5468}`));
</code></pre>

Now if you run the index file you will have an Express server running on port 5468. Next, you are going to need two different pieces of code, one authentication route to generate a JWT, and authorization middleware to check inbound requests for a token and validate it. Let's start with the simple authentication route to "sign-in" a user.

Add the private key to your index after you require jwt:
<pre><code>
const fs = require('fs');
const privateKey = fs.readFileSync('config/auth-private.key', 'utf8');
</code></pre>

And the sign-in route:
<pre><code>
app.post('/api/auth', function(req, res) {
    let username = req.body.username || '';
    let password = req.body.password || '';

    if (!username.length || !password.length) {
        res.status(400).send();
        return;
    }

    if (username == 'Ladiesman217' && password == 'autobots rule') {
        try {
            let token = jwt.sign({ id: 1, firstName: 'Sam', lastName: 'Witwicky', email: 'Ladiesman217@hotmail.com' }, privateKey, { algorithm: 'RS256', audience: (req.header('X-Client') || '') });

            res.status(200).json({token: token});
        } catch (error) {
            console.error(error);
            res.status(500).send();
        }
    } else {
        res.status(401).send();
    }

    return;
});
</code></pre>

![Postman sign in success](/assets/media/posts/secure-sign-in-with-jwt-in-distributed-applications/postman-sign-in-success.jpg)

Which will result in a token being returned like so, assuming you use the valid login credentials. Using the jsonwebtoken module is pretty straightforward. When generating a token we call jwt.sign() with the payload object, the private key, and finally the options object. One thing to note is that with this specific library we can set certain claims with the options object as I did with the audience. The audience identifies who this token is valid for, so you can send a unique string that identifies the client such as a device id with the request as the X-Client header, and only that client will theoretically be able to decrypt this token. Think of the audience as an added <a href="https://en.wikipedia.org/wiki/Salt_(cryptography)" target="_BLANK">salt</a>.

Now you can move on to the authentication middleware. You will need to require the public key up where you required the private key like so:
<pre><code>
const publicKey = fs.readFileSync('config/auth-public.key', 'utf8');
</code></pre>

Then add the middleware function:
<pre><code>
app.use(function (req, res, next) {
    //any routes that can be accessed without a valid auth token
    let noAuthRequired = [
        '/api/auth'
    ];

    if (!~noAuthRequired.indexOf(req.originalUrl.trim().replace(/\?.*$/, ''))) {
        let token = req.header('Authorization');
        if (!token) {
            res.status(401).send('No authorization token provided.');
            return;
        }

        token = token.replace('Bearer ', '').trim();

        let decoded;
        try {
            decoded = jwt.verify(token, publicKey, { algorithm: 'RS256', audience: (req.header('X-Client') || '') });
        } catch (e) {
            console.error('Token verify error:', e.message);
            res.staus(401).send('Invalid authorization token.');
            return;
        }

        if (!decoded) {
            res.status(500).send('Server failed to authorize client token.');
            return;
        }

        req.tokenData = decoded; //pass decoded token object to the route within the request object
    }

    next();
});
</code></pre>

As you can see it is very similar to the signing of the token but instead, we call jwt.verify() and pass in the token and public key. I also have an array with an indexOf check to decide which routes don't need to have a valid authorization token to be accessed.

If you visit <a href="http://localhost:5468" target="_BLANK">http://localhost:5468</a> in your browser now you should get an error message saying "No authorization token provided." So it worked! If you make the same GET request from <a href="https://www.postman.com/" target="_BLANK">Postman</a> but provide the Bearer Token that we just received from our sign-in route, you should see the original "Hello world!" Obviously, you are going to be protecting your API and not GET routes but this is a JWT tutorial and we aren't going to be building an entire project here, so just use your <a href="https://www.youtube.com/watch?v=NaSd2d5rwPE" target="_BLANK">imagination</a>.

If you'd like to dress this example up a bit you could add a database to store different user credentials along with hashed passwords validated with bcrypt. You could also add a randomized timeout to error responses during the auth request as a rudimentary way to mess with timing attacks like this:
<pre><code>
setTimeout(() => {
    res.status(500).send();
}, Math.floor(Math.random()*1000)+250);
</code></pre>

#### Client-side
Now that you have got an incredibly complex and nearly impenetrable server setup with a JWT implementation, I will show you how you can interact with it from the client-side. This will be brief as I am using Electron.js and it runs on Node, meaning the code is nearly identical. The same modules would be used and you would need to make another /config directory with the public key file ready to be loaded. **Do not put the private key anywhere near your client code.**

To create the sign in call we will need the audience identifier which will be represented by the machine id that is accessible from Electron.js using the <a href="https://www.npmjs.com/package/node-machine-id" target="_BLANK">node-machine-id</a> module.
<pre><code>
npm i node-machine-id
</code></pre>

<pre><code>
const {machineIdSync} = require('node-machine-id'),
	machineId = machineIdSync(true);
</code></pre>

Now you can make a Fetch request to the auth route we made earlier:
<pre><code>
fetch(
    'http://localhost:5468/api/auth',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Client': machineId //add client/audience to all calls
        },
        body: JSON.stringify({
            username: 'Ladiesman217',
            password: 'autobots rule'
        })
    }
)
.then((res) => {
    if (!res.ok) {
        console.error(res);
    } else {
        res.json().then((data) => {
            token = res.token;
            storeValue('token', token);
        });
    }
})
.catch((res) => {
    console.error(res);
});
</code></pre>

The body data you would be getting from your sign-in form. You may also have noticed that I never created the storeValue function. That could any storage function you like to store the retrieved token on the user's system, depending on the platform and environment. If you would like a simple storage class for Electron.js, check out <a href="https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e" target="_BLANK">this article</a>.

Now that we have a token we can add it to any additional API requests by setting it as a header:
<pre><code>
{
	'Authorization': 'Bearer ' + token
}
</code></pre>

Or we can decrypt it for information about the user or anything else we choose to store in the payload. Whenever you open the application, you can check if the token is stored on the device already, and if so, verify it is valid and you just signed in securely without contacting the server. The only key a user could get from going through the source is the public key, which cannot be used to generate a valid token.

### That's a wrap!
A basic setup really is that simple, so stop using plaintext secrets with no expiration or audience claims and take that extra 5 minutes to make your projects more secure. If you are working in ReactNative, instead of storing the user's credentials in the <a href="https://www.npmjs.com/package/react-native-secure-storage" target="_BLANK">keychain/keystore</a> in a plaintext object, consider storing a JWT. Or at the very least, **please stop storing unencrypted user credentials with AsyncStorage!**
