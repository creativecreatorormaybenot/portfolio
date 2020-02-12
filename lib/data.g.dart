// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'data.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PortfolioData _$PortfolioDataFromJson(Map<String, dynamic> json) {
  return PortfolioData(
    (json['filters'] as List)
        ?.map((e) =>
            e == null ? null : Filter.fromJson(e as Map<String, dynamic>))
        ?.toList(),
    PortfolioData.colorsFromJson(json['colors'] as Map<String, String>),
    PortfolioData.iconsFromJson(json['icons'] as Map<String, String>),
    (json['project'] as List)
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
  $checkKeys(json, requiredKeys: const ['type', 'url']);
  return Link(
    json['type'] as String,
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
    'YouTube': 'assets/youtube.png'
  },
  'projects': [
    {
      'title': 'Flutter Clock challenge - Clock Display',
      'description':
          'Created a clock face for the Flutter Clock challenge and [confidential]. In this project, I made use of custom render objects to achieve full layout control - I also wrote an article about that.',
      'categories': ['Flutter', 'Dart', 'Open source', 'Design', 'Article'],
      'links': [
        {
          'type': 'GitHub',
          'url': 'https://github.com/creativecreatorormaybenot/clock'
        },
        {
          'type': 'Medium',
          'hint': 'Article about the creation process on Medium',
          'url': 'https://link.medium.com/7AMS0mNUF3'
        },
        {
          'type': 'Web',
          'hint': 'Clock face running on Flutter web',
          'url': 'https://github.com/creativecreatorormaybenot/clock'
        },
        {
          'type': 'Twitter',
          'url':
              'https://twitter.com/creativemaybeno/status/1219433528858959872?s=20'
        },
        {
          'type': 'Web',
          'hint': 'Announcement of [confidential]',
          'url': 'TODO: link to [confidential]'
        }
      ]
    }
  ]
};
