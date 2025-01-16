# Order Hoarder with Supabase

## What is this?
This sample app takes our previous implementation of [Order Hoarder](https://github.com/Square-Developers/order-hoarder) and strips out the custom auth solution and replaces it with [Supabase](https://supabase.com/auth)'s authentication offering.

## Getting Started

### Install the needed dependencies
```bash
npm i
```
### Update environment variables
Copy the file `.env.example` to `.env`

```bash
cp .env.example .env
```

#### Square Provided Values
Create an account at [developer.squareup.com](https://developer.squareup.com), and create a new App. In your new app's settings, navigate to `OAuth` in the sidebar. You will find the value for your `application id` to be used for the `APP_ID=` environment variable. You will also find the value for your `application secret` to be used for the `APPLICATION_SECRET=` environment variable.

- While in the app settings you should also update the value of the `Redirect URL` to be `http://localhost:3000/api/square/callback`

#### Supabase Provided Values
Create an account at [https://supabase.com/](https://supabase.com/), and start a new project. In the `project settings > API` section of your project you will find the values for `NEXT_PUBLIC_SUPABASE_URL=yourSubabaseUrl`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=yourAnonKey`, and
`SUPABASE_SERVICE_KEY=yourServiceRoleKey` 


- While in your supabase project settings, go to `authentication > providers > email` and disable `Confirm Email` - this will make it so you can login with made up email addresses, and not have to confirm your email.

#### Creating an AES Key for encrypting values
```js
// you can run this command in a node repl to get a good value for the `REACT_AES_KEY` field
crypto.randomBytes(32).toString('hex').substr(0,32)
```

### Start the development server
```bash
npm run dev
```

### Using the App
Once the local server is up and running, open your browser to `http://localhost:3000` - Click `sign up`, fill out the fields, and click `continue`.

Once logged into the dashboard, navigate to the settings and connect to Square. You will need to open a [sandbox seller test account](https://developer.squareup.com/console/en/sandbox-test-accounts) in another tab in your browser, before you click `connect`. 

Once connected to Square, you will be able to choose from your different square locations, and see some basic order info from those locations (if any exists). Otherwise the values will be 0. 

## FAQs

#### How do I test webhooks with square sandbox `localhost`?
- In order to test webhooks from Square, you will need to set up [ngrok](https://ngrok.com/), and expose your `localhost:3000` server so that it has a publicly available ip address. You will then need to set up a webhook in your developer account that is subscribed to the `revoke_access` endpoint. More instructions on webhooks can be found [here](https://developer.squareup.com/docs/webhooks/overview)

- The webhook subscription URL you provide in Square should look like `https://{YOUR_NGROK_DOMAIN}/api/webhooks/revoked_access`

#### Running into issues?
If you are running into problems with the live demo, please reach out on our [discord](https://discord.gg/squaredev)

