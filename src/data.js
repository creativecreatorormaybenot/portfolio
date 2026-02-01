// Portfolio data - all projects and links from the original portfolio
export const portfolioData = {
  name: "creativemaybeno",
  tagline: "Flutter Developer | Open Source Contributor | Creative Coder",

  socials: [
    { tag: "@creativecreatorormaybenot", site: "GitHub", url: "https://github.com/creativecreatorormaybenot" },
    { tag: "@creativemaybeno", site: "Twitter", url: "https://twitter.com/creativemaybeno" },
    { tag: "@creativecreatorormaybenot", site: "StackOverflow", url: "https://stackoverflow.com/users/6509751" },
    { tag: "@creativecreatorormaybenot", site: "Medium", url: "https://medium.com/@creativecreatorormaybenot" },
    { tag: "@creativecreatorormaybenot", site: "YouTube", url: "https://www.youtube.com/channel/UCDf73A8sVgbYKX192SLMn1w" },
    { tag: "@creativemaybeno", site: "Reddit", url: "https://reddit.com/u/creativemaybeno" }
  ],

  projects: [
    {
      title: "GitHub Tracker",
      description: "Open source application that keeps track of the top 100 software repos on GitHub. Includes a Flutter web app and TypeScript backend with Twitter bot.",
      tags: ["TypeScript", "Open source", "Flutter", "Firebase"],
      links: [
        { site: "GitHub", url: "https://github.com/creativecreatorormaybenot/github-tracker" },
        { site: "Web", hint: "Web app", url: "https://ght.creativemaybeno.dev" },
        { site: "Twitter", hint: "Twitter bot", url: "https://twitter.com/github_tracker" }
      ],
      color: "#00d4ff"
    },
    {
      title: "Math Keyboard",
      description: "A fully fledged math keyboard package for Flutter. TeX typesetting, expression evaluation, and deep framework integration.",
      tags: ["Flutter", "Open source", "Dart"],
      links: [
        { site: "GitHub", url: "https://github.com/simpleclub/math_keyboard" },
        { site: "Web", hint: "Live demo", url: "https://simpleclub.github.io/math_keyboard" },
        { site: "Dart Pub", url: "https://pub.dev/packages/math_keyboard" }
      ],
      color: "#ff6600"
    },
    {
      title: "Fireworks",
      description: "2D canvas-based fireworks animations in Flutter. Customizable web app with easy integration into any Flutter project.",
      tags: ["Flutter", "Open source", "Design"],
      links: [
        { site: "GitHub", url: "https://github.com/creativecreatorormaybenot/fireworks" },
        { site: "Web", hint: "Live demo", url: "https://fireworks.creativemaybeno.dev" }
      ],
      color: "#ff3366"
    },
    {
      title: "Funvas",
      description: "Time-based canvas animations in Flutter. Inspired by Dwitter, using trigonometric functions for mesmerizing visual effects.",
      tags: ["Flutter", "Open source", "Creative"],
      links: [
        { site: "GitHub", url: "https://github.com/creativecreatorormaybenot/funvas" },
        { site: "Web", hint: "Live demo", url: "https://funvas.creativemaybeno.dev" },
        { site: "Dart Pub", url: "https://pub.dev/packages/funvas" }
      ],
      color: "#00ff88"
    },
    {
      title: "CaTeX",
      description: "Dart-native Flutter TeX renderer. Custom parser and rendering engine for high-performance mathematical typesetting.",
      tags: ["Flutter", "Open source", "Article"],
      links: [
        { site: "GitHub", url: "https://github.com/simpleclub/CaTeX" },
        { site: "Web", hint: "Demo", url: "https://simpleclub.github.io/CaTeX" },
        { site: "Dart Pub", url: "https://pub.dev/packages/catex" }
      ],
      color: "#9966ff"
    },
    {
      title: "Flutter Clock",
      description: "Winner for Code Quality in the Flutter Clock challenge. Custom render objects with pixel-perfect skeuomorphic design.",
      tags: ["Flutter", "Design", "Award Winner"],
      links: [
        { site: "GitHub", url: "https://github.com/creativecreatorormaybenot/clock" },
        { site: "Web", hint: "Live clock", url: "https://clock.creativemaybeno.dev" },
        { site: "Medium", hint: "Article", url: "https://medium.com/flutter-community/pure-flutterclock-face-every-line-customly-drawn-with-pixel-perfect-control-c27cba427801" }
      ],
      color: "#ffcc00"
    },
    {
      title: "Wakelock Plugin",
      description: "Keep the device screen awake in Flutter apps. Cross-platform support for Android, iOS, and Web.",
      tags: ["Flutter", "Plugin", "Cross-platform"],
      links: [
        { site: "Dart Pub", url: "https://pub.dev/packages/wakelock" },
        { site: "GitHub", url: "https://github.com/creativecreatorormaybenot/wakelock" }
      ],
      color: "#00d4ff"
    },
    {
      title: "Aso App",
      description: "Firebase-driven Flutter app with custom C++ animation editor. Complete with designs and promotional content.",
      tags: ["Flutter", "Firebase", "C++"],
      links: [
        { site: "Web", url: "https://aso.incom.xyz" },
        { site: "Play Store", url: "https://play.google.com/store/apps/details?id=incom.aso" },
        { site: "YouTube", hint: "Trailer", url: "https://youtu.be/OFxJbqVlW_U" }
      ],
      color: "#ff6600"
    },
    {
      title: "Feature Discovery",
      description: "Flutter package implementing tap target feature discovery from Material design spec. Major contributor.",
      tags: ["Flutter", "Open source", "Design"],
      links: [
        { site: "GitHub", url: "https://github.com/ayalma/feature_discovery" },
        { site: "Dart Pub", url: "https://pub.dev/packages/feature_discovery" }
      ],
      color: "#ff3366"
    },
    {
      title: "StackOverflow",
      description: "Active contributor sharing Flutter knowledge through detailed, article-quality answers.",
      tags: ["Flutter", "Community", "Education"],
      links: [
        { site: "StackOverflow", url: "https://stackoverflow.com/users/6509751" },
        { site: "Medium", hint: "Related article", url: "https://medium.com/@creativecreatorormaybenot/sites-shamelessly-ripping-off-stack-overflow-content-4c10597ade57" }
      ],
      color: "#f48024"
    },
    {
      title: "Flutter Plugins",
      description: "Contributions to official Flutter plugins, packages, and Firebase plugins.",
      tags: ["Flutter", "Open source", "Firebase"],
      links: [
        { site: "GitHub", hint: "flutter/plugins", url: "https://github.com/flutter/plugins/commits?author=creativecreatorormaybenot" },
        { site: "GitHub", hint: "flutterfire", url: "https://github.com/FirebaseExtended/flutterfire/commits?author=creativecreatorormaybenot" }
      ],
      color: "#02569b"
    },
    {
      title: "Flutter Framework",
      description: "Contributions to the Flutter framework core at flutter/flutter.",
      tags: ["Flutter", "Open source", "Core"],
      links: [
        { site: "GitHub", url: "https://github.com/flutter/flutter/commits?author=creativecreatorormaybenot" }
      ],
      color: "#00d4ff"
    },
    {
      title: "URL Strategy",
      description: "Convenience plugin for Flutter web apps to easily use the path URL strategy.",
      tags: ["Flutter", "Web", "Open source"],
      links: [
        { site: "GitHub", url: "https://github.com/simpleclub/url_strategy" },
        { site: "Dart Pub", url: "https://pub.dev/packages/url_strategy" }
      ],
      color: "#00ff88"
    },
    {
      title: "This Portfolio",
      description: "A Three.js 3D experience with Tron: Legacy aesthetics. Scroll through neon-lit projects in an immersive environment.",
      tags: ["Three.js", "Web", "Creative"],
      links: [
        { site: "GitHub", url: "https://github.com/creativecreatorormaybenot/portfolio" }
      ],
      color: "#ff6600"
    }
  ],

  endSection: {
    servicesTitle: "Services",
    servicesSubtitle: "Coming Soon",
    email: "creativecreatorormaybenot@gmail.com",
    calendlyNote: "Calendly booking available soon"
  }
};
