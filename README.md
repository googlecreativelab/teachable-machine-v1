# Teachable Machine 
## About
Teachable Machine is an experiment that makes it easier for anyone to explore machine learning, live in the browser – no coding required. Learn more about the experiment and try it yourself on [g.co/teachablemachine](https://g.co/teachablemachine). 

The experiment is built using the [deeplearn.js](https://github.com/PAIR-code/deeplearnjs) library.

## Development
#### Install dependencies by running (similar to `npm install`)
```
yarn
```

#### Start local server by running 
```
yarn run watch
```


#### Build project
```
yarn build
```

#### Code Styles
- There’s a pre-commit hook set up that will prevent commits when there are errors
- Run `yarn eslint` for es6 errors & warnings
- Run `yarn stylint` for stylus errors & warnings

#### To run https locally:
https is required to get camera permissions to work when not working with `localhost`

1. Generate Keys
```
openssl genrsa -out server.key 2048
openssl req -new -x509 -sha256 -key server.key -out server.cer -days 365 -subj /CN=YOUR_IP
```
2. Use `yarn run watch-https`
3. Go to `https://YOUR_IP:3000`, then accept the insecure privacy notice, and proceed.

## Credit
This is not an official Google product, but an experiment that was a collaborative effort by friends from [Støj](http://stoj.io/), [Use All Five](https://useallfive.com/) and Creative Lab and [PAIR](https://ai.google/pair/) teams at Google.
