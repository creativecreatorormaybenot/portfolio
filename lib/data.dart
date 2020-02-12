import 'dart:ui';

import 'package:flutter/painting.dart';
import 'package:json_annotation/json_annotation.dart';

/// Build using `flutter packages pub run build_runner build` in the project directory.
part 'data.g.dart';

@JsonSerializable()
class PortfolioData {
  final List<Filter> filters;

  @JsonKey(fromJson: colorsFromJson, toJson: _unimplemented)
  final Map<String, Color> colors;

  @JsonKey(fromJson: iconsFromJson, toJson: _unimplemented)
  final Map<String, AssetImage> icons; // todo scale down play store icon - remove old file from Git history

  final List<Project> project;

  PortfolioData(this.filters, this.colors, this.icons, this.project);

  factory PortfolioData.fromJson(Map<String, dynamic> json) => _$PortfolioDataFromJson(json);

  static Map<String, Color> colorsFromJson(Map<String, String> json) {
    return json.map((key, value) => MapEntry(key, Color(int.parse(value.substring(1), radix: 16))));
  }

  static Map<String, AssetImage> iconsFromJson(Map<String, String> json) {
    return json.map((key, value) => MapEntry(key, AssetImage(value)));
  }
}

@JsonSerializable()
class Filter {
  final String name;

  final List<String> items;

  Filter(this.name, this.items);
}

@JsonSerializable()
class Project {
  final String title, description;

  final List<String> categories;

  final List<Link> links;

  Project(this.title, this.description, this.categories, this.links);
}

@JsonSerializable()
class Link {
  final String type, url;

  Link(this.type, this.url);
}

Map _unimplemented(dynamic value) => throw UnimplementedError();

@JsonLiteral('../assets/data.json')
PortfolioData get portfolioData => PortfolioData.fromJson(_$portfolioDataJsonLiteral);
