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
    json['project'] as List,
  );
}

Map<String, dynamic> _$PortfolioDataToJson(PortfolioData instance) =>
    <String, dynamic>{
      'filters': instance.filters,
      'colors': _unimplemented(instance.colors),
      'icons': _unimplemented(instance.icons),
      'project': instance.project,
    };

Filter _$FilterFromJson(Map<String, dynamic> json) {
  return Filter(
    json['name'] as String,
    (json['items'] as List)?.map((e) => e as String)?.toList(),
  );
}

Map<String, dynamic> _$FilterToJson(Filter instance) => <String, dynamic>{
      'name': instance.name,
      'items': instance.items,
    };

// **************************************************************************
// JsonLiteralGenerator
// **************************************************************************

final _$portfolioDataJsonLiteral = {
  'filters': [
    {
      'name': 'Categories',
      'items': ['Open source', 'Flutter', 'Firebase', 'Article']
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
    'Article': '#000000'
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
  'projects': []
};
