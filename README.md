# Prerequisites
- Should have Node.js installed
- Package manager: `pnpm` installed
  ```
  npm install -g pnpm
  ```
# How to use
- Clone this repository
  ```
  git clone https://github.com/toygr/jay-feed-script
  ```
- Open source code
- Place private key
  - Open `key.ts` file
  - Paste private key here
    ```
    export const adminKey = Keypair.fromSecretKey(new Uint8Array([0, 0, 0, 0, ...]))
    ```
- Install dependencies
  ```
  pnpm install
  ```
- Run script
  ```
  pnpm run dev
  ```
# How to get result
- Successful feed is recorded in `Succeeded.txt` file.
- Failed feed is recorded in `Failed.txt` file.
- Analyze these files for more information.