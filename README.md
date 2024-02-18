# [Personal Site](https://prabinpoudel.com.np) Source Code

Inspired and cloned from [Made Mistakes](https://mademistakes.com/) when it was open sourced! The author reverted to close sourced after few months.

## Getting started

1. **Install dependencies**

   ```shell
   npm install --legacy-peer-deps
   ```

2. **Add `.env` file to the root with your GOOGLE_ANALYTICS_TRACKING_ID**

   ```env file
   GOOGLE_ANALYTICS_TRACKING_ID = 'your_google_analytics_tracking_id'
   ```

   **_Note_:** do not commit this file.

3. **Start developing.**

   ```shell
   gatsby develop
   ```

   **_Note_:** When developing on Windows prepend all Gatsby commands with `dotenv` to load environment variables. e.g. `dotenv gatsby build`
