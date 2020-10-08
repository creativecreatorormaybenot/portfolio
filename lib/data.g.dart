// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'data.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PortfolioData _$PortfolioDataFromJson(Map<String, dynamic> json) {
  $checkKeys(json, requiredKeys: const [
    'filters',
    'colors',
    'icons',
    'socials',
    'projects'
  ]);
  return PortfolioData(
    (json['filters'] as List)
        .map((e) => Filter.fromJson(e as Map<String, dynamic>))
        .toList(),
    PortfolioData.colorsFromJson(json['colors'] as Map<String, String>),
    PortfolioData.iconsFromJson(json['icons'] as Map<String, String>),
    (json['socials'] as List)
        .map((e) => Social.fromJson(e as Map<String, dynamic>))
        .toList(),
    (json['projects'] as List)
        .map((e) => Project.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

Filter _$FilterFromJson(Map<String, dynamic> json) {
  return Filter(
    json['title'] as String,
    (json['items'] as List).map((e) => e as String).toList(),
  );
}

Social _$SocialFromJson(Map<String, dynamic> json) {
  return Social(
    json['tag'] as String,
    json['site'] as String,
    json['url'] as String,
  );
}

Project _$ProjectFromJson(Map<String, dynamic> json) {
  return Project(
    json['title'] as String,
    json['description'] as String,
    (json['tags'] as List).map((e) => e as String).toList(),
    (json['links'] as List)
        .map((e) => Link.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

Link _$LinkFromJson(Map<String, dynamic> json) {
  $checkKeys(json, requiredKeys: const ['url']);
  return Link(
    json['site'] as String? ?? 'Web',
    json['url'] as String,
    json['hint'] as String,
  );
}

// **************************************************************************
// JsonLiteralGenerator
// **************************************************************************

final _$portfolioDataJsonLiteral = {
  'filters': [
    {
      'title': 'Categories',
      'items': ['Open source', 'Flutter', 'Firebase', 'Article', 'Design']
    },
    {
      'title': 'Languages',
      'items': [
        'Dart',
        'JavaScript',
        'Python',
        'Kotlin',
        'Java',
        'C++',
        'Go',
        'Objective-C',
        'HTML',
        'CSS'
      ]
    },
    {
      'title': 'Platforms',
      'items': ['Web', 'Android', 'iOS']
    }
  ],
  'colors': {
    'Dart': '#00b4ab',
    'JavaScript': '#f1e05a',
    'Python': '#3572a5',
    'Kotlin': '#f18e33',
    'Java': '#b07219',
    'C++': '#6866fb',
    'Go': '#375eab',
    'Objective-C': '#438eff',
    'HTML': '#e44b23',
    'CSS': '#563d7c',
    'Web': '#000000',
    'Android': '#3ddc84',
    'iOS': '#fc3d39',
    'Open source': '#ff8f42',
    'Flutter': '#02569b',
    'Firebase': '#ffa000',
    'Article': '#000000',
    'Design': '#e4505b'
  },
  'icons': {
    'Web': 'assets/web.png',
    'GitHub': 'assets/github.png',
    'StackOverflow': 'assets/stackoverflow.png',
    'Play Store': 'assets/play_store.png',
    'Medium': 'assets/medium.png',
    'Twitter': 'assets/twitter.png',
    'YouTube': 'assets/youtube.png',
    'Dart Pub': 'assets/dart_pub.png',
    'Reddit': 'assets/reddit.png'
  },
  'socials': [
    {
      'tag': '@creativecreatorormaybenot',
      'site': 'GitHub',
      'url': 'https://github.com/creativecreatorormaybenot'
    },
    {
      'tag': '@creativemaybeno',
      'site': 'Twitter',
      'url': 'https://twitter.com/creativemaybeno'
    },
    {
      'tag': '@creativecreatorormaybenot',
      'site': 'StackOverflow',
      'url': 'https://stackoverflow.com/users/6509751'
    },
    {
      'tag': '@creativecreatorormaybenot',
      'site': 'Medium',
      'url': 'https://medium.com/@creativecreatorormaybenot'
    },
    {
      'tag': '@creativecreatorormaybenot',
      'site': 'YouTube',
      'url': 'https://www.youtube.com/channel/UCDf73A8sVgbYKX192SLMn1w'
    },
    {
      'tag': '@creativemaybeno',
      'site': 'Reddit',
      'url': 'https://reddit.com/u/creativemaybeno'
    }
  ],
  'projects': [
    {
      'title': 'CaTeX',
      'description':
          'Created a Dart-native Flutter TeX renderer for simpleclub. This includes a TeX parser and a widget + rendering setup that I came up with on my own (: The implementation is quite low-level (as far as sensible Flutter implementations go), which also makes it extremely fast. It terms of performance and flexibility, it is superior to any other TeX plugin for Flutter that came before that.',
      'tags': ['Flutter', 'Dart', 'Open source', 'Article'],
      'links': [
        {'site': 'GitHub', 'url': 'https://github.com/simpleclub/CaTeX'},
        {
          'hint': 'Flutter web demo application for CaTeX',
          'url': 'https://simpleclub.github.io/CaTeX'
        },
        {
          'site': 'Twitter',
          'url':
              'https://twitter.com/creativemaybeno/status/1277981413657079809?s=20'
        },
        {'hint': 'Article coming soon!', 'url': ''}
      ]
    },
    {
      'title': 'Flutter Clock',
      'description':
          'Created a custom clock face for the Flutter Clock challenge. It was selected as the winner for Code Quality out of over 850 unique submissions 🚀 In this project, I made use of custom render objects to achieve full layout control - I also wrote an article about that. Moreover, everything was done in code, i.e. all animations and all design elements. I was able to achieve quite good skeuomorphism with the help of some custom fonts (:',
      'tags': ['Flutter', 'Dart', 'Design', 'Open source', 'Article'],
      'links': [
        {
          'site': 'GitHub',
          'url': 'https://github.com/creativecreatorormaybenot/clock'
        },
        {
          'site': 'Medium',
          'hint': 'Article about the creation process on Medium',
          'url':
              'https://medium.com/flutter-community/pure-flutterclock-face-every-line-customly-drawn-with-pixel-perfect-control-c27cba427801'
        },
        {
          'hint': 'Clock face running on Flutter web',
          'url': 'https://creativecreatorormaybenot.github.io/clock'
        },
        {
          'site': 'Medium',
          'hint': 'Contest Results as an article on Medium',
          'url':
              'https://medium.com/flutter/its-time-the-flutter-clock-contest-results-dcebe2eb3957'
        },
        {
          'site': 'Twitter',
          'url':
              'https://twitter.com/creativemaybeno/status/1219433528858959872?s=20'
        }
      ]
    },
    {
      'title': 'Wakelock plugin',
      'description':
          'A simple solution to keep the device screen awake in a Flutter app. The plugin is based on another plugin that was no longer maintained. So, I decided to create my own maintained version.',
      'tags': [
        'Open source',
        'Flutter',
        'Android',
        'iOS',
        'Web',
        'Dart',
        'Kotlin',
        'Objective-C',
        'JavaScript'
      ],
      'links': [
        {
          'site': 'Dart Pub',
          'hint': 'Plugin on Dart Pub',
          'url': 'https://pub.dev/packages/wakelock'
        },
        {
          'site': 'GitHub',
          'url': 'https://github.com/creativecreatorormaybenot/wakelock'
        }
      ]
    },
    {
      'title': 'Aso',
      'description':
          'Developed a Firebase driven Flutter app with a custom animation editor written in C++ (using dart:ffi) for Incom. The backend is written in JavaScript. Additionally, I created designs and even promotional videos.',
      'tags': [
        'Flutter',
        'Firebase',
        'Design',
        'Dart',
        'C++',
        'Android',
        'Web',
        'Java',
        'JavaScript',
        'HTML',
        'CSS'
      ],
      'links': [
        {'site': 'Web', 'hint': 'Aso website', 'url': 'https://aso.incom.xyz'},
        {
          'site': 'Play Store',
          'url': 'https://play.google.com/store/apps/details?id=incom.aso'
        },
        {
          'site': 'YouTube',
          'hint': 'Beta trailer on YouTube',
          'url': 'https://youtu.be/OFxJbqVlW_U'
        },
        {
          'site': 'Twitter',
          'url': 'https://twitter.com/incom__/status/1163788481149198336?s=20'
        }
      ]
    },
    {
      'title': 'Feature discovery package',
      'description':
          'A Flutter package that implements tap target feature discovery from a Material design spec. I am not the original author but majorly contributed later. This is Flutter-only, i.e. it has no native implementations, only design. However, it is more complex than the wakelock plugin.',
      'tags': ['Open source', 'Design', 'Flutter', 'Dart'],
      'links': [
        {
          'site': 'GitHub',
          'hint': 'GitHub repo',
          'url': 'https://github.com/ayalma/feature_discovery'
        },
        {
          'site': 'GitHub',
          'hint': 'Contributors on GitHub',
          'url':
              'https://github.com/ayalma/feature_discovery/graphs/contributors'
        },
        {
          'site': 'Dart Pub',
          'hint': 'Package on Dart Pub',
          'url': 'https://pub.dev/packages/feature_discovery'
        }
      ]
    },
    {
      'title': 'StackOverflow answers',
      'description':
          'I have been active on StackOverflow for quite a while. By now, most of my contributions to the network are Flutter related, which is why I included it in here. It offers an amazing way to share knowledge with others, which I appreciate a lot. I find (concise) article-esque answers most useful, which is also why some of my answers are very elaborate and could have easily been published as articles. The highest voted answers should be of decent quality, however, the votes do not exactly match how well an answer was written. Thus, I will share highlights going forward (example Twitter post linked).',
      'tags': [
        'Article',
        'Flutter',
        'Dart',
        'Firebase',
        'Kotlin',
        'Android',
        'JavaScript',
        'Java',
        'Python',
        'Go',
        'HTML',
        'CSS'
      ],
      'links': [
        {
          'site': 'StackOverflow',
          'url': 'https://stackoverflow.com/users/6509751'
        },
        {
          'site': 'Medium',
          'hint': 'Medium article about SO that might be of interest',
          'url':
              'https://medium.com/@creativecreatorormaybenot/sites-shamelessly-ripping-off-stack-overflow-content-4c10597ade57'
        },
        {
          'site': 'Twitter',
          'hint': 'Example highlight post',
          'url':
              'https://twitter.com/creativemaybeno/status/1224895128059482112?s=20'
        }
      ]
    },
    {
      'title': 'flutter/plugins & more',
      'description':
          'This is my part to the plugins and packages officially maintained by the Flutter team. That would be flutter/plugins and flutter/packages contributions. Initially, the Firebase plugins for Flutter were also part of flutter/plugins. They were later moved to FirebaseExtended/flutterfire, where I am a frequent contributor. Nevertheless, I have also contributed to other plugins in flutter/plugins :)',
      'tags': [
        'Open source',
        'Flutter',
        'Firebase',
        'Android',
        'iOS',
        'Dart',
        'Java',
        'Objective-C'
      ],
      'links': [
        {
          'site': 'GitHub',
          'hint': 'Commits to flutter/plugins',
          'url':
              'https://github.com/flutter/plugins/commits?author=creativecreatorormaybenot'
        },
        {
          'site': 'GitHub',
          'hint': 'Commits to FirebaseExtended/flutterfire',
          'url':
              'https://github.com/FirebaseExtended/flutterfire/commits?author=creativecreatorormaybenot'
        },
        {
          'site': 'GitHub',
          'hint': 'Commits to flutter/packages',
          'url':
              'https://github.com/flutter/packages/commits?author=creativecreatorormaybenot'
        }
      ]
    },
    {
      'title': 'Flutter framework contributions',
      'description':
          'In terms of the Flutter framework, I mostly committed to flutter/flutter. Furthermore, I have also created some commits in the other Flutter and Dart (dart-lang) repos. However, you can search for these if you really want to :) I only linked to the flutter/flutter commits here and the plugin and packages commits in the other card. Contributions to the other repositories are extremely spread out.',
      'tags': ['Open source', 'Flutter', 'Dart'],
      'links': [
        {
          'site': 'GitHub',
          'hint': 'Commits to flutter/flutter',
          'url':
              'https://github.com/flutter/flutter/commits?author=creativecreatorormaybenot'
        }
      ]
    },
    {
      'title': 'Portfolio',
      'description':
          'I think we might have some inception going on here, right? Jokes aside, this portfolio is also a Flutter project of mine and the source code is available on GitHub :) I had some fun with JSON serialization building it because it turns out that this makes maintaining the portfolio a blessing (: In total, this is also a Flutter web demonstration.',
      'tags': ['Flutter', 'Web', 'Open source', 'Dart'],
      'links': [
        {
          'site': 'GitHub',
          'url': 'https://github.com/creativecreatorormaybenot/portfolio'
        },
        {
          'site': 'Web',
          'hint': 'This portfolio running on Flutter Web',
          'url': 'https://creativecreatorormaybenot.github.io/portfolio'
        },
        {
          'site': 'Twitter',
          'url':
              'https://twitter.com/creativemaybeno/status/1229191827707899906?s=20'
        }
      ]
    }
  ]
};
