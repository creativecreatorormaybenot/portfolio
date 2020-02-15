import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:provider/provider.dart';

/// Build using `flutter packages pub run build_runner build` in the project directory.
part 'data.g.dart';

@JsonSerializable(createToJson: false)
class PortfolioData {
  static PortfolioData of(BuildContext context) => Provider.of<PortfolioData>(context);

  @JsonKey(required: true)
  final List<Filter> filters;

  @JsonKey(required: true, fromJson: colorsFromJson, toJson: _unimplemented)
  final Map<String, Color> colors;

  @JsonKey(required: true, fromJson: iconsFromJson, toJson: _unimplemented)
  final Map<String, AssetImage> icons;

  @JsonKey(required: true)
  final List<Social> socials;

  @JsonKey(required: true)
  final List<Project> projects;

  PortfolioData(this.filters, this.colors, this.icons, this.socials, this.projects);

  factory PortfolioData.fromJson(Map<String, dynamic> json) => _$PortfolioDataFromJson(json);

  static Map<String, Color> colorsFromJson(Map<String, String> json) {
    return json.map((key, value) => MapEntry(key, Color(int.parse(value.substring(1), radix: 16)).withOpacity(1)));
  }

  static Map<String, AssetImage> iconsFromJson(Map<String, String> json) {
    return json.map((key, value) => MapEntry(key, AssetImage(value)));
  }
}

@JsonSerializable(createToJson: false)
class Filter {
  final String name;

  final List<String> items;

  Filter(this.name, this.items);

  factory Filter.fromJson(Map<String, dynamic> json) => _$FilterFromJson(json);
}

@JsonSerializable(createToJson: false)
class Social {
  final String tag, site, url;

  Social(this.tag, this.site, this.url);

  factory Social.fromJson(Map<String, dynamic> json) => _$SocialFromJson(json);
}

@JsonSerializable(createToJson: false)
class Project {
  final String title, description;

  final List<String> tags;

  final List<Link> links;

  Project(this.title, this.description, this.tags, this.links);

  factory Project.fromJson(Map<String, dynamic> json) => _$ProjectFromJson(json);
}

@JsonSerializable(createToJson: false)
class Link {
  @JsonKey(defaultValue: 'Web')
  final String site;

  @JsonKey(required: true)
  final String url;

  final String hint;

  Link(this.site, this.url, this.hint);

  factory Link.fromJson(Map<String, dynamic> json) => _$LinkFromJson(json);
}

Map _unimplemented(dynamic value) => throw UnimplementedError();

@JsonLiteral('../assets/data.json')
PortfolioData get portfolioData => PortfolioData.fromJson(_$portfolioDataJsonLiteral);
