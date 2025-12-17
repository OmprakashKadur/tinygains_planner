# TinyGains Planner

**TinyGains Planner** is a comprehensive productivity application designed to help users attain their goals through structured planning. Built with **Next.js 15**, **Supabase**, and **Tailwind CSS**, it features weekly and daily planning views, subscription management via **Razorpay**, and a responsive, modern UI.

## 🚀 Features

- **Goal Planning**: Hierarchy of Yearly, Monthly, Weekly, and Daily goals.
- **Planner Interface**: Intuitive drag-and-drop or list-based planner for organizing tasks.
- **Subscription Management**: Pro/Free tiers integrated with Razorpay for payments.
- **Focus Mode**: Tools to track focus blocks and energy levels.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS.
- **Authentication**: Secure user authentication powered by Supabase Auth.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Backend/DB**: [Supabase](https://supabase.com/) (PostgreSQL, Auth)
- **Payments**: [Razorpay](https://razorpay.com/)
- **State/Utils**: `date-fns`, `clsx`, `tailwind-merge`

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn** or **pnpm**
- **Supabase Account**: For database and authentication.
- **Razorpay Account**: For payment integration (Test mode).

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/tinygains-planner.git
    cd tinygains-planner
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory (copy from `.env.example` if available) and add your credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    ```

4.  **Database Setup:**
    Ensure your Supabase project has the required tables (`plans`, `subscriptions`, `goals` hierarchy, etc.). You may need to run migration scripts if provided in `supabase/migrations`.

### Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint checks.
- `npm run format`: Formats code using Prettier.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
