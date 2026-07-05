# Native Mobile Roadmap

CivicTrust should stay PWA-first for demo and early production validation. The current Next.js app already gives the team a mobile app-like experience with Vercel deployment and no native build pipeline.

## Option A: PWA-First

Best for:

- Demo readiness
- Early users
- Fast iteration
- Vercel preview URLs
- Avoiding app store overhead

How it works:

```text
Mobile browser or installed PWA
Next.js frontend
pages/api backend routes
Prisma / PostgreSQL
Stellar Horizon / Friendbot APIs
```

Benefits:

- Uses the current codebase.
- Keeps backend logic on Vercel.
- Ships updates immediately.
- Works on iPhone Safari, Android Chrome, and desktop browsers.
- Avoids Xcode, Android Studio, signing certificates, and app store review.

Limitations:

- Mobile wallet handoff can vary.
- Push notifications need extra setup.
- Some native APIs are limited compared with a true native app.

Recommendation: use this path now.

## Option B: Capacitor Wrapper

Best later when:

- The product is stable.
- The app shell and navigation are unlikely to churn.
- There is a clear need for app store distribution.
- Native device APIs are required.

How it would work:

```text
iOS / Android Capacitor shell
Hosted or bundled web frontend
Vercel backend APIs
Prisma / PostgreSQL on the server
Stellar Horizon / Friendbot APIs on the server
```

Important constraints:

- Do not run Prisma inside the native app.
- Do not put database secrets in the native app.
- Do not move server-only Stellar wallet logic into the native app.
- Keep Vercel as the backend.

Capacitor requirements:

- Xcode for iOS builds.
- Android Studio for Android builds.
- App icons and splash assets.
- App signing.
- Store accounts and review process.
- A plan for environment-specific API base URLs.

Recommendation: do not implement Capacitor yet. Revisit after the PWA demo has stable workflows and the team knows which native-only features are truly needed.

## Suggested Timeline

1. Stabilize the PWA and Vercel deployment.
2. Run mobile-browser demos with real users.
3. Fix any mobile UX issues found during demos.
4. Decide whether native distribution is actually needed.
5. Prototype Capacitor in a branch only after the web app stabilizes.
