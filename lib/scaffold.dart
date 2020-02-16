import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:portfolio/card.dart';
import 'package:portfolio/data.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

class App extends StatelessWidget {
  const App({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'creativecreatorormaybenot\'s Flutter portfolio',
      theme: ThemeData.light().copyWith(
        iconTheme: IconThemeData(size: 24),
        primaryColor: const Color(0xff7f7f7f),
        primaryColorDark: const Color(0xff4a4a4a),
        primaryColorLight: const Color(0xffb0b0b0),
        backgroundColor: const Color(0xff303030),
        accentColor: const Color(0xffacacac),
        splashColor: const Color(0xaaffffff),
        highlightColor: const Color(0x88ffffff),
        focusColor: const Color(0x77ffffff),
        hoverColor: const Color(0x66ffffff),
      ),
      home: Provider(
        create: (context) => portfolioData,
        child: const LayoutScaffold(),
      ),
    );
  }
}

class LayoutScaffold extends StatefulWidget {
  static double crossAxisTileExtent = 384;

  const LayoutScaffold({Key key}) : super(key: key);

  @override
  _LayoutScaffoldState createState() => _LayoutScaffoldState();
}

class _LayoutScaffoldState extends State<LayoutScaffold> {
  String _filter;

  @override
  Widget build(BuildContext context) {
    final projects = List.of(PortfolioData.of(context).projects);

    if (_filter != null) {
      projects.removeWhere((element) => !element.tags.contains(_filter));
    }

    return Row(
      // The items are ordered in reverse so that the elevation from the material of the left section can draw a shadow.
      textDirection: TextDirection.rtl,
      children: <Widget>[
        Flexible(
          flex: 11,
          fit: FlexFit.tight,
          child: Material(
            color: Theme.of(context).backgroundColor,
            child: LayoutBuilder(
              builder: (context, constraints) {
                final count = max(1, constraints.biggest.width ~/ LayoutScaffold.crossAxisTileExtent);

                return StaggeredGridView.countBuilder(
                  padding: const EdgeInsets.all(16),
                  crossAxisCount: count,
                  itemCount: projects.length,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  staggeredTileBuilder: (int index) => StaggeredTile.fit(1),
                  itemBuilder: (context, index) => ProjectCard(projects[index]),
                );
              },
            ),
          ),
        ),
        Flexible(
          flex: 3,
          fit: FlexFit.tight,
          child: Material(
            elevation: 8,
            color: Theme.of(context).primaryColorDark,
            child: SizedBox(
              height: double.infinity,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: <Widget>[
                    LayoutBuilder(
                      // This allows to size the avatar relatively and apply the same padding vertically (which would not work with a Row).
                      builder: (context, constraints) {
                        final padding = constraints.biggest.width / 9.9;

                        return Padding(
                          padding: EdgeInsets.all(padding),
                          child: PhysicalModel(
                            shape: BoxShape.circle,
                            elevation: 4,
                            color: Colors.transparent,
                            child: ClipOval(
                              child: Image(
                                image: AssetImage('assets/avatar.png'),
                                fit: BoxFit.fitWidth,
                                alignment: Alignment.center,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Card(
                        color: Theme.of(context).primaryColorLight,
                        elevation: 1,
                        child: Padding(
                          padding: const EdgeInsets.all(4),
                          child: Column(
                            // The socials are wrapped in another column in order to align all of them at a common start point.
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              for (final social in Provider.of<PortfolioData>(context).socials) SocialTile(social),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(4),
                      child: Card(
                        color: Theme.of(context).primaryColorLight,
                        elevation: 1,
                        child: Filters(
                          selected: _filter,
                          onSelect: (tag) {
                            setState(() {
                              if (_filter == tag) {
                                _filter = null;
                              } else {
                                _filter = tag;
                              }
                            });
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class SocialTile extends StatelessWidget {
  final Social social;

  const SocialTile(this.social, {Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) => Tooltip(
        message: '${social.tag} on ${social.site}',
        child: InkWell(
          onTap: () => launch(social.url),
          child: Padding(
            padding: const EdgeInsets.only(top: 3, bottom: 3, left: 5),
            child: Wrap(
              direction: Axis.horizontal,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: <Widget>[
                Text(social.tag),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 5),
                  child: SiteIcon(social.site),
                ),
              ],
            ),
          ),
        ),
      );
}

class Filters extends StatelessWidget {
  final void Function(String tag) onSelect;

  final String selected;

  const Filters({
    Key key,
    this.onSelect,
    this.selected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: Theme.of(context).copyWith(
        // The accent color is used for the expansion tile text and icon when expanded.
        accentColor: const Color(0xff101010),
      ),
      child: Material(
        color: Theme.of(context).primaryColorLight,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            for (final filter in PortfolioData.of(context).filters)
              IntrinsicWidth(
                child: ExpansionTile(
                  title: Text(filter.title),
                  onExpansionChanged: (expanded) {
                    if (!expanded) {
                      // Remove filter when the expansion tile containing the filter is retracted.

                      if (selected != null && filter.items.contains(selected)) {
                        onSelect(selected);
                      }
                    }
                  },
                  children: <Widget>[
                    for (final item in filter.items)
                      Padding(
                        padding: const EdgeInsets.only(left: 8),
                        child: DefaultTextStyle(
                          style: (item == selected ? Theme.of(context).textTheme.button : Theme.of(context).textTheme.bodyText2)
                              .copyWith(fontSize: item == selected ? 14 : 13),
                          child: InkWell(
                            onTap: () => onSelect(item),
                            child: Tag(item),
                          ),
                        ),
                      ),
                  ],
                ),
              )
          ],
        ),
      ),
    );
  }
}

class ExpandableTile extends StatefulWidget {
  final Widget title;

  final List<Widget> children;

  final void Function(bool expanded) onExpansionChanged;

  const ExpandableTile({
    Key key,
    this.title,
    this.children,
    this.onExpansionChanged,
  }) : super(key: key);

  @override
  State createState() => _ExpandableTileState();
}

class _ExpandableTileState extends State<ExpandableTile> {
  bool _expanded;

  @override
  void initState() {
    super.initState();

    _expanded = true;
  }

  void _toggle() {
    setState(() {
      _expanded = !_expanded;
    });

    widget.onExpansionChanged(_expanded);
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: _toggle,
      canRequestFocus: true,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            widget.title,
            if (_expanded) ...widget.children,
          ],
        ),
      ),
    );
  }
}
