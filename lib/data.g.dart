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
        ?.map((e) =>
            e == null ? null : Filter.fromJson(e as Map<String, dynamic>))
        ?.toList(),
    PortfolioData.colorsFromJson(json['colors'] as Map<String, String>),
    PortfolioData.iconsFromJson(json['icons'] as Map<String, String>),
    (json['socials'] as List)
        ?.map((e) =>
            e == null ? null : Social.fromJson(e as Map<String, dynamic>))
        ?.toList(),
    (json['projects'] as List)
        ?.map((e) =>
            e == null ? null : Project.fromJson(e as Map<String, dynamic>))
        ?.toList(),
  );
}

Filter _$FilterFromJson(Map<String, dynamic> json) {
  return Filter(
    json['name'] as String,
    (json['items'] as List)?.map((e) => e as String)?.toList(),
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
    (json['categories'] as List)?.map((e) => e as String)?.toList(),
    (json['links'] as List)
        ?.map(
            (e) => e == null ? null : Link.fromJson(e as Map<String, dynamic>))
        ?.toList(),
  );
}

Link _$LinkFromJson(Map<String, dynamic> json) {
  $checkKeys(json, requiredKeys: const ['url']);
  return Link(
    json['site'] as String ?? 'Web',
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
      'name': 'Categories',
      'items': ['Open source', 'Flutter', 'Firebase', 'Article', 'Design']
    },
    {
      'name': 'Languages',
      'items': [
        'Dart',
        'JavaScript',
        'Python',
        'Kotlin',
        'Java',
        'C++',
        'Go',
        'Objective-C'
      ]
    },
    {
      'name': 'Platforms',
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
    'Web': '#000000',
    'Android': '#3ddc84',
    'iOS': '#fc3d39',
    'Open source': '#63e6be',
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
      'url': 'https://github.com/creativecreatorormaybenot/clock'
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
      'tag': '@creativemaybeno',
      'site': 'Twitter',
      'url': 'https://twitter.com/creativemaybeno'
    },
    {
      'tag': '@creativemaybeno',
      'site': 'Reddit',
      'url': 'https://reddit.com/u/creativemaybeno'
    }
  ],
  'projects': [
    {
      'title': 'Flutter Clock challenge submission',
      'description':
          'Created a clock face for the Flutter Clock challenge and [confidential]. In this project, I made use of custom render objects to achieve full layout control - I also wrote an article about that.',
      'categories': ['Flutter', 'Dart', 'Open source', 'Design', 'Article'],
      'links': [
        {
          'site': 'GitHub',
          'url': 'https://github.com/creativecreatorormaybenot/clock'
        },
        {
          'site': 'Medium',
          'hint': 'Article about the creation process on Medium',
          'url': 'https://link.medium.com/7AMS0mNUF3'
        },
        {
          'hint': 'Clock face running on Flutter web',
          'url': 'https://creativecreatorormaybenot.github.io/clock'
        },
        {
          'site': 'Twitter',
          'url':
              'https://twitter.com/creativemaybeno/status/1219433528858959872?s=20'
        },
        {
          'hint': 'Announcement of [confidential]',
          'url': 'TODO: link to [confidential]'
        }
      ]
    },
    {
      'title': 'Material Design Feature Discovery Flutter plugin',
      'description':
          'A plugin for Flutter that implements tap target feature discovery from a Material design spec. I am not the author of the plugin - I majorly contributed later.',
      'categories': ['Flutter', 'Dart', 'Open source', 'Design'],
      'links': [
        {
          'site': 'GitHub',
          'hint': 'Plugin repository on GitHub',
          'url': 'https://github.com/ayalma/feature_discovery'
        },
        {
          'site': 'GitHub',
          'hint': 'Contributor page of the plugin on GitHub',
          'url':
              'https://github.com/ayalma/feature_discovery/graphs/contributors'
        },
        {
          'site': 'Dart Pub',
          'hint': 'Plugin on Dart Pub',
          'url': 'https://pub.dev/packages/feature_discovery'
        }
      ]
    },
    {
      'title': 'Portfolio',
      'description':
          'I think we might have some inception going on here, right? Jokes aside, this portfolio is also a Flutter project of mine and the source code is also available on GitHub :) I had some fun with JSON serialization building it because it turns out that this makes adding to the portfolio a blessing (:',
      'categories': ['Flutter', 'Dart', 'Open source'],
      'links': [
        {
          'site': 'GitHub',
          'url': 'https://github.com/creativecreatorormaybenot/portfolio'
        },
        {
          'site': 'Web',
          'hint': 'This portfolio running on Flutter Web',
          'url': 'https://creativecreatorormaybenot.github.io/portfolio'
        }
      ]
    }
  ]
};
