## Flowstation frontend

- Next 12
- React 17
- React-Redux for global state
- Tailwind CSS (classes applied in JSX)
- Sentry (error tracking)
- Cypress (for frontend testing) - setup but not used
- Localisation - setup in an old-fashioned way and not used
- All typescript

Please make sure you have the correct .env file (maybe you need to edit the API_URL)

```bash
NEXT_PUBLIC_CHAIN_ID=4
NEXT_PUBLIC_NODE=https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
NEXT_PUBLIC_SCAN_URL=https://rinkeby.etherscan.io/
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_GTAG=GTM-TJMW7F7
```

To run the frontend code, see the script belows:

```bash
cd frontend
# install packages
yarn
# run project
yarn dev
```